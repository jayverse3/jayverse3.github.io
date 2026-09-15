/* Mobile Links menu; CSS controls when the trigger is visible. */
$(function () {
  "use strict";

  const wrapper = document.querySelector(".author__urls-wrapper");
  if (!wrapper) return;
  const button = wrapper.querySelector("button");
  const menu = wrapper.querySelector(".author__urls");
  const $button = $(button);
  const $menu = $(menu);
  const viewportGutter = 16;

  function positionMenu() {
    if (!$button.is(":visible")) return;
    const menuWidth = menu.getBoundingClientRect().width;
    if (!menuWidth) return;
    const buttonRect = button.getBoundingClientRect();
    const buttonCenter = buttonRect.left + buttonRect.width / 2;
    const halfWidth = menuWidth / 2;
    const menuCenter = Math.max(viewportGutter + halfWidth, Math.min(buttonCenter, window.innerWidth - viewportGutter - halfWidth));
    wrapper.style.setProperty("--author-links-center", (menuCenter - wrapper.getBoundingClientRect().left) + "px");
    wrapper.style.setProperty("--author-links-arrow-shift", (buttonCenter - menuCenter) + "px");
  }

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(positionMenu);
    [wrapper, button, menu].forEach(function (element) { observer.observe(element); });
  }

  $button.on("click", function () {
    $menu.stop(true, true).fadeToggle("fast");
    positionMenu();
  });

  $(document).on("click", function (event) {
    if ($button.is(":visible") && !wrapper.contains(event.target)) {
      $menu.stop(true, true).fadeOut("fast");
    }
  });

  $(window).on("resize", function () {
    positionMenu();
    if (!$button.is(":visible") && $menu.css("display") === "none") $menu.css("display", "block");
  });
});
