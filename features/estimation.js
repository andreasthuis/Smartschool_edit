(function() {
    'use strict';

    console.log("Estimation.js loaded");

    // Flexible URL check
    const url = window.location.href;
    const regex = /^https:\/\/([^.]+)\.smartschool\.be\/results\/main\/?(\?.*)?$/;
    if (!regex.test(url)) {
        console.log("Estimation.js skipped: URL does not match");
        return;
    }

    // Function to add the Estimate button
    function addEstimateButton(parent) {
        if (!parent || parent.querySelector(".estimate-button")) return;

        const btn = document.createElement("button");
        btn.className = "wide-toolbar__item estimate-button";
        btn.innerHTML = `
            <div class="wide-toolbar__item__icon smsc-svg--document_certificate--16"></div>
            <span class="wide-toolbar__item__name">Estimate</span>
        `;

        btn.addEventListener("click", () => {
            console.log("Estimate button clicked!");
            // Replace alert with console log for a less annoying experience
        });

        parent.appendChild(btn);
        console.log("Estimate button injected");
    }

    // Try injecting immediately if toolbar exists
    const toolbar = document.querySelector(".js-wide-toolbar");
    if (toolbar) addEstimateButton(toolbar);

    // MutationObserver for dynamically loaded toolbar
    const observer = new MutationObserver((mutations, obs) => {
        const dynamicToolbar = document.querySelector(".js-wide-toolbar");
        if (dynamicToolbar) {
            addEstimateButton(dynamicToolbar);
            obs.disconnect();
        }
    });

    function observeToolbar() {
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            window.addEventListener("DOMContentLoaded", () => {
                observer.observe(document.body, { childList: true, subtree: true });
            });
        }
    }

    observeToolbar();
})();
