(function () {
  "use strict";

  var logo = document.querySelector("[data-latex-logo]");

  // Keep the plain-text fallback when the CDN is unavailable.
  if (!logo || !window.katex) return;

  window.katex.render("\\LaTeX", logo, { output: "html" });
})();
