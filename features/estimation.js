(function() {
    const url = window.location.href;

    const regex = /^https:\/\/([^.]+)\.smartschool\.be\/results\/main$/;
    const match = url.match(regex)

    if (!match) return

    const html = '<button class="wide-toolbar__item"><div class="wide-toolbar__item__icon smsc-svg--document_certificate--16"></div><span class="wide-toolbar__item__name">Estimate</span></button>'
    const parent = document.getElementById("js-wide-toolbar")

    const btn = parent.appendChild(html)
})();
