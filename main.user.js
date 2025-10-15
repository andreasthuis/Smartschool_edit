// ==UserScript==
// @name         Smartschool_Edit
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Smartschool aanpassen met extra functies: voorspelling van punten, nav kleuren, etc.
// @license      MIT
// @author       andreasthuis
// @match        https://*.smartschool.be/*
// @exclude      https://*.smartschool.be/index.php?module=Messages&file=composeMessage&*
// @exclude      https://*.smartschool.be/Upload/*
// @exclude      https://wopi2.smartschool.be/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=smartschool.be
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      raw.githubusercontent.com
// @connect      https://proud-art-8cdd.andreasdeborger27.workers.dev
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/andreasthuis/Smartschool_edit/main/main.user.js
// @downloadURL  https://raw.githubusercontent.com/andreasthuis/Smartschool_edit/main/main.user.js
// ==/UserScript==

(function() {
  'use strict';

  const baseUrl = "https://raw.githubusercontent.com/andreasthuis/Smartschool_edit/main/";
  const cssFiles = ["root.css"];
  const jsFiles = ["root.js"];

  // --- Loaders ---
  function loadCSS(path) {
    GM_xmlhttpRequest({
      method: "GET",
      url: baseUrl + path,
      onload: res => {
        if (res.status === 200) GM_addStyle(res.responseText);
        else console.error("❌ Failed to load CSS:", res.status, path);
      },
      onerror: err => console.error("❌ CSS request failed:", err)
    });
  }

  function loadJS(path) {
    GM_xmlhttpRequest({
      method: "GET",
      url: baseUrl + path,
      onload: res => {
        if (res.status === 200) {
          const script = document.createElement("script");
          script.textContent = res.responseText;
          document.documentElement.appendChild(script);
          script.remove();
        } else {
          console.error("❌ Failed to load JS:", res.status, path);
        }
      },
      onerror: err => console.error("❌ JS request failed:", err)
    });
  }

  const global = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
  global.smartschool_loadScript = loadJS;
  global.smartschool_loadStyles = loadCSS;

  global.smartschool_webRequest = function(method, url, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method,
        url,
        headers: Object.assign({ "Content-Type": "application/json" }, headers),
        data: data ? JSON.stringify(data) : undefined,
        onload: res => {
          try { resolve(JSON.parse(res.responseText)); }
          catch { resolve(res.responseText); }
        },
        onerror: err => reject(err),
        ontimeout: () => reject(new Error("Request timed out"))
      });
    });
  };

  global.smartschoolSettings = {
    get: (key, def) => {
      try { return GM_getValue(key, def); }
      catch (e) { console.error("[smartschoolSettings] get error", e); return def; }
    },
    set: (key, value) => {
      try { GM_setValue(key, value); }
      catch (e) { console.error("[smartschoolSettings] set error", e); }
    }
  };

  function loadAllAssets() {
    cssFiles.forEach(loadCSS);
    jsFiles.forEach(loadJS);
  }

  loadAllAssets();

})();

