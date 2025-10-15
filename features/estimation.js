(function () {
  'use strict';

  const $ = window.jQuery;

  const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256"><g transform="scale(2.8 2.8)"><path d="M40.135 90h-8.782c-1.519 0-2.75-1.231-2.75-2.75V49.854c0-1.519 1.231-2.75 2.75-2.75h8.782c1.519 0 2.75 1.231 2.75 2.75V87.25c0 1.519-1.231 2.75-2.75 2.75z" fill="#FFC36E"/><path d="M58.647 90h-8.782c-1.519 0-2.75-1.231-2.75-2.75V42.876c0-1.519 1.231-2.75 2.75-2.75h8.782c1.519 0 2.75 1.231 2.75 2.75V87.25c0 1.519-1.231 2.75-2.75 2.75z" fill="#A5D76E"/><path d="M21.624 90h-8.782c-1.519 0-2.75-1.231-2.75-2.75V67.813c0-1.519 1.231-2.75 2.75-2.75h8.782c1.519 0 2.75 1.231 2.75 2.75V87.25c0 1.519-1.231 2.75-2.75 2.75z" fill="#D2555A"/><path d="M77.158 90h-8.782c-1.519 0-2.75-1.231-2.75-2.75V30.331c0-1.519 1.231-2.75 2.75-2.75h8.782c1.519 0 2.75 1.231 2.75 2.75V87.25c0 1.519-1.231 2.75-2.75 2.75z" fill="#78D2BE"/><polygon points="18.74,49.47 15.72,46.85 34.68,25.05 53.32,21.13 71.44,4.93 74.1,7.91 55.19,24.83 36.81,28.68" fill="#AFB9D2"/><circle cx="17.284" cy="48.374" r="6.464" fill="#AFB9D2"/><circle cx="35.744" cy="27.284" r="6.464" fill="#AFB9D2"/><circle cx="54.254" cy="22.234" r="6.464" fill="#AFB9D2"/><circle cx="72.764" cy="6.414" r="6.464" fill="#AFB9D2"/></g></svg>`;
  const ICON_URL = 'data:image/svg+xml;utf8,' + encodeURIComponent(ICON_SVG);

  function totalToStr(num, den) {
    return (Math.round(num / den * 1000) / 10).toString() + '%';
  }

  function makeGrid() {
    const loading = $("<h3>Loading!</h3>");

    fetch('/results/api/v1/evaluations?itemsOnPage=500')
      .then(r => r.json())
      .then(results => {
        const data = {};
        const course_to_graphic = {};
        let latest_period = null;

        for (const result of results) {
          if (result.type !== "normal") continue;
          const periodName = result.period.name;
          if (latest_period === null) latest_period = periodName;
          if (!(periodName in data)) data[periodName] = {};
          const periodObj = data[periodName];

          for (const course of result.courses) {
            course_to_graphic[course.name] = course.graphic;
            if (!(course.name in periodObj)) periodObj[course.name] = [];
            periodObj[course.name].push({
              date: result.date,
              name: result.name,
              graphic: result.graphic
            });
          }
        }

        for (const [periodName, period] of Object.entries(data)) {
          const grid = $("<div/>").addClass("period-grid").append($("<h2/>").text(periodName + ":"));
          const table = $("<table/>").addClass("result-table");

          let longest = Math.max(...Object.values(period).map(c => c.length));
          const disc_row = $("<tr/>");
          for (let i = 0; i < longest + 1; i++) disc_row.append($("<td/>").addClass("hidden-cell"));
          disc_row.append($("<td/>").addClass("disclaimer").text("!"));
          table.append(disc_row);

          let overallNum = 0, overallDen = 0;

          for (const [courseName, course] of Object.entries(period)) {
            const row = $("<tr/>");
            const graphic = course_to_graphic[courseName];
            if (graphic?.type === "icon") {
              row.append($("<th/>").append(
                $("<span/>")
                  .addClass(`icon-label icon-label--24 smsc-svg--${graphic.value}--24`)
                  .text(courseName)
              ));
            } else row.append($("<th/>").text(courseName));

            let num = 0, den = 0;
            for (const res of course) {
              const desc = res.graphic.description || "/";
              row.append($("<td/>").addClass(`c-${res.graphic.color}-combo--300`).attr("title", res.name).text(desc));
              const match = (desc || "").match(/^([\d.,]+)\/([\d.,]+)$/);
              if (match) {
                num += parseFloat(match[1].replace(',', '.'));
                den += parseFloat(match[2].replace(',', '.'));
              }
            }

            for (let i = 0; i < longest - course.length; i++) row.append($("<td/>"));
            const totalCell = $("<td/>").addClass("total");
            if (den !== 0) {
              totalCell.text(totalToStr(num, den));
              if (num / den < 0.5) totalCell.addClass("is-low");
            }
            row.append(totalCell);
            overallNum += num;
            overallDen += den;

            table.append(row);
          }

          const totalRow = $("<tr/>").append($("<th/>").text("Total"));
          for (let i = 0; i < longest; i++) totalRow.append($("<td/>"));
          const totalCell = $("<td/>").addClass("total");
          if (overallDen !== 0) {
            totalCell.text(totalToStr(overallNum, overallDen));
            if (overallNum / overallDen < 0.5) totalCell.addClass("is-low");
          }
          totalRow.append(totalCell);
          table.append(totalRow);

          grid.append($("<div/>").addClass("table-container").append(table));
          data[periodName] = grid;
        }

        const modal = $("<div/>").attr("id", "content-container");
        const buttons = $("<div/>").addClass("period-buttons");
        const mainGrid = $("<div/>").attr("id", "period-container");

        for (const [periodName, grid] of Object.entries(data).reverse()) {
          buttons.append(
            $("<button/>").addClass("period_button").text(periodName).click(() => {
              mainGrid.empty();
              mainGrid.append(grid);
            })
          );
        }

        if (buttons.children().length > 1) modal.append($("<span/>").text("Select period: "), buttons);
        if (latest_period) mainGrid.append(data[latest_period]);
        modal.append(mainGrid);
        loading.replaceWith(modal);
      })
      .catch(err => {
        loading.text('Failed loading results: ' + err.message);
        console.error('makeGrid error', err);
      });

    return loading;
  }

  function onLoad() {
    smartschool_loadStyles("css/estimation.css");

    if (!$("#modal-background").length) {
      $("body").append(
        $("<div/>").attr("id", "modal-background"),
        $("<div/>").attr("id", "modal-content").append(
          $("<button/>").attr("id", "modal-close").text("Close"),
          makeGrid()
        )
      );

      $("#modal-background, #modal-close").click(() =>
        $("#modal-content, #modal-background").toggleClass("active")
      );
    }
  }

  function openGrid() {
    $("#modal-content, #modal-background").toggleClass("active");
  }

  (async function init() {
    try {
      await smartschool_addElement({
        parentSelector: ".wide-toolbar",
        elementId: "show-grid",
        content: $("<button/>")
          .addClass("wide-toolbar__item")
          .append($("<img/>").addClass("wide-toolbar__item__icon").attr("src", ICON_URL))
          .append($("<span/>").addClass("wide-toolbar__item__name").text("Overzicht")),
        onClick: openGrid
      });

      onLoad();
    } catch (err) {
      console.error("Smartschool Grid failed:", err);
    }
  })();

})();
