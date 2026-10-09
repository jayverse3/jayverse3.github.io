/* Responsive header and compact mobile navigation. */
$(function () {
  "use strict";

  if (!$("#site-nav").length) return;

  const toggle = document.getElementById("site-menu-toggle");
  const menu = document.getElementById("site-menu");

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle && menu) {
    document.documentElement.classList.add("site-menu-ready");
    toggle.addEventListener("click", function () {
      menu.hidden = !menu.hidden;
      toggle.setAttribute("aria-expanded", String(!menu.hidden));
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });
    function closeOutside(event) {
      if (!menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    }
    document.addEventListener("click", closeOutside);
    document.addEventListener("focusin", closeOutside);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !menu.hidden) {
        closeMenu();
        toggle.focus();
      }
    });
    window.addEventListener("pagehide", closeMenu);
  }

  function updateHeaderOffsets() {
    // CSS owns the breakpoint; do not leave the mobile panel open on desktop.
    if (!$(toggle).is(":visible")) closeMenu();
    // Match content offsets to the rendered header, including a wrapped date row.
    const mastheadHeight = $(".masthead").height();
    $("body").css("padding-top", mastheadHeight + "px");
    const profileButtonVisible = $(".author__urls-wrapper button").is(":visible");
    $(".sidebar").css("padding-top", profileButtonVisible ? "" : mastheadHeight + "px");
  }

  $(window).on("resize", updateHeaderOffsets);
  updateHeaderOffsets();
});
