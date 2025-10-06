(function () {
  'use strict';

  const $ = window.jQuery;

  const ICON_SVG = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="graph 2"> <g id="graph 2_2"> <path id="Combined Shape" fill-rule="evenodd" clip-rule="evenodd" d="M33 26.028V37C33 37.5523 32.5523 38 32 38C31.4477 38 31 37.5523 31 37V26.028H25.5646C25.2528 26.028 25.0006 26.2804 25.0006 26.594V40H38.434C38.7457 40 39 39.7457 39 39.434V6.566C39 6.25428 38.7457 6 38.434 6H33.566C33.2543 6 33 6.25428 33 6.566V24.028H34.0006C34.5529 24.028 35.0006 24.4757 35.0006 25.028C35.0006 25.5803 34.5529 26.028 34.0006 26.028H33ZM31 24.028H25.5646C25.3706 24.028 25.1816 24.0495 25 24.0903V18.618C25 17.2002 23.8508 16.05 22.434 16.05H17.566C16.1492 16.05 15 17.2002 15 18.618V31.9726H9.566C8.15022 31.9726 7 33.1218 7 34.5366V39.4066C7 40.8229 8.14972 41.9726 9.566 41.9726H15.7665C15.8414 41.9905 15.9196 42 16 42C16.0804 42 16.1586 41.9905 16.2335 41.9726H20C20.5523 41.9726 21 41.5249 21 40.9726C21 40.4203 20.5523 39.9726 20 39.9726H17V18.618C17 18.3044 17.2542 18.05 17.566 18.05H22.434C22.7458 18.05 23 18.3044 23 18.618V43C23 43.5523 23.4477 44 24 44C24.5523 44 25 43.5523 25 43V42H38.434H38.4346L38.4411 42C39.8541 41.9962 41 40.8479 41 39.434V6.566C41 5.14972 39.8503 4 38.434 4H33.566C32.1497 4 31 5.14972 31 6.566V24.028ZM15 39.9726V33.9726H9.566C9.2544 33.9726 9 34.2268 9 34.5366V39.4066C9 39.7183 9.25428 39.9726 9.566 39.9726H15Z" fill="#000000"></path> </g> </g> </g></svg>`;
  const ICON_URL = 'data:image/svg+xml;utf8,' + encodeURIComponent(ICON_SVG);

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
      observer.observe(document.documentElement, { childList: true, subtree: true });
      if (timeout > 0) {
        setTimeout(() => {
          observer.disconnect();
          reject(new Error('Timeout waiting for selector: ' + selector));
        }, timeout);
      }
    });
  }

  function addButton() {
    if ($("#show-grid").length) return;

    $(".wide-toolbar").append(
      $("<button/>")
        .attr("id", "show-grid")
        .addClass("wide-toolbar__item")
        .append(
          $("<img/>").addClass("wide-toolbar__item__icon").attr("src", ICON_URL)
        ).append(
          $("<span/>").addClass("wide-toolbar__item__name").text("Overzicht")
        ).click(openGrid)
    );
  }

  function totalToStr(total_numerator, total_denominator) {
    return (Math.round(total_numerator / total_denominator * 1000) / 10).toString() + '%';
  }

  function makeGrid() {
    let loading = $("<h3>Loading!</h3>");
    fetch('/results/api/v1/evaluations?itemsOnPage=500').then(r => r.json()).then(results => {
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
          period[course_name].push({ "date": result["date"], "name": result["name"], "graphic": result["graphic"] });
        }
      }

      for (let period_name of Object.keys(data)) {
        let period = data[period_name];

        let grid = $("<div/>").attr("id", "period").append($("<h2/>").text(period_name + ":"));
        let table = $("<table/>").attr("id", "result-table");

        let longest = 0;
        for (let [_, course] of Object.entries(period)) {
          course.sort((a, b) => { return a["date"].localeCompare(b["date"]); });
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
          if (course_to_graphic[course_name] && course_to_graphic[course_name].type == "icon") {
            row.append($("<th/>").append(
              $("<span/>")
                .addClass("icon-label icon-label--24 smsc-svg--" + course_to_graphic[course_name]["value"] + "--24")
                .text(course_name)
            ));
          } else {
            row.append($("<th/>").text(course_name));
          }

          let total_numerator = 0;
          let total_denominator = 0;

          for (const result of course) {
            const desc = result["graphic"]["description"];
            const color = result["graphic"]["color"];
            const name = result["name"];
            let cellDesc = desc || "/";  // If desc is empty, use "/"

            row.append($("<td/>")
              .addClass("c-" + color + "-combo--300")
              .attr({ id: "details", content: name })
              .text(cellDesc));

            let match = (desc || "").match(/^([\d\,\.]+)\/([\d\,\.]+)$/);
            if (match) {
              total_numerator += parseFloat(match[1].replace(',', '.'));
              total_denominator += parseFloat(match[2].replace(',', '.'));
            }
          }

          for (let i = 0; i < longest - course.length; i++) {
            row.append($("<td/>"));
          }

          let last_cell = $("<td/>").addClass("total");
          if (total_denominator != 0) {
            last_cell.text(totalToStr(total_numerator, total_denominator));
            if (total_numerator / total_denominator < 0.5) {
              last_cell.addClass('is-low');
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
          overallTotalCell.text(totalToStr(overallTotalNumerator, overallTotalDenominator));
          if (overallTotalNumerator / overallTotalDenominator < 0.5) {
            overallTotalCell.addClass('is-low');
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
        period_buttons.append($("<button/>").addClass("period_button").text(period_name).click(((grid) => {
          return () => {
            main_grid.empty();
            main_grid.append(grid);
          };
        })(grid)));
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
    }).catch(err => {
      loading.text('Failed loading results: ' + err.message);
      console.error('makeGrid error', err);
    });
    return loading;
  }

  function onLoad() {
    let style = document.createElement('style');
    style.innerHTML = `

#result-table #disclamer {
    border: none !important;
    color: red;
    font-weight: bold;
    position: relative;
}

#disclamer:hover::before {
    visibility: visible;
    opacity: 1;
}

#disclamer::before {
    z-index: 1;
    content: "Deze totalen kunnen afwijken van uw werkelijke resultaten doordat niet altijd alle gegevens gekend zijn.";
    position: absolute;
    left: -20rem;
    border: 3px solid red;
    padding: 0.2rem;
    border-radius: 3px;
    background-color: white;
    width: 20rem;
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s, opacity 0.5s linear;
}

#details {
  position: relative;
}

#details:hover::before {
  visibility: visible;
  opacity: 0.9;
}

#details::before {
  z-index: 2;
  content: attr(content);
  color: white;
  background-color: #1a1a1a;
  visibility: hidden;
  position: absolute;
  text-align: center;
  padding: 0.313rem 0;
  border-radius: 0.375rem;
  opacity: 0;
  transition: opacity .6s;
  width: 15rem;
  top: 100%;
  left: 50%;
  margin-left: -7.5rem;
}

#result-table .hidden-cell {
  border: none !important;
}

.period_button {
  background-color: #ff520e;
  border-radius: 3px;
  border-style: none;
  color: #FFFFFF;
  margin-right: 0.5rem;
  padding: 0.4rem;
  text-align: center;
  transition: 100ms;
}

.period_button:hover {
  background-color: #ef4200;
}

.period_button:active {
  background-color: #ff6210;
}

.total {
    font-weight: bold;
}

.is-low {
    color: red !important;
}

#table-container {
  flex: 1 1 auto;
  overflow: auto;
}

#period {
  height: 100%;
  display: flex;
  flex-direction: column;
}

#period-container {
  flex: 1;
  min-height: 0;
}

#content-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

#result-table {
    margin-top: 1rem;
    border: 0px;
}

#result-table th {
    text-align: left;
}

#result-table td {
    text-align: center;
}

#result-table th, #result-table td {
    border: 1px solid gray !important;
    padding: 0.5rem;
    min-width: 5.5rem;
}

#modal-background {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    opacity: .50;
    -webkit-opacity: .5;
    -moz-opacity: .5;
    filter: alpha(opacity=50);
    z-index: 1000;
}

#modal-content {
    background-color: white;
    border-radius: 10px;
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    box-shadow: 0 0 20px 0 #222;
    -webkit-box-shadow: 0 0 20px 0 #222;
    -moz-box-shadow: 0 0 20px 0 #222;
    display: none;
    padding: 10px;
    position: fixed;
    z-index: 1000;
    left: 10%;
    top: 10%;
    width: 80%;
    height: 80%;
}

#modal-background.active, #modal-content.active {
    display: block;
}

#modal-close {
  background-color: #ee0000;
  border-radius: 3px;
  border-style: none;
  color: #FFFFFF;
  padding: 0.4rem;
  text-align: center;
  transition: 100ms;
  position: absolute;
  right: 0.5rem;
}
#modal-close:hover {
  background-color: #dd0000;
}
#modal-close:active {
  background-color: #ff0000;
}
    `;
    document.head.appendChild(style);

    // Create modal elements once
    if ($("#modal-background").length === 0) {
      $("body").append(
        $("<div/>").attr("id", "modal-background")
      ).append(
        $("<div/>").attr("id", "modal-content").append(
          $("<button/>").attr("id", "modal-close").text("Close")
        ).append(makeGrid())
      );

      $("#modal-background, #modal-close").click(function () {
        $("#modal-content, #modal-background").toggleClass("active");
      });
    }
  }

  function openGrid() {
    $("#modal-content, #modal-background").toggleClass("active");
  }

  let wideToolbarCallback = function (mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.removedNodes.length !== 0) {
        for (const node of mutation.removedNodes) {
          if (node.id === "show-grid") {
            $(".wide-toolbar").append(node);
          }
        }
      }
    }
  };
  let wideToolbarObserver = new MutationObserver(wideToolbarCallback);

  let smscMainCallback = function (mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length === 1 && mutation.addedNodes[0].classList && mutation.addedNodes[0].classList.contains('wide-toolbar')) {
        observer.disconnect();
        const wt = $('.wide-toolbar')[0];
        if (wt) {
          wideToolbarObserver.observe(wt, { attributes: false, childList: true, subtree: false });
        }
        onLoad();
        addButton();
      }
    }
  };

  (async function init() {
    try {
      const $smsc = await waitForSelector('#smscMain', 15000);
      if ($('.wide-toolbar').length) {
        const wt = $('.wide-toolbar')[0];
        wideToolbarObserver.observe(wt, { attributes: false, childList: true, subtree: false });
        onLoad();
        addButton();
      } else {
        const smscMainObserver = new MutationObserver(smscMainCallback);
        smscMainObserver.observe($smsc[0], { attributes: false, childList: true, subtree: false });
      }
    } catch (err) {
      console.error('Smartschool Grid: failed to initialize:', err);
    }
  })();

})();
