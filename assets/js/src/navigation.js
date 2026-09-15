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
  const widthThresholds = [];
  const menuGap = 30;

  function availableWidth() {
    return $navigation.width() - ($menuButton.hasClass("hidden") ? 0 : $menuButton.width() + menuGap);
  }

  function updateNavigation() {
    let availableSpace = availableWidth();
    if ($visibleLinks.width() > availableSpace) {
      while ($visibleLinks.width() > availableSpace && $visibleLinks.children(":not(.persist)").length) {
        widthThresholds.push($visibleLinks.width());
        $visibleLinks.children(":not(.persist)").last().prependTo($hiddenLinks);
        availableSpace = availableWidth();
        $menuButton.removeClass("hidden");
      }
    } else {
      while (widthThresholds.length && availableSpace > widthThresholds[widthThresholds.length - 1]) {
        $hiddenLinks.children().first().appendTo($visibleLinks);
        widthThresholds.pop();
      }
      if (!widthThresholds.length) {
        $menuButton.addClass("hidden").removeClass("close");
        $hiddenLinks.addClass("hidden");
      }
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
  });
  updateNavigation();
});
