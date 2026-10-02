/* Theme preference shared with the standalone Terminal page. */
$(function () {
  "use strict";

  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  let preference = null;
  function readPreference() {
    try { return localStorage.getItem("theme"); }
    catch (error) { return preference; } // Storage is optional.
  }
  function applyTheme(theme) {
    const dark = theme === "dark";
    if (dark) $("html").attr("data-theme", "dark");
    else $("html").removeAttr("data-theme");
    $("#theme-icon").toggleClass("fa-moon", dark).toggleClass("fa-sun", !dark);
  }

  function refreshTheme() {
    preference = readPreference();
    applyTheme(preference === "light" || preference === "dark" ? preference : systemTheme.matches ? "dark" : "light");
  }

  refreshTheme();
  systemTheme.addEventListener("change", refreshTheme);
  window.addEventListener("storage", function (event) {
    if (event.key === "theme" || event.key === null) refreshTheme();
  });

  $("#theme-toggle").on("click", function () {
    preference = $("html").attr("data-theme") === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", preference); } catch (error) { /* Keep the session preference. */ }
    applyTheme(preference);
  });
});
