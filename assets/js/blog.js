(function () {
  'use strict';

  var index = document.querySelector('[data-blog-index]');
  if (!index) return;

  var filters = Array.from(index.querySelectorAll('[data-blog-filter]'));
  var cards = Array.from(index.querySelectorAll('[data-blog-tags]')).map(function (element) {
    return { element: element, tags: JSON.parse(element.dataset.blogTags) };
  });

  function filterPosts() {
    var tag = '';
    try {
      if (location.hash.indexOf('#tag=') === 0) tag = decodeURIComponent(location.hash.slice(5));
    } catch (error) {
      // A malformed or outdated bookmark falls back to the full list.
    }
    if (!filters.some(function (filter) { return filter.dataset.blogFilter === tag; })) tag = '';

    cards.forEach(function (card) { card.element.hidden = !!tag && !card.tags.includes(tag); });
    filters.forEach(function (filter) {
      if (filter.dataset.blogFilter === tag) filter.setAttribute('aria-current', 'true');
      else filter.removeAttribute('aria-current');
    });
  }

  index.querySelector('[data-blog-filters]').hidden = false;
  window.addEventListener('hashchange', filterPosts);
  window.addEventListener('pageshow', filterPosts);
  filterPosts();
})();
