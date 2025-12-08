(async function () {
    'use strict';

    const CLASS = "topnav__btn--icon";

    const wait = ms => new Promise(res => setTimeout(res, ms));

    async function waitForButtons() {
        for (let i = 0; i < 500; i++) {
            let els = document.querySelectorAll(`.${CLASS}`);
            if (els.length > 0) return els;
            await wait(20);
        }
        return [];
    }

    const buttons = await waitForButtons();

    if (buttons.length === 0) return;

    try {
        buttons.forEach(btn => btn.remove());
    } catch {}

})();
