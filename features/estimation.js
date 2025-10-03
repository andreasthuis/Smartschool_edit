(function() {
    const url = window.location.href;
    const regex = /^https:\/\/([^.]+)\.smartschool\.be\/results\/main$/;
    if (!regex.test(url)) return;

    function addEstimateButton(parent) {
        if (parent.querySelector(".estimate-button")) return;

        const btn = document.createElement("button");
        btn.className = "wide-toolbar__item estimate-button";
        btn.innerHTML = `
            <div class="wide-toolbar__item__icon smsc-svg--document_certificate--16"></div>
            <span class="wide-toolbar__item__name">Estimate</span>
        `;
        btn.addEventListener("click", () => {
            alert("Estimate button clicked!");
        });
        parent.appendChild(btn);
    }

    const observer = new MutationObserver((mutations, obs) => {
        const toolbar = document.querySelector(".js-wide-toolbar");
        if (toolbar) {
            addEstimateButton(toolbar);
            obs.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const toolbar = document.querySelector(".js-wide-toolbar");
    if (toolbar) addEstimateButton(toolbar);

    alert("Estimation feature loaded! 2.0");
})();
