(function () {
  "use strict";

  const $ = window.jQuery;

  const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xml:space="preserve"><g style="strok[...]`;
  const ICON_URL = "data:image/svg+xml;utf8," + encodeURIComponent(ICON_SVG);

  function waitForSelector(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const el = $(selector);
      if (el.length) return resolve(el);
      const observer = new MutationObserver(() => {
        const e = $(selector);
        if (e.length) {
          observer.disconnect();
          resolve(e);
        }
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
      if (timeout > 0) {
        setTimeout(() => {
          observer.disconnect();
          reject(new Error("Timeout waiting for selector: " + selector));
        }, timeout);
      }
    });
  }

  function addButton() {
    if ($("#show-grid").length) return;

    const wrapper = $(".SidebarView-module_itemsWrapper__nO6eD");
    if (!wrapper.length) return;

    const button = $("<button/>")
      .attr({
        id: "show-grid",
        "aria-label": "Overzicht",
        tabindex: "-1",
      })
      .addClass("OptionView-module_button__PxKGi")
      .on("click", openGrid)
      .append(
        $("<div/>")
          .attr({
            "data-type": "icon",
            "data-shape": "square",
            "aria-hidden": "true",
          })
          .addClass("icon-dus_u graphic-g55I1 small-Du6aA graphic-module_graphic__atMsS")
          .css("--size", "24px")
          .html(ICON_SVG)
      )
      .append(
        $("<div/>")
          .attr({
            "aria-hidden": "true",
            label: " Overzicht",
          })
          .addClass("OptionView-module_label__3mOnu")
          .text(" Overzicht")
      );


    const optionWrapper = $("<div/>")
      .addClass("OptionView-module_optionWrapper__sUAD3")
      .attr({
        "data-selected": "false",
        "data-collapsed": "true",
      })
      .append(button);

    wrapper.append(optionWrapper);
  }


  function totalToStr(total_numerator, total_denominator) {
    return (
      (
        Math.round((total_numerator / total_denominator) * 1000) / 10
      ).toString() + "%"
    );
  }

  function makeGrid() {
    let loading = $("<h3>Loading!</h3>");
    fetch("/results/api/v1/evaluations?itemsOnPage=500")
      .then((r) => r.json())
      .then((results) => {
        let data = {};
        let course_to_graphic = {};
        let latest_period = null;
        for (const result of results) {
          if (result["type"] != "normal") {
            continue;
          }
          let period = result["period"]["name"];
          if (latest_period === null) {
            latest_period = period;
          }
          if (!(period in data)) {
            data[period] = {};
          }

          period = data[period];
          for (const course of result["courses"]) {
            course_to_graphic[course["name"]] = course["graphic"];
            const course_name = course["name"];
            if (!(course_name in period)) {
              period[course_name] = [];
            }
            period[course_name].push({
              date: result["date"],
              name: result["name"],
              graphic: result["graphic"],
            });
          }
        }

        for (let period_name of Object.keys(data)) {
          let period = data[period_name];

          let grid = $("<div/>")
            .attr("id", "period")
            .append($("<h2/>").text(period_name + ":"));
          let table = $("<table/>").attr("id", "result-table");

          let longest = 0;
          for (let [_, course] of Object.entries(period)) {
            course.sort((a, b) => {
              return a["date"].localeCompare(b["date"]);
            });
            if (course.length > longest) {
              longest = course.length;
            }
          }
          let disc_row = $("<tr/>");
          for (let i = 0; i < longest + 1; i++) {
            disc_row.append($("<td/>").addClass("hidden-cell"));
          }
          disc_row.append($("<td/>").attr("id", "disclamer").text("!"));
          table.append(disc_row);

          let overallTotalNumerator = 0;
          let overallTotalDenominator = 0;

          for (let [course_name, course] of Object.entries(period)) {
            let row = $("<tr/>");
            if (
              course_to_graphic[course_name] &&
              course_to_graphic[course_name].type == "icon"
            ) {
              row.append(
                $("<th/>").append(
                  $("<span/>")
                    .addClass(
                      "icon-label icon-label--24 smsc-svg--" +
                      course_to_graphic[course_name]["value"] +
                      "--24"
                    )
                    .text(course_name)
                )
              );
            } else {
              row.append($("<th/>").text(course_name));
            }

            let total_numerator = 0;
            let total_denominator = 0;

            for (const result of course) {
              const desc = result["graphic"]["description"];
              const color = result["graphic"]["color"];
              const name = result["name"];
              let cellDesc = desc || "/"; // If desc is empty, use "/"

              row.append(
                $("<td/>")
                  .addClass("c-" + color + "-combo--300")
                  .attr({ id: "details", content: name })
                  .text(cellDesc)
              );

              let match = (desc || "").match(/^([\d\,\.]+)\/([\d\,\.]+)$/);
              if (match) {
                total_numerator += parseFloat(match[1].replace(",", "."));
                total_denominator += parseFloat(match[2].replace(",", "."));
              }
            }

            for (let i = 0; i < longest - course.length; i++) {
              row.append($("<td/>"));
            }

            let last_cell = $("<td/>").addClass("total");
            if (total_denominator != 0) {
              last_cell.text(totalToStr(total_numerator, total_denominator));
              if (total_numerator / total_denominator < 0.5) {
                last_cell.addClass("is-low");
              }
            }
            row.append(last_cell);

            overallTotalNumerator += total_numerator;
            overallTotalDenominator += total_denominator;

            table.append(row);
          }

          let overallTotalRow = $("<tr/>");
          overallTotalRow.append($("<th/>").text("Totaal"));
          for (let i = 0; i < longest; i++) {
            overallTotalRow.append($("<td/>"));
          }
          let overallTotalCell = $("<td/>").addClass("total");
          if (overallTotalDenominator != 0) {
            overallTotalCell.text(
              totalToStr(overallTotalNumerator, overallTotalDenominator)
            );
            if (overallTotalNumerator / overallTotalDenominator < 0.5) {
              overallTotalCell.addClass("is-low");
            }
          }
          overallTotalRow.append(overallTotalCell);
          table.append(overallTotalRow);

          grid.append($("<div/>").attr("id", "table-container").append(table));
          data[period_name] = grid;
        }

        let modal = $("<div/>").attr("id", "content-container");
        let period_buttons = $("<div/>");
        let main_grid = $("<div/>").attr("id", "period-container");
        for (let [period_name, grid] of Object.entries(data).reverse()) {
          period_buttons.append(
            $("<button/>")
              .addClass("period_button")
              .text(period_name)
              .click(
                ((grid) => {
                  return () => {
                    main_grid.empty();
                    main_grid.append(grid);
                  };
                })(grid)
              )
          );
        }
        if (period_buttons.children().length > 1) {
          period_buttons.prepend($("<span/>").text("Selecteer periode: "));
          modal.append(period_buttons);
        }

        if (latest_period !== null) {
          main_grid.append(data[latest_period]);
        }
        modal.append(main_grid);
        loading.replaceWith(modal);
      })
      .catch((err) => {
        loading.text("Failed loading results");
        loading.append(
          $("<pre/>").css({
            color: "red",
            whiteSpace: "pre-wrap",
            fontSize: "12px",
          }).text(err.stack || err.message || err)
        );
      });

    return loading;
  }

  async function onLoad() {
    smartschool_loadStyles("css/estimation.css");

    if ($("#modal-background").length === 0) {
      // Build the elements we previously appended to the body, but wrap them in a container
      const contentWrapper = $("<div/>")
        .append($("<div/>").attr("id", "modal-background"))
        .append(
          $("<div/>")
            .attr("id", "modal-content")
            .append($("<button/>").attr("id", "modal-close").text("X"))
            .append(makeGrid())
        );

      const container = $("<div>", {
        id: "smartschool-estimation",
        css: {
          width: "100%",
          height: "auto",
          border: "none",
          display: "block",
        },
        html: contentWrapper.prop("outerHTML"),
      });

      await smartschool_addElement({
        parentSelector: "body",
        elementId: "smartschool-estimation",
        content: container.prop("outerHTML"),
        insertType: "append",
      });

      // Re-bind the close handlers on the newly inserted elements
      $("#modal-background, #modal-close").click(function () {
        $("#modal-content, #modal-background").toggleClass("active");
      });
    }
  }

  function openGrid() {
    $("#modal-content, #modal-background").toggleClass("active");
  }

  let itemsWrapperObserver = new MutationObserver(() => {
    addButton();
  });

  (async function init() {
    try {
      const wrapper = await waitForSelector(".sidebar-results", 15000);
      itemsWrapperObserver.observe(wrapper[0], {
        childList: true,
        subtree: false,
      });

      await onLoad();
      addButton();
    } catch (err) {
      console.error("Smartschool Grid: failed to initialize:", err);
    }
  })();

})();
