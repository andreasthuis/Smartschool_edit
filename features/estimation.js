(function() {
    const url = window.location.href;
    const regex = /^https:\/\/([^.]+)\.smartschool\.be\/results\/main$/;
    const match = url.match(regex);

    if (!match) return;

    const parent = document.querySelector(".js-wide-toolbar");
    if (!parent) return;

    const btn = document.createElement("button");
    btn.className = "wide-toolbar__item";

    btn.innerHTML = `
        <div class="wide-toolbar__item__icon smsc-svg--document_certificate--16"></div>
        <span class="wide-toolbar__item__name">Estimate</span>
    `;
    
    parent.appendChild(btn);
})();
