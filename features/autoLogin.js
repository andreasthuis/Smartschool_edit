(async function () {
    'use strict';

    if (!location.href.includes("login")) return;

    const TARGET_HREF = "/login/sso/init/google";
    const TARGET_TEXT = "Google Workspace";

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    async function waitForElement() {
        for (let i = 0; i < 500; i++) {
            let el = document.querySelector(`a[href="${TARGET_HREF}"]`);
            if (el) return el;

            const anchors = [...document.querySelectorAll("a")];
            el = anchors.find(a => a.textContent.trim() === TARGET_TEXT);
            if (el) return el;

            const icon = document.querySelector(".login-app__button-icon--google");
            if (icon) {
                el = icon.closest("a");
                if (el) return el;
            }

            await wait(20);
        }
        return null;
    }

    const btn = await waitForElement();

    if (!btn) {
        location.href = location.origin + TARGET_HREF;
        return;
    }

    try { btn.click(); } catch {}

    await wait(300);

    const href = btn.getAttribute("href");
    if (href) {
        const abs = new URL(href, location.origin).href;
        if (location.href !== abs) {
            location.href = abs;
        }
    }

})();
