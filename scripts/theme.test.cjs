const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/src/theme.js'), 'utf8');

function setup({ preference = null, systemDark = false, storageAvailable = true } = {}) {
  const window = new EventTarget();
  const system = new EventTarget();
  system.matches = systemDark;
  window.matchMedia = () => system;
  let stored = preference;
  const elements = new Map();
  function $(selector) {
    if (typeof selector === 'function') return selector();
    if (!elements.has(selector)) {
      const attributes = new Map();
      const classes = new Set();
      const handlers = new Map();
      elements.set(selector, {
        attributes, classes, handlers,
        attr(name, value) {
          if (value === undefined) return attributes.get(name);
          attributes.set(name, value);
          return this;
        },
        removeAttr(name) { attributes.delete(name); return this; },
        toggleClass(name, enabled) {
          if (enabled) classes.add(name);
          else classes.delete(name);
          return this;
        },
        on(name, handler) { handlers.set(name, handler); return this; }
      });
    }
    return elements.get(selector);
  }
  const localStorage = {
    getItem() {
      if (!storageAvailable) throw new Error('Storage unavailable');
      return stored;
    },
    setItem(_key, value) {
      if (!storageAvailable) throw new Error('Storage unavailable');
      stored = value;
    }
  };
  vm.runInNewContext(source, { $, window, localStorage });
  return {
    window, system,
    setStored(value) { stored = value; },
    stored: () => stored,
    click: () => $('#theme-toggle').handlers.get('click')(),
    theme: () => $('html').attr('data-theme') || 'light',
    icon: () => [...$('#theme-icon').classes].sort()
  };
}

test('initial theme respects an explicit preference over the system', () => {
  const light = setup({ preference: 'light', systemDark: true });
  assert.equal(light.theme(), 'light');
  assert.deepEqual(light.icon(), ['fa-sun']);
  const dark = setup({ preference: 'dark' });
  assert.equal(dark.theme(), 'dark');
  assert.deepEqual(dark.icon(), ['fa-moon']);
});

test('missing and invalid preferences follow system changes', () => {
  const page = setup({ preference: 'invalid', systemDark: true });
  assert.equal(page.theme(), 'dark');
  page.system.matches = false;
  page.system.dispatchEvent(new Event('change'));
  assert.equal(page.theme(), 'light');
  page.setStored(null);
  page.system.matches = true;
  page.system.dispatchEvent(new Event('change'));
  assert.equal(page.theme(), 'dark');
});

test('theme button updates both storage and the visible icon', () => {
  const page = setup();
  page.click();
  assert.equal(page.theme(), 'dark');
  assert.equal(page.stored(), 'dark');
  assert.deepEqual(page.icon(), ['fa-moon']);
  page.click();
  assert.equal(page.theme(), 'light');
  assert.equal(page.stored(), 'light');
});

test('cache restoration rereads theme changes made on Terminal', () => {
  const page = setup({ preference: 'light' });
  page.setStored('dark');
  page.window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }));
  assert.equal(page.theme(), 'dark');
  assert.deepEqual(page.icon(), ['fa-moon']);
  page.setStored('light');
  page.window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }));
  assert.equal(page.theme(), 'light');
  assert.deepEqual(page.icon(), ['fa-sun']);
});

test('cache restoration also respects Terminal resetting the preference to system', () => {
  const page = setup({ preference: 'light', systemDark: true });
  page.setStored(null);
  page.window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }));
  assert.equal(page.theme(), 'dark');
});

test('storage changes and clearing storage refresh the theme, unrelated keys do not', () => {
  const page = setup();
  page.setStored('dark');
  page.window.dispatchEvent(Object.assign(new Event('storage'), { key: 'unrelated' }));
  assert.equal(page.theme(), 'light');
  page.window.dispatchEvent(Object.assign(new Event('storage'), { key: 'theme' }));
  assert.equal(page.theme(), 'dark');
  page.setStored(null);
  page.window.dispatchEvent(Object.assign(new Event('storage'), { key: null }));
  assert.equal(page.theme(), 'light');
});

test('unavailable storage does not discard the current page preference on restoration', () => {
  const page = setup({ storageAvailable: false });
  page.click();
  page.window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }));
  assert.equal(page.theme(), 'dark');
  page.system.matches = true;
  page.system.dispatchEvent(new Event('change'));
  page.system.matches = false;
  page.system.dispatchEvent(new Event('change'));
  assert.equal(page.theme(), 'dark');
});
