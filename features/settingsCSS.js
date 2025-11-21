(async () => {

    const settings = await smartschoolSettings.get("settings", false);

    function normalizeHex(hex) {
        if (!hex) return "#ffffff";
        hex = String(hex).trim();
        if (!hex.startsWith("#")) hex = "#" + hex;
        if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return "#ffffff";
        return hex;
    }

    function applyFilter(element, hex) {
        if (!element) return;
        hex = normalizeHex(hex);

        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        const filter = `
            brightness(1)
            saturate(100%)
            sepia(1)
            hue-rotate(0deg)
            drop-shadow(0 0 0 rgb(${r},${g},${b}))
        `.replace(/\s+/g, " ").trim();

        element.style.filter = filter;
    }

    if (settings && settings.navigation) {
        let { direction, colors } = settings.navigation;
        direction = direction || "90deg";

        const cleanColors = (colors || []).map(normalizeHex);

        if (cleanColors.length >= 2) {
            const gradient = `linear-gradient(${direction}, ${cleanColors.join(", ")})`;

            const style = document.createElement("style");
            style.textContent = `
                .topnav {
                    background: ${gradient} !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    if (settings && settings.nav) {
        const hex = normalizeHex(settings.nav["text-color"]);

        document.querySelectorAll(
            ".topnav__btn--icon, .topnav__btn--icon--search, .topnav__btn--icon--manual, .topnav__btn--icon--logout"
        ).forEach(el => applyFilter(el, hex));

        const style = document.createElement("style");
        style.textContent = `
            .smsc-topnav .topnav__btn {
                color: ${hex};
            }
            .smsc-topnav .topnav__btn:hover,
            .smsc-topnav .topnav__btn:focus,
            .smsc-topnav .topnav__btn[aria-expanded=true] {
                color: ${hex};
            }
        `;
        document.head.appendChild(style);
    }

    if (settings && settings["quick-panel"]) {
        const base = normalizeHex(settings["quick-panel"]["base-color"]);
        const text = normalizeHex(settings["quick-panel"]["text-color"]);

        const style = document.createElement("style");
        style.textContent = `
            .smsc-topnav .topnav__menu,
            .bubble,
            .smsctooltip {
                background-color: ${base};
                border: 2px solid ${base};
            }

            .topnav__menuitem {
                color: ${text};
            }

            .smscButton:hover,
            .topnav__menuitem:hover {
                background-color: rgba(0, 0, 0, 0.1) !important;
            }
        `;
        document.head.appendChild(style);
    }

})();
