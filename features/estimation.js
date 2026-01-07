(function () {
  "use strict";

  window.onerror = function (message, source, lineno, colno, error) {
    const box = document.createElement("pre");
    box.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 40%;
    overflow: auto;
    background: #111;
    color: #f55;
    padding: 10px;
    font-size: 12px;
    z-index: 999999;
  `;
    box.textContent =
      "JS ERROR:\n" +
      message +
      "\n\n" +
      (error && error.stack ? error.stack : "No stack");
    document.body.appendChild(box);
  };


  const $ = window.jQuery;

  const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xml:space="preserve"><g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"><path d="M 40.135 90 h -8.782 c -1.519 0 -2.75 -1.231 -2.75 -2.75 V 49.854 c 0 -1.519 1.231 -2.75 2.75 -2.75 h 8.782 c 1.519 0 2.75 1.231 2.75 2.75 V 87.25 C 42.885 88.769 41.654 90 40.135 90 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(255,195,110); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/><path d="M 58.647 90 h -8.782 c -1.519 0 -2.75 -1.231 -2.75 -2.75 V 42.876 c 0 -1.519 1.231 -2.75 2.75 -2.75 h 8.782 c 1.519 0 2.75 1.231 2.75 2.75 V 87.25 C 61.397 88.769 60.165 90 58.647 90 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(165,215,110); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/><path d="M 21.624 90 h -8.782 c -1.519 0 -2.75 -1.231 -2.75 -2.75 V 67.813 c 0 -1.519 1.231 -2.75 2.75 -2.75 h 8.782 c 1.519 0 2.75 1.231 2.75 2.75 V 87.25 C 24.374 88.769 23.142 90 21.624 90 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(210,85,90); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/><path d="M 77.158 90 h -8.782 c -1.519 0 -2.75 -1.231 -2.75 -2.75 V 30.331 c 0 -1.519 1.231 -2.75 2.75 -2.75 h 8.782 c 1.519 0 2.75 1.231 2.75 2.75 V 87.25 C 79.908 88.769 78.677 90 77.158 90 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(120,210,190); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/><polygon points="18.74,49.47 15.72,46.85 34.68,25.05 53.32,21.13 71.44,4.93 74.1,7.91 55.19,24.83 36.81,28.68 " style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(175,185,210); fill-rule: nonzero; opacity: 1;" transform="  matrix(1 0 0 1 0 0) "/><circle cx="17.284" cy="48.373999999999995" r="6.464" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(175,185,210); fill-rule: nonzero; opacity: 1;" transform="  matrix(1 0 0 1 0 0) "/><circle cx="35.744" cy="27.284" r="6.464" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(175,185,210); fill-rule: nonzero; opacity: 1;" transform="  matrix(1 0 0 1 0 0) "/><circle cx="54.254" cy="22.234" r="6.464" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(175,185,210); fill-rule: nonzero; opacity: 1;" transform="  matrix(1 0 0 1 0 0) "/><circle cx="72.764" cy="6.414000000000001" r="6.464" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(175,185,210); fill-rule: nonzero; opacity: 1;" transform="  matrix(1 0 0 1 0 0) "/></g></svg>`;
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

    const wrapper = $(".itemsWrapper-TTIS7");
    if (!wrapper.length) return;

    const button = $("<button/>")
      .attr({
        id: "show-grid",
        "aria-label": "Overzicht",
        tabindex: "-1",
      })
      .addClass("button-mJfIq")
      .on("click", openGrid)
      .append(
        $("<div/>")
          .attr({
            "data-type": "icon",
            "data-shape": "square",
            "aria-hidden": "true",
          })
          .addClass("icon-dus_u graphic-g55I1 small-Du6aA")
          .css("--size", "24px")
          .html(ICON_SVG)
      )
      .append(
        $("<div/>")
          .attr({
            "aria-hidden": "true",
            label: " Overzicht",
          })
          .addClass("label-dOebJ")
          .text(" Overzicht")
      );


    const optionWrapper = $("<div/>")
      .addClass("optionWrapper-IEDUX")
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
          overallTotalRow.append($("<th/>").text("Total"));
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
          period_buttons.prepend($("<span/>").text("Select period: "));
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

  function onLoad() {
    smartschool_loadStyles("css/estimation.css");

    if ($("#modal-background").length === 0) {
      $("body")
        .append($("<div/>").attr("id", "modal-background"))
        .append(
          $("<div/>")
            .attr("id", "modal-content")
            .append($("<button/>").attr("id", "modal-close").text("Close"))
            .append(makeGrid())
        );

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
      const wrapper = await waitForSelector(".itemsWrapper-TTIS7", 15000);
      itemsWrapperObserver.observe(wrapper[0], {
        childList: true,
        subtree: false,
      });

      onLoad();
      addButton();
    } catch (err) {
      console.error("Smartschool Grid: failed to initialize:", err);
    }
  })();

})();
