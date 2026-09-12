(function () {
  "use strict";

  const button = document.querySelector(".back-to-top");
  if (!button) return;

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let framePending = false;

  function updateVisibility() {
    framePending = false;
    // Use the current viewport height, not a page-specific pixel threshold.
    // Short pages never need the extra control.
    button.hidden = window.scrollY <= root.clientHeight;
  }

  function scheduleUpdate() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateVisibility);
  }

  button.addEventListener("click", function () {
    // Let chapter navigation cancel an in-flight jump and select About.
    // Pages without chapter navigation can use this control independently.
    window.dispatchEvent(new Event("site:back-to-top"));

    // Move keyboard focus off the button before it disappears on the way up.
    const destination = document.querySelector(".home-welcome")
      || document.querySelector(".page__title")
      || document.getElementById("main");
    if (destination) {
      if (!destination.hasAttribute("tabindex")) destination.setAttribute("tabindex", "-1");
      destination.focus({ preventScroll: true });
    }

    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "instant" : "smooth" });
    scheduleUpdate();
  });

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate, { passive: true });
  window.addEventListener("pageshow", scheduleUpdate);
  window.addEventListener("load", scheduleUpdate);
  if ("ResizeObserver" in window) {
    new ResizeObserver(scheduleUpdate).observe(document.body);
  }
  scheduleUpdate();
})();
