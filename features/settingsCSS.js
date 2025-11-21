(async () => {

    const settings = await smartschoolSettings.get("settings", false);

    function applyFilter(element, hexColor) {
        const rgb = hexColor.replace('#', '');
        const r = parseInt(rgb.substring(0, 2), 16);
        const g = parseInt(rgb.substring(2, 4), 16);
        const b = parseInt(rgb.substring(4, 6), 16);

        function solve(color) {
            let result = { loss: Infinity };
            const colorObj = new Color(color[0], color[1], color[2]);
            const solver = new Solver(colorObj);
            const solution = solver.solve();
            return solution.filter;
        }

        class Color {
            constructor(r, g, b) {
                this.r = this.clamp(r);
                this.g = this.clamp(g);
                this.b = this.clamp(b);
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
                const result = this.solveNarrow(this.solveWide());
                return result;
            }
            solveWide() {
                return this.solveNarrow({
                    values: [60, 100, 120, 18000, 100, 100],
                    loss: Infinity
                });
            }
            solveNarrow(start) {
                let best = start;
                let bestLoss = best.loss;

                const A = 0.05;
                const ITER = 30;

                for (let i = 0; i < ITER; i++) {
                    const candidate = {
                        values: best.values.map(v => v + (Math.random() - 0.5) * A * v),
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
                let r = 255, g = 255, b = 255;

                r = (1 - values[0] / 100) * r;
                g = (1 - values[0] / 100) * g;
                b = (1 - values[0] / 100) * b;

                const sr = 0.393 * r + 0.769 * g + 0.189 * b;
                const sg = 0.349 * r + 0.686 * g + 0.168 * b;
                const sb = 0.272 * r + 0.534 * g + 0.131 * b;
                r = sr * (values[1] / 100);
                g = sg * (values[1] / 100);
                b = sb * (values[1] / 100);

                r *= values[2] / 100;
                g *= values[2] / 100;
                b *= values[2] / 100;

                const angle = values[3] * Math.PI / 180;
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

                r *= values[4] / 100;
                g *= values[4] / 100;
                b *= values[4] / 100;

                r = ((r - 128) * values[5] / 100) + 128;
                g = ((g - 128) * values[5] / 100) + 128;
                b = ((b - 128) * values[5] / 100) + 128;

                return new Color(r, g, b);
            }
            formatFilter(values) {
                return `
        invert(${values[0]}%)
        sepia(${values[1]}%)
        saturate(${values[2]}%)
        hue-rotate(${values[3]}deg)
        brightness(${values[4]}%)
        contrast(${values[5]}%)
      `.replace(/\s+/g, ' ');
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
            applyFilter(document.querySelector('.js-btn-search .js-btn-manual .js-btn-logout'), settings.nav["text-color"]);

            const style = document.createElement("style");
            style.textContent = `
        .smsc-topnav 
        .topnav__btn {
            color: ${settings.nav["text-color"]}
        }

        .smsc-topnav 
        .topnav__btn:hover {
            color: ${settings.nav["text-color"]}
        }

        .smsc-topnav 
        .topnav__btn:focus
        .smsc-topnav 
        .topnav__btn:hover
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