/* Theme preference shared with the standalone Terminal page. */
$(function () {
  "use strict";

  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  let preference = null;
  function readPreference() {
    try { return localStorage.getItem("theme"); }
    catch (error) { return preference; } // Storage is optional.
  }
  preference = readPreference();

  function applyTheme(theme) {
    const dark = theme === "dark";
    if (dark) $("html").attr("data-theme", "dark");
    else $("html").removeAttr("data-theme");
    $("#theme-icon").toggleClass("fa-moon", dark).toggleClass("fa-sun", !dark);
  }

  applyTheme(preference === "light" || preference === "dark" ? preference : systemTheme.matches ? "dark" : "light");
  systemTheme.addEventListener("change", function (event) {
    preference = readPreference();
    if (!preference) applyTheme(event.matches ? "dark" : "light");
  });

  $("#theme-toggle").on("click", function () {
    preference = $("html").attr("data-theme") === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", preference); } catch (error) { /* Keep the session preference. */ }
    applyTheme(preference);
  });
});
