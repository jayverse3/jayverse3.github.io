const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");

const source = readFileSync(join(__dirname, "../assets/js/site-analytics.js"), "utf8");

async function render(options = {}) {
  const counter = { hidden: true, textContent: "", dataset: { label: options.counterLabel || "" } };
  const scripts = [];
  const requests = [];
  const events = [];
  const timers = new Set();
  const url = new URL(options.url || "https://example.github.io/");
  const context = {
    URL, AbortController,
    location: url,
    document: Object.assign(new EventTarget(), {
      visibilityState: options.visibility || "visible",
      currentScript: { dataset: {
        goatcounterCode: "example",
        siteUrl: "https://example.github.io",
        production: "true",
        ...options.configuration
      } },
      createElement: () => Object.assign(new EventTarget(), { dataset: {} }),
      head: { appendChild: script => scripts.push(script) },
      querySelector: () => options.footer === false ? null : counter
    }),
    window: {
      setTimeout(callback, duration) {
        assert.equal(duration, 5000, "the optional page counter has a five-second deadline");
        timers.add(callback);
        return callback;
      },
      clearTimeout(callback) { timers.delete(callback); }
    },
    fetch: async (address, init) => {
      requests.push({ address, init });
      if (options.fail) throw new Error("Network unavailable");
      if (options.timeout) {
        return new Promise((resolve, reject) => {
          init.signal.addEventListener("abort", () => reject(new Error("Timeout")));
          for (const callback of timers) callback();
        });
      }
      return { ok: options.ok !== false, status: options.status || 200, json: async () => (
        options.data === undefined ? { count: "1,234" } : options.data
      ) };
    }
  };
  runInNewContext(source, context);
  if (options.trackerLoad !== false) {
    if (!options.missingSdk) {
      context.window.goatcounter = { count: event => events.push(JSON.parse(JSON.stringify(event))) };
    }
    for (const script of scripts) script.dispatchEvent(new Event("load"));
  }
  await new Promise(resolve => setImmediate(resolve));
  function setVisibility(state) {
    context.document.visibilityState = state;
    context.document.dispatchEvent(new Event("visibilitychange"));
  }
  return { counter, scripts, requests, events, timers, setVisibility };
}

test("published home keeps page tracking and displays the shared visit event, not TOTAL", async () => {
  const { counter, scripts, requests, events, timers } = await render();
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].async, true);
  assert.equal(scripts[0].dataset.goatcounter, "https://example.goatcounter.com/count");
  assert.deepEqual(JSON.parse(scripts[0].dataset.goatcounterSettings), { path: "/", no_events: true });
  assert.deepEqual(events, [{ path: "site-visit", title: "Site visits", event: true }]);
  assert.equal(requests[0].address, "https://example.goatcounter.com/counter/site-visit.json");
  assert.equal(requests[0].init.credentials, "omit");
  assert.equal(counter.textContent, "Site visits: 1,234");
  assert.equal(counter.hidden, false);
  assert.equal(timers.size, 0);
});

for (const path of ["/blog/", "/cv/", "/404.html", "/zh/", "/zh/blog/", "/zh/cv/"]) {
  test("page footer displays the same site-wide counter on " + path, async () => {
    const { counter, requests, scripts } = await render({ url: "https://example.github.io" + path });
    assert.equal(JSON.parse(scripts[0].dataset.goatcounterSettings).path, path);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].address, "https://example.goatcounter.com/counter/site-visit.json");
    assert.equal(counter.textContent, "Site visits: 1,234");
    assert.equal(counter.hidden, false);
  });
}

test("Terminal uses its page pathname, disables automatic click binding, and shares site visits", async () => {
  const { scripts, requests, events } = await render({ url: "https://example.github.io/terminal/?source=test", footer: false });
  assert.equal(scripts.length, 1);
  assert.deepEqual(JSON.parse(scripts[0].dataset.goatcounterSettings), { path: "/terminal/", no_events: true });
  assert.equal(requests.length, 0);
  assert.deepEqual(events, [{ path: "site-visit", title: "Site visits", event: true }]);
});

test("a translated display label does not change the shared event identity or title", async () => {
  const { counter, events, requests } = await render({ counterLabel: "访问量", url: "https://example.github.io/zh/" });
  assert.equal(counter.textContent, "访问量: 1,234");
  assert.deepEqual(events, [{ path: "site-visit", title: "Site visits", event: true }]);
  assert.equal(requests[0].address, "https://example.goatcounter.com/counter/site-visit.json");
});

test("home, blog, CV, Terminal, and refreshes use the same session-enabled deduplication key", async () => {
  const paths = ["/", "/blog/", "/zh/blog/", "/cv/", "/terminal/", "/", "/terminal/"];
  const eventPaths = [];
  for (const path of paths) {
    const { scripts, events } = await render({ url: "https://example.github.io" + path });
    assert.equal(JSON.parse(scripts[0].dataset.goatcounterSettings).path, path);
    assert.equal(events.length, 1);
    assert.equal(events[0].event, true);
    assert.equal("no_session" in events[0], false);
    eventPaths.push(events[0].path);
  }
  // Actual cross-page deduplication is performed by GoatCounter, not this wrapper.
  assert.deepEqual([...new Set(eventPaths)], ["site-visit"]);
});

test("a background tab waits until visible and emits only once", async () => {
  const { events, setVisibility } = await render({ visibility: "hidden" });
  assert.equal(events.length, 0);
  setVisibility("hidden");
  assert.equal(events.length, 0);
  setVisibility("visible");
  assert.equal(events.length, 1);
  setVisibility("hidden");
  setVisibility("visible");
  assert.equal(events.length, 1);
});

test("a visible tab does not recount on focus changes or duplicate load notifications", async () => {
  const { events, setVisibility, scripts } = await render();
  setVisibility("hidden");
  setVisibility("visible");
  scripts[0].dispatchEvent(new Event("load"));
  assert.equal(events.length, 1);
});

test("blocked or unavailable tracker does not stop the public counter", async () => {
  for (const options of [{ trackerLoad: false }, { missingSdk: true }]) {
    const { events, counter } = await render(options);
    assert.equal(events.length, 0);
    assert.equal(counter.hidden, false);
  }
});

for (const url of ["http://localhost:4000/", "http://127.0.0.1:4000/", "http://[::1]:4000/"]) {
  test("preview only reads counts, even with a production build: " + url, async () => {
    const result = await render({ url, configuration: { siteUrl: url } });
    assert.equal(result.scripts.length, 0);
    assert.equal(result.events.length, 0);
    assert.equal(result.requests.length, 1);
    assert.equal(result.counter.hidden, false);
  });
}

test("development mode and alternate hosts do not send analytics", async () => {
  assert.equal((await render({ configuration: { production: "false" } })).scripts.length, 0);
  assert.equal((await render({ url: "https://preview.example.org/" })).scripts.length, 0);
});

test("empty or malformed account codes make no network requests", async () => {
  for (const code of ["", "https://example.goatcounter.com", "invalid/name"]) {
    const result = await render({ configuration: { goatcounterCode: code } });
    assert.equal(result.requests.length, 0);
    assert.equal(result.scripts.length, 0);
    assert.equal(result.counter.hidden, true);
  }
});

test("real zero is shown, not replaced with a fabricated count", async () => {
  const result = await render({ data: { count: "0" } });
  assert.equal(result.counter.textContent, "Site visits: 0");
  assert.equal(result.counter.hidden, false);
});

test("GoatCounter's missing-path JSON zero is displayed without inventing visits", async () => {
  const result = await render({ ok: false, status: 404, data: { count: "0", count_unique: "0" } });
  assert.equal(result.counter.textContent, "Site visits: 0");
  assert.equal(result.counter.hidden, false);
});

test("other failures and unexpected 404 responses cannot masquerade as a valid count", async () => {
  for (const [status, data] of [[403, {count:"0"}], [500, {count:"0"}], [404, {count:"123"}], [404, {}]]) {
    const result = await render({ ok: false, status, data });
    assert.equal(result.counter.hidden, true);
  }
});

for (const options of [{ fail: true }, { timeout: true }, { ok: false }, { data: null }, { data: {} }, { data: { count: "<script>" } }]) {
  test("failed or invalid responses leave the counter hidden: " + JSON.stringify(options), async () => {
    const result = await render(options);
    assert.equal(result.counter.hidden, true);
    assert.equal(result.counter.textContent, "");
    assert.equal(result.timers.size, 0);
  });
}
