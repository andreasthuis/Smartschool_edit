// ==UserScript==
// @name         Smartschool_Edit
// @namespace    http://tampermonkey.net/
// @version      2025-10-03
// @description  Smartschool aanpassen met dingen zoals: voorspelling van punten, nieuwe nav kleuren, etc.
// @license      MIT
// @author       andreasthuis
// @include      https://*.smartschool.be/*
// @exclude      view-source://*
// @exclude      https://*.smartschool.be/index.php?module=Messages&file=composeMessage&*
// @exclude      https://*.smartschool.be/Upload/*
// @exclude      https://wopi2.smartschool.be/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=smartschool.be
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @run-at       document-start
// @downloadURL https://update.greasyfork.org/scripts/552355/Smartschool_Edit.user.js
// @updateURL   https://raw.githubusercontent.com/Charcoal-SE/Userscripts/master/fdsc/fdsc.user.js
// ==/UserScript==

(function() {
    'use strict';

    const baseUrl = "https://raw.githubusercontent.com/andreasthuis/Smartschool_edit/refs/heads/main/";

    const cssFiles = [
        "root.css",
    ];

    const jsFiles = [
        "root.js",
    ];

    function loadCSS(path) {
        GM_xmlhttpRequest({
            method: "GET",
            url: baseUrl + path,
            onload: function(response) {
                if (response.status === 200) {
                    GM_addStyle(response.responseText);
                } else {
                    console.error("Failed to load CSS:", response.status, path);
                }
            }
        });
    }

    function loadJS(path) {
        GM_xmlhttpRequest({
            method: "GET",
            url: baseUrl + path,
            onload: function(response) {
                if (response.status === 200) {
                    const script = document.createElement("script");
                    script.textContent = response.responseText;
                    document.documentElement.appendChild(script);
                    script.remove();
                } else {
                    console.error("Failed to load JS:", response.status, path);
                }
            }
        });
    }


    if (typeof unsafeWindow !== 'undefined') {
        unsafeWindow.smartschool_loadScript = loadJS;
        unsafeWindow.smartschool_loadStyles = loadCSS;
    } else {
        window.smartschool_loadScript = loadJS;
        window.smartschool_loadStyles = loadCSS;
    }


    cssFiles.forEach(loadCSS);
    jsFiles.forEach(loadJS);

})();
