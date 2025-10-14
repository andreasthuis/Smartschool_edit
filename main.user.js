// ==UserScript==
// @name         Smartschool_Edit
// @namespace    http://tampermonkey.net/
// @version      0.5.1
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
// @connect      *
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/andreasthuis/Smartschool_edit/main/main.user.js
// @downloadURL  https://raw.githubusercontent.com/andreasthuis/Smartschool_edit/main/main.user.js
// ==/UserScript==

(function() {
  'use strict';

  const baseUrl = "https://raw.githubusercontent.com/andreasthuis/Smartschool_edit/main/";
  const cssFiles = ["root.css"];
  const jsFiles = ["root.js"];

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

  const FIRST_RUN_KEY = "smartschool_firstRun_v1";
  const isFirstRun = smartschoolSettings.get(FIRST_RUN_KEY, true);

  function initDefaultSettings() {
    smartschoolSettings.set("nav_color", "default");
  }

  function showFirstRunPopup(onAck) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.7)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "99999";

    const popup = document.createElement("div");
    popup.style.backgroundColor = "#fff";
    popup.style.padding = "22px 26px";
    popup.style.borderRadius = "10px";
    popup.style.boxShadow = "0 6px 30px rgba(0,0,0,0.35)";
    popup.style.maxWidth = "520px";
    popup.style.textAlign = "left";
    popup.style.fontFamily = "Arial, sans-serif";
    popup.style.color = "#111";

    popup.innerHTML = `
      <h2 style="margin-top:0;margin-bottom:10px;">Eerste keer gebruik</h2>
      <p style="margin-bottom:14px;line-height:1.35;">
        Ik zie dat dit de eerste keer is dat je deze Smartschool-tool gebruikt.<br>
        Er zal een pop-up verschijnen die toegang vraagt tot een webadres. Klik <strong>altijd</strong> op "Accepteren" om alles goed te laten werken.
      </p>
      <div style="text-align:right;">
        <button id="ss_cancel" style="margin-right:8px;padding:8px 12px;border-radius:6px;border:1px solid #ccc;background:#f3f3f3;cursor:pointer;">Annuleren</button>
        <button id="ss_accept" style="padding:8px 12px;border-radius:6px;border:none;background:#0078d7;color:#fff;cursor:pointer;">Begrepen</button>
      </div>
    `;

    overlay.appendChild(popup);
    (document.body || document.documentElement).appendChild(overlay);

    document.getElementById("ss_accept").addEventListener("click", () => { try { overlay.remove(); } catch(e){ overlay.style.display="none"; } onAck(true); });
    document.getElementById("ss_cancel").addEventListener("click", () => { try { overlay.remove(); } catch(e){ overlay.style.display="none"; } onAck(false); });
  }

  function loadAllAssets() {
    cssFiles.forEach(loadCSS);
    jsFiles.forEach(loadJS);
  }

  if (isFirstRun) {
    initDefaultSettings();
    smartschoolSettings.set(FIRST_RUN_KEY, false);
    showFirstRunPopup((accepted) => {
      if (accepted) loadAllAssets();
      else console.warn("[Smartschool_Edit] Eerste keer: gebruiker geannuleerd. Scripts worden niet geladen.");
    });
  } else loadAllAssets();

  global.smartschool_loadScript = loadJS;
  global.smartschool_loadStyles = loadCSS;
  global.smartschoolSettings = global.smartschoolSettings || smartschoolSettings;
  global.smartschool_webRequest = global.smartschool_webRequest || global.smartschool_webRequest;
})();
