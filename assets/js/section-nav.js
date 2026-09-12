(function () {
  "use strict";

  const nav = document.querySelector(".section-nav");
  if (!nav) return;

  const entries = Array.from(nav.querySelectorAll('a[href^="#"]'))
    .map(function (link) {
      return { link: link, target: document.getElementById(link.hash.slice(1)), offset: 0 };
    })
    .filter(function (entry) { return entry.target; });
  if (!entries.length) return;

  // Keep native links as a no-JS fallback and make destinations focusable for
  // keyboard navigation when JavaScript handles the jump without changing URLs.
  entries.forEach(function (entry) {
    if (!entry.target.hasAttribute("tabindex")) {
      entry.target.setAttribute("tabindex", "-1");
    }
  });

  const header = document.querySelector(".masthead");
  const root = document.documentElement;
  let activeLink = null;
  let framePending = false;
  let anchorSelection = entries.find(function (entry) {
    return entry.link.hash === window.location.hash;
  });
  let anchorArrived = false;

  function measureContextGap(entry) {
    const previous = entry.target.previousElementSibling;
    if (!previous || previous.matches(".home-section-title")) return 96;

    // Measure rendered text, including inline bold text and links. Paragraphs,
    // lists and cards have different leading and margins, so a fixed pixel gap
    // cannot consistently leave two complete lines above the next heading.
    const walker = document.createTreeWalker(previous, NodeFilter.SHOW_TEXT);
    const rects = [];
    while (walker.nextNode()) {
      if (!walker.currentNode.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(walker.currentNode);
      Array.from(range.getClientRects()).forEach(function (rect) {
        if (rect.width && rect.height) rects.push({ top: rect.top, bottom: rect.bottom });
      });
    }
    rects.sort(function (a, b) { return a.top - b.top; });
    const lines = [];
    rects.forEach(function (rect) {
      const last = lines[lines.length - 1];
      if (last && rect.top < last.bottom - 1) {
        last.bottom = Math.max(last.bottom, rect.bottom);
      } else {
        lines.push({ top: rect.top, bottom: rect.bottom });
      }
    });
    if (!lines.length) return 96;

    const firstVisible = Math.max(0, lines.length - 2);
    const preceding = lines[firstVisible - 1];
    const leading = preceding ? Math.max(0, lines[firstVisible].top - preceding.bottom) : 12;
    // Put the header edge in the inter-line gap, never through the preceding
    // line's descenders. Extra space is capped so it cannot reveal that line.
    let cutoff = lines[firstVisible].top - Math.min(6, leading / 2);
    previous.querySelectorAll(".profile-card__logo").forEach(function (logo) {
      const rect = logo.getBoundingClientRect();
      if (rect.width && rect.top < cutoff && rect.bottom > cutoff) {
        cutoff = rect.top - 6;
      }
    });
    return Math.max(0, entry.target.getBoundingClientRect().top - cutoff);
  }

  function getScrollStop(entry) {
    if (entry.target.id === "about") return 0;
    return Math.max(0, entry.target.getBoundingClientRect().top + window.scrollY - entry.offset);
  }

  function getScrollStops() {
    const stops = entries.map(getScrollStop);
    const last = stops.length - 1;
    const scrollableHeight = Math.max(0, root.scrollHeight - root.clientHeight);
    if (last < 1 || stops[last] <= scrollableHeight) return stops;

    // When the final headings cannot reach the reading line, reserve distinct
    // destinations backwards from the bottom. Only the affected tail moves;
    // earlier, reachable stops keep their original context and timing.
    // An 8vh interval keeps short-page sections selectable, shrinking further
    // only when the entire scroll range cannot accommodate that spacing.
    const minimumGap = Math.min(root.clientHeight * 0.08, scrollableHeight / last);
    stops[last] = scrollableHeight;
    for (let index = last - 1; index > 0; index--) {
      stops[index] = Math.min(stops[index], stops[index + 1] - minimumGap);
    }
    stops[0] = 0;
    return stops;
  }

  function updateActiveSection() {
    framePending = false;
    const scrollY = window.scrollY;
    const scrollableHeight = Math.max(0, root.scrollHeight - root.clientHeight);
    const stops = getScrollStops();
    // A section stays active until the NEXT heading crosses the same reading
    // position used by its anchor click, including adapted short-page stops.
    let active = entries[0];
    if (scrollableHeight > 1) {
      entries.forEach(function (entry, index) {
        if (stops[index] <= scrollY + 0.5) active = entry;
      });
    }

    // Honor the selected link during a smooth jump. If the entire page fits
    // in one viewport, clicking still selects a section without adding space.
    if (anchorSelection) {
      const destination = stops[entries.indexOf(anchorSelection)];
      const atDestination = Math.abs(scrollY - destination) <= 2;
      if (anchorArrived && !atDestination) {
        anchorSelection = null;
      } else {
        anchorArrived = atDestination;
        active = anchorSelection;
      }
    }

    if (active.link === activeLink) return;
    if (activeLink) activeLink.removeAttribute("aria-current");
    active.link.setAttribute("aria-current", "location");
    activeLink = active.link;
  }

  function scheduleUpdate() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateActiveSection);
  }

  function updateOffset() {
    const headerHeight = Math.ceil(header ? header.getBoundingClientRect().height : 0);
    entries.forEach(function (entry) {
      entry.offset = entry.target.id === "about"
        ? Math.ceil(entry.target.getBoundingClientRect().top + window.scrollY)
        : headerHeight + Math.ceil(measureContextGap(entry));
    });
    const stops = getScrollStops();
    entries.forEach(function (entry, index) {
      // Native anchors and scripted clicks use the same reachable position.
      const nextOffset = Math.max(0, entry.target.getBoundingClientRect().top + window.scrollY - stops[index]) + "px";
      if (entry.target.style.getPropertyValue("--section-nav-offset") !== nextOffset) {
        entry.target.style.setProperty("--section-nav-offset", nextOffset);
      }
    });
    scheduleUpdate();
  }

  nav.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const entry = entries.find(function (entry) {
      return entry.link.contains(event.target);
    });
    if (!entry) return;

    // Scroll without changing the hash or adding a browser-history entry.
    event.preventDefault();
    anchorSelection = entry;
    anchorArrived = false;
    entry.target.focus({ preventScroll: true });
    // Use the exact same destination as scroll tracking, without relying on
    // browser bottom-clamping. Preserve CSS smooth/reduced-motion preferences.
    window.scrollTo({ top: getScrollStops()[entries.indexOf(entry)], behavior: "auto" });
    scheduleUpdate();
  });

  function resumeScrollTracking() {
    // With no scroll range, a wheel/key gesture cannot select another section.
    if (root.scrollHeight - root.clientHeight <= 1) return;
    anchorSelection = null;
    anchorArrived = false;
    scheduleUpdate();
  }

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("site:back-to-top", function () {
    anchorSelection = entries.find(function (entry) {
      return entry.target.id === "about";
    }) || entries[0];
    anchorArrived = false;
    scheduleUpdate();
  });
  window.addEventListener("wheel", resumeScrollTracking, { passive: true });
  window.addEventListener("touchmove", resumeScrollTracking, { passive: true });
  window.addEventListener("pointerdown", resumeScrollTracking, { passive: true });
  window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented || event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
      resumeScrollTracking();
    }
  });
  window.addEventListener("resize", updateOffset, { passive: true });
  window.addEventListener("hashchange", function () {
    anchorSelection = entries.find(function (entry) {
      return entry.link.hash === window.location.hash;
    });
    anchorArrived = false;
    scheduleUpdate();
  });
  window.addEventListener("pageshow", updateOffset);
  window.addEventListener("load", updateOffset);

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(updateOffset);
    if (header) observer.observe(header);
    observer.observe(document.body);
  }
  if (document.fonts) document.fonts.ready.then(updateOffset);

  updateOffset();
})();
