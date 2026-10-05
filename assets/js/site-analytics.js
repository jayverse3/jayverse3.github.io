(function () {
  "use strict";

  const configuration = document.currentScript;
  if (!configuration) return;
  const code = configuration.dataset.goatcounterCode || "";
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(code)) return;
  const origin = "https://" + code + ".goatcounter.com";
  const siteVisitEvent = "site-visit";
  const counterLabel = "Site visits";

  // Local previews may read the public count, but must never record a visit.
  const isLocal = /^(localhost|127\.|\[?::1\]?)/.test(location.hostname);
  let isPublishedSite = false;
  try {
    isPublishedSite = configuration.dataset.production === "true"
      && !isLocal && location.origin === new URL(configuration.dataset.siteUrl).origin;
  } catch (error) { /* An invalid configuration must not affect the page. */ }

  if (isPublishedSite) {
    const tracker = document.createElement("script");
    tracker.async = true;
    tracker.src = "https://gc.zgo.at/count.js";
    tracker.dataset.goatcounter = origin + "/count";
    // Keep per-page statistics; never bind clicks or collect Terminal commands.
    tracker.dataset.goatcounterSettings = JSON.stringify({
      path: location.pathname,
      no_events: true
    });
    tracker.addEventListener("load", function () {
      function recordSiteVisit() {
        if (document.visibilityState && document.visibilityState !== "visible") return;
        document.removeEventListener("visibilitychange", recordSiteVisit);
        if (!window.goatcounter || typeof window.goatcounter.count !== "function") return;
        // The same event on every page is deduplicated by GoatCounter's Sessions.
        // Do not set no_session: we want one site visit, not one per page load.
        window.goatcounter.count({ path: siteVisitEvent, title: counterLabel, event: true });
      }

      document.addEventListener("visibilitychange", recordSiteVisit);
      recordSiteVisit();
    }, { once: true });
    document.head.appendChild(tracker);
  }

  const counter = document.querySelector("[data-site-visits]");
  if (!counter) return;

  async function showSiteVisits() {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(origin + "/counter/" + siteVisitEvent + ".json", {
        credentials: "omit",
        signal: controller.signal
      });
      if (!response.ok && response.status !== 404) return;
      const data = await response.json();
      // GoatCounter returns a formatted string; retain its thousands separators.
      const count = typeof data.count === "string" ? data.count.trim() : "";
      if (!/^\d[\d,.\s]*$/.test(count)) return;
      // A missing path has a documented JSON zero response; errors are not zero.
      if (!response.ok && count !== "0") return;
      counter.textContent = (counter.dataset.label || "Total visits: ") + count;
      counter.hidden = false;
    } catch (error) {
      // Disabled public counts, blockers and outages should leave no placeholder.
    } finally {
      window.clearTimeout(timeout);
    }
  }

  void showSiteVisits();
})();
