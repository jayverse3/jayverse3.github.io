/* Responsive overflow navigation, adapted from Luke Jackson's Greedy Navigation.
 * Original: http://codepen.io/lukejacksonn/pen/PwmwWV
 */
$(function () {
  "use strict";

  const $navigation = $("#site-nav");
  if (!$navigation.length) return;

  const $menuButton = $navigation.find("button");
  const $visibleLinks = $navigation.find(".visible-links");
  const $hiddenLinks = $navigation.find(".hidden-links");
  const menuGap = 30;

  function updateNavigation() {
    // Measure all links first; reserve a menu button only when they overflow.
    // Remeasure on resize because link spacing changes between desktop and mobile.
    $visibleLinks.append($hiddenLinks.children());
    $menuButton.addClass("hidden");

    if ($visibleLinks.width() > $navigation.width()) {
      $menuButton.removeClass("hidden");
      const availableSpace = $navigation.width() - $menuButton.outerWidth() - menuGap;
      while ($visibleLinks.width() > availableSpace && $visibleLinks.children(":not(.persist)").length) {
        $visibleLinks.children(":not(.persist)").last().prependTo($hiddenLinks);
      }
    }

    if (!$hiddenLinks.children().length) {
      $menuButton.addClass("hidden").removeClass("close").attr("aria-expanded", "false");
      $hiddenLinks.addClass("hidden");
    }

    // Match content offsets to the rendered header, including a wrapped date row.
    const mastheadHeight = $(".masthead").height();
    $("body").css("padding-top", mastheadHeight + "px");
    const profileButtonVisible = $(".author__urls-wrapper button").is(":visible");
    $(".sidebar").css("padding-top", profileButtonVisible ? "" : mastheadHeight + "px");
  }

  $(window).on("resize", updateNavigation);
  $menuButton.on("click", function () {
    $hiddenLinks.toggleClass("hidden");
    $menuButton.toggleClass("close");
    $menuButton.attr("aria-expanded", String(!$hiddenLinks.hasClass("hidden")));
  });
  updateNavigation();
});
