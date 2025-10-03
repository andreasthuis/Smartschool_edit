(function() {
    const url = window.location.href;
    const regex = /^https:\/\/([^.]+)\.smartschool\.be\/results\/main$/;
    const match = url.match(regex);

    if (!match) return;

    function addButton() {
        const parent = document.querySelector(".js-wide-toolbar");
        if (!parent) {
            setTimeout(addButton, 100);
            return;
        }

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

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", addButton);
    } else {
        addButton();
    }
})();
