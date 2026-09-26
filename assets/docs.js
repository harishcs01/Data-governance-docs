/* DataGovern documentation — small progressive enhancements.
   Nothing here is required to read the page; it degrades to plain HTML. */

(function () {
  "use strict";

  /* ---------------------------------------------------------- theme toggle */

  var STORE_KEY = "datagovern-docs-theme";
  var root = document.documentElement;

  function readStored() {
    try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }

  function writeStored(value) {
    try { localStorage.setItem(STORE_KEY, value); } catch (e) { /* private mode */ }
  }

  var stored = readStored();
  if (stored === "light" || stored === "dark") root.setAttribute("data-theme", stored);

  function currentTheme() {
    var explicit = root.getAttribute("data-theme");
    if (explicit) return explicit;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function paintToggle(btn) {
    var dark = currentTheme() === "dark";
    btn.textContent = dark ? "☀" : "☾";
    btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    btn.title = btn.getAttribute("aria-label");
  }

  var themeBtn = document.querySelector("[data-theme-toggle]");
  if (themeBtn) {
    paintToggle(themeBtn);
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      writeStored(next);
      paintToggle(themeBtn);
    });
  }

  /* ------------------------------------------------------------ mobile nav */

  var menuBtn = document.querySelector("[data-menu-toggle]");
  var sidebar = document.querySelector(".sidebar");
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", function () {
      var open = sidebar.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    sidebar.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        sidebar.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* -------------------------------------------- heading anchors + build TOC */

  var content = document.querySelector(".content");
  var toc = document.querySelector(".toc");
  if (!content) return;

  var headings = Array.prototype.slice.call(content.querySelectorAll("h2[id], h3[id]"));

  headings.forEach(function (h) {
    var a = document.createElement("a");
    a.className = "anchor";
    a.href = "#" + h.id;
    a.textContent = "#";
    a.setAttribute("aria-hidden", "true");
    h.appendChild(a);
  });

  if (toc && headings.length) {
    var frag = document.createDocumentFragment();
    var title = document.createElement("strong");
    title.textContent = "On this page";
    frag.appendChild(title);

    headings.forEach(function (h) {
      var link = document.createElement("a");
      link.href = "#" + h.id;
      link.textContent = (h.getAttribute("data-toc") || h.textContent).replace(/#$/, "").trim();
      if (h.tagName === "H3") link.className = "lvl3";
      frag.appendChild(link);
    });

    toc.appendChild(frag);

    /* Highlight whichever heading is nearest the top of the viewport. */
    var links = Array.prototype.slice.call(toc.querySelectorAll("a"));
    var byId = {};
    links.forEach(function (l) { byId[l.getAttribute("href").slice(1)] = l; });

    var mark = function () {
      var best = null;
      var bestTop = -Infinity;
      headings.forEach(function (h) {
        var top = h.getBoundingClientRect().top - 90;
        if (top <= 0 && top > bestTop) { bestTop = top; best = h; }
      });
      if (!best) best = headings[0];
      links.forEach(function (l) { l.classList.remove("active"); });
      var active = byId[best.id];
      if (active) active.classList.add("active");
    };

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { mark(); ticking = false; });
    }, { passive: true });
    mark();
  }

  /* ---------------------------------------- mark the sidebar's current link */

  var here = location.pathname.split("/").pop() || "index.html";
  Array.prototype.slice.call(document.querySelectorAll(".sidebar a")).forEach(function (a) {
    var href = a.getAttribute("href") || "";
    if (href.split("#")[0] === here && href.indexOf("#") === -1) a.classList.add("active");
  });
})();
