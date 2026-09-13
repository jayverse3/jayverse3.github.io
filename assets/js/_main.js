/* ==========================================================================
   Various functions that we want to use within the template
   ========================================================================== */

'use strict';

// Detect OS/browser preference
const browserPref = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Determine the computed theme, which can be "dark" or "light".
function determineComputedTheme() {
  const themeSetting = localStorage.getItem("theme");
  if (themeSetting === "dark" || themeSetting === "light") {
    return themeSetting;
  }
  return browserPref ? "dark" : "light";
}

// Set the theme on page load or when explicitly called
function setTheme(theme) {
  if (theme === "dark") {
    $("html").attr("data-theme", "dark");
    $("#theme-icon").removeClass("fa-sun").addClass("fa-moon");
  } else if (theme === "light") {
    $("html").removeAttr("data-theme");
    $("#theme-icon").removeClass("fa-moon").addClass("fa-sun");
  }
}

// Toggle the theme manually
function toggleTheme() {
  const current_theme = $("html").attr("data-theme");
  const new_theme = current_theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", new_theme);
  setTheme(new_theme);
}

/* ==========================================================================
   Actions that should occur when the page has been fully loaded
   ========================================================================== */

$(document).ready(function () {
  // SCSS SETTINGS - These should be the same as the settings in the relevant files
  const scssLarge = 925;          // pixels, from /_sass/_themes.scss

  // If the user hasn't chosen a theme, follow the OS preference
  setTheme(determineComputedTheme());
  window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener("change", (e) => {
          if (!localStorage.getItem("theme")) {
            setTheme(e.matches ? "dark" : "light");
          }
        });

  // Enable the theme toggle
  $('#theme-toggle').on('click', toggleTheme);

  // Center the menu below its trigger, keeping a 16px gutter on narrow screens.
  const authorMenuWrapper = document.querySelector('.author__urls-wrapper');
  function positionAuthorMenu() {
    if (!authorMenuWrapper || window.innerWidth >= scssLarge) return;
    const menuWidth = authorMenuWrapper.querySelector('.author__urls').getBoundingClientRect().width;
    if (!menuWidth) return;
    const button = authorMenuWrapper.querySelector('button');
    const buttonRect = button.getBoundingClientRect();
    const buttonCenter = buttonRect.left + buttonRect.width / 2;
    const halfWidth = menuWidth / 2;
    const menuCenter = Math.max(16 + halfWidth, Math.min(buttonCenter, window.innerWidth - 16 - halfWidth));
    authorMenuWrapper.style.setProperty('--author-links-center', (menuCenter - authorMenuWrapper.getBoundingClientRect().left) + 'px');
    authorMenuWrapper.style.setProperty('--author-links-arrow-shift', (buttonCenter - menuCenter) + 'px');
  }

  // Reposition when opening the menu or when its contents / trigger change size.
  if (authorMenuWrapper && 'ResizeObserver' in window) {
    const menuObserver = new ResizeObserver(positionAuthorMenu);
    menuObserver.observe(authorMenuWrapper);
    menuObserver.observe(authorMenuWrapper.querySelector('button'));
    menuObserver.observe(authorMenuWrapper.querySelector('.author__urls'));
  }

  // Profile links menu drop down
  $(".author__urls-wrapper button").on("click", function () {
    $(".author__urls").stop(true, true).fadeToggle("fast");
    positionAuthorMenu();
  });

  // Tapping outside dismisses the small-screen menu without intercepting links.
  $(document).on("click", function (event) {
    if (!authorMenuWrapper || window.innerWidth >= scssLarge || authorMenuWrapper.contains(event.target)) return;
    $(authorMenuWrapper).find('.author__urls').stop(true, true).fadeOut("fast");
  });

  // Restore the desktop links list on a window resize.
  jQuery(window).on('resize', function () {
    positionAuthorMenu();
    if ($('.author__urls.social-icons').css('display') == 'none' && $(window).width() >= scssLarge) {
      $(".author__urls").css('display', 'block');
    }
  });

});
