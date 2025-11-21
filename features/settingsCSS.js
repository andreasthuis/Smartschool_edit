(async () => {

    const settings = await smartschoolSettings.get("settings", false);

    function applyFilter(element, hexColor) {
        if (!element) {
            console.warn("applyFilter: element not found");
            return;
        }
        if (!hexColor) {
            console.warn("applyFilter: no color provided");
            return;
        }

        hexColor = String(hexColor).trim();
        if (!/^#?[0-9a-fA-F]{6}$/.test(hexColor)) {
            console.warn("applyFilter: invalid hex, falling back to #ffffff:", hexColor);
            hexColor = "#ffffff";
        }
        if (hexColor[0] !== '#') hexColor = '#' + hexColor;

        const rgb = hexColor.replace('#', '');
        const r = parseInt(rgb.substring(0, 2), 16);
        const g = parseInt(rgb.substring(2, 4), 16);
        const b = parseInt(rgb.substring(4, 6), 16);

        function solve(color) {
            const colorObj = new Color(color[0], color[1], color[2]);
            const solver = new Solver(colorObj);
            const solution = solver.solve();
            return (solution && solution.filter) ? solution.filter : 'none';
        }

        class Color {
            constructor(r, g, b) {
                this.r = this.clamp(Number.isFinite(r) ? r : 255);
                this.g = this.clamp(Number.isFinite(g) ? g : 255);
                this.b = this.clamp(Number.isFinite(b) ? b : 255);
            }
            clamp(v) {
                return Math.max(0, Math.min(255, v));
            }
        }

        class Solver {
            constructor(target) {
                this.target = target;
            }
            solve() {
                return this.solveNarrow(this.solveWide());
            }
            solveWide() {
                return {
                    values: [60, 100, 120, 18000, 100, 100],
                    loss: Infinity
                };
            }
            solveNarrow(start) {
                const fallbackStart = { values: [60, 100, 120, 18000, 100, 100], loss: Infinity };
                let best = (start && Array.isArray(start.values)) ? start : fallbackStart;
                let bestLoss = Number.isFinite(best.loss) ? best.loss : Infinity;

                const A = 0.05;
                const ITER = 30;

                for (let i = 0; i < ITER; i++) {
                    const baseValues = Array.isArray(best.values) ? best.values : fallbackStart.values;
                    const candidateValues = baseValues.map(v => v + (Math.random() - 0.5) * A * v);
                    const candidate = {
                        values: candidateValues,
                        loss: Infinity
                    };
                    candidate.loss = this.loss(candidate.values);
                    if (candidate.loss < bestLoss) {
                        best = candidate;
                        bestLoss = candidate.loss;
                    }
                }

                return { filter: this.formatFilter(best.values) };
            }
            loss(values) {
                const color = this.apply(values);
                return Math.abs(color.r - this.target.r) +
                    Math.abs(color.g - this.target.g) +
                    Math.abs(color.b - this.target.b);
            }
            apply(values) {
                const v = Array.isArray(values) ? values.slice(0, 6).map(n => Number.isFinite(n) ? n : 0) : [60, 100, 120, 0, 100, 100];

                let r = 255, g = 255, b = 255;

                r = (1 - v[0] / 100) * r;
                g = (1 - v[0] / 100) * g;
                b = (1 - v[0] / 100) * b;

                const sr = 0.393 * r + 0.769 * g + 0.189 * b;
                const sg = 0.349 * r + 0.686 * g + 0.168 * b;
                const sb = 0.272 * r + 0.534 * g + 0.131 * b;
                r = sr * (v[1] / 100);
                g = sg * (v[1] / 100);
                b = sb * (v[1] / 100);

                r *= v[2] / 100;
                g *= v[2] / 100;
                b *= v[2] / 100;

                const angle = v[3] * Math.PI / 180;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);

                const hr = (.213 + cos * .787 - sin * .213) * r +
                    (.715 - cos * .715 - sin * .715) * g +
                    (.072 - cos * .072 + sin * .928) * b;

                const hg = (.213 - cos * .213 + sin * .143) * r +
                    (.715 + cos * .285 + sin * .140) * g +
                    (.072 - cos * .072 - sin * .283) * b;

                const hb = (.213 - cos * .213 - sin * .787) * r +
                    (.715 - cos * .715 + sin * .715) * g +
                    (.072 + cos * .928 + sin * .072) * b;

                r = hr;
                g = hg;
                b = hb;

                r *= v[4] / 100;
                g *= v[4] / 100;
                b *= v[4] / 100;

                r = ((r - 128) * v[5] / 100) + 128;
                g = ((g - 128) * v[5] / 100) + 128;
                b = ((b - 128) * v[5] / 100) + 128;

                return new Color(r, g, b);
            }
            formatFilter(values) {
                const v = Array.isArray(values) ? values : [0, 0, 100, 0, 100, 100];
                return `
                invert(${v[0]}%)
                sepia(${v[1]}%)
                saturate(${v[2]}%)
                hue-rotate(${v[3]}deg)
                brightness(${v[4]}%)
                contrast(${v[5]}%)
            `.replace(/\s+/g, ' ').trim();
            }
        }

        const filterString = solve([r, g, b]);
        element.style.filter = filterString;
    }



    if (settings) {
        if (settings.navigation) {
            const { direction, colors } = settings.navigation;

            const gradient = `linear-gradient(${direction}, ${colors.join(", ")})`;

            const style = document.createElement("style");
            style.textContent = `
        .topnav {
          background: ${gradient} !important;
        }
      `;
            document.head.appendChild(style);

            console.log("Applied gradient:", gradient);
        }

        if (settings.nav) {
            applyFilter(document.querySelector('.js-btn-search'), settings.nav["text-color"]);
            applyFilter(document.querySelector('.js-btn-manual'), settings.nav["text-color"]);
            applyFilter(document.querySelector('.js-btn-logout'), settings.nav["text-color"]);

            const style = document.createElement("style");
            style.textContent = `
        .smsc-topnav 
        .topnav__btn {
            color: ${settings.nav["text-color"]}
        }

        .smsc-topnav, 
        .topnav__btn:hover {
            color: ${settings.nav["text-color"]}
        }

        .smsc-topnav
        .topnav__btn:focus,
        .smsc-topnav 
        .topnav__btn:hover,
        .smsc-topnav 
        .topnav__btn[aria-expanded=true] {
            color: ${settings.nav["text-color"]};
        }
        `;

            document.head.appendChild(style);
        }

        if (settings["quick-panel"]) {
            const style = document.createElement("style");
            style.textContent = `
        .smsc-topnav 
        .topnav__menu,
        .bubble,
        .smsctooltip {
            background-color:  ${settings["quick-panel"]["base-color"]}
            border: 2px solid ${settings["quick-panel"]["base-color"]}
        }

        .smscButton:hover,
        .topnav__menuitem:hover {
            background-color: rgba(0, 0, 0, 0.1) !important;
        }

        .topnav__menuitem {
            color: ${settings["quick-panel"]["text-color"]}
        }
        `;

            document.head.appendChild(style);
        }
    }

})();