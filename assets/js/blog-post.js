(() => {
  const post = document.querySelector('[data-blog-post]');
  if (!post) return;
  const body = post.querySelector('.blog-post__body');

  function setupTranslationNotice() {
    const button = document.querySelector('[data-translation-unavailable]');
    const notice = document.getElementById('translation-notice');
    if (!button || !notice) return;
    let hideTimer;

    function hideNotice() {
      clearTimeout(hideTimer);
      notice.textContent = '';
    }

    // Without JS, keep the unavailable button visible but disabled with an explanation.
    button.disabled = false;
    button.addEventListener('click', () => {
      clearTimeout(hideTimer);
      notice.textContent = button.dataset.translationUnavailable;
      hideTimer = setTimeout(hideNotice, 3500);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') hideNotice();
    });
    window.addEventListener('pagehide', hideNotice);
  }

  function renderMath() {
    if (!window.renderMathInElement) return;
    // The official KaTeX extension recognizes math and skips pre/code elements.
    window.renderMathInElement(body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ],
      throwOnError: false,
      trust: false
    });
  }

  function setupTableOfContents() {
    const headings = [...body.querySelectorAll('h2, h3')];
    const aside = post.querySelector('.blog-toc');
    const nav = aside.querySelector('nav');
    const toggle = aside.querySelector('.blog-toc__toggle');
    const list = document.createElement('ol');
    list.className = 'blog-toc__list';
    list.id = 'blog-toc-list';
    const links = [];
    let parentItem;
    let nestedList;

    headings.forEach((heading, index) => {
      if (!heading.id) {
        let id = 'section-' + (index + 1);
        while (document.getElementById(id)) id += '-section';
        heading.id = id;
      }
      const title = heading.textContent;
      const link = document.createElement('a');
      link.href = '#' + encodeURIComponent(heading.id);
      link.textContent = title;
      const item = document.createElement('li');
      item.append(link);
      if (heading.tagName === 'H3' && parentItem) {
        if (!nestedList) {
          nestedList = document.createElement('ol');
          parentItem.append(nestedList);
        }
        nestedList.append(item);
      } else {
        list.append(item);
        parentItem = item;
        nestedList = null;
      }
      links.push(link);

      const permalink = document.createElement('a');
      permalink.className = 'blog-heading-link';
      permalink.href = link.href;
      permalink.textContent = '#';
      permalink.setAttribute('aria-label', post.dataset.sectionLink + ': ' + title);
      heading.append(permalink);
    });

    if (headings.length < 2) return;
    // Replace optional inline Markdown TOCs; without JS they remain readable.
    body.querySelector('#markdown-toc')?.remove();
    nav.append(list);
    aside.hidden = false;
    post.classList.add('blog-post--has-toc');
    let framePending = false;
    let offset = 100;
    let activeIndex = -1;
    let layoutChanged = false;

    function revealActiveLink() {
      // Scroll only the fixed sidebar, never the article or the inline mobile TOC.
      if (getComputedStyle(aside).position !== 'fixed') return;
      const bounds = list.getBoundingClientRect();
      const linkBounds = links[activeIndex].getBoundingClientRect();
      const center = bounds.top + list.clientTop + list.clientHeight / 2;
      // Native clamping keeps the list at its start/end near the first/last sections.
      list.scrollTop += linkBounds.top + linkBounds.height / 2 - center;
    }

    function updateActiveHeading() {
      framePending = false;
      let current = 0;
      headings.forEach((heading, index) => {
        if (heading.getBoundingClientRect().top <= offset + 12) current = index;
      });
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        current = headings.length - 1;
      }
      if (current === activeIndex && !layoutChanged) return;
      links[activeIndex]?.removeAttribute('aria-current');
      links[current].setAttribute('aria-current', 'location');
      activeIndex = current;
      layoutChanged = false;
      revealActiveLink();
    }

    function scheduleUpdate() {
      if (framePending) return;
      framePending = true;
      requestAnimationFrame(updateActiveHeading);
    }

    function updateLayout() {
      offset = (document.querySelector('.masthead')?.offsetHeight || 70) + 24;
      post.style.setProperty('--blog-heading-offset', offset + 'px');
      layoutChanged = true;
      scheduleUpdate();
    }

    toggle.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', toggle.getAttribute('aria-expanded') !== 'true');
      updateLayout();
    });

    nav.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const index = links.indexOf(event.target.closest('a'));
      if (index === -1) return;

      // Keep real anchors for copying/new tabs, but normal clicks don't alter the URL.
      event.preventDefault();
      const heading = headings[index];
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
      window.scrollTo({
        top: Math.max(0, window.scrollY + heading.getBoundingClientRect().top - offset),
        behavior: 'auto'
      });
      scheduleUpdate();
    });

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', updateLayout);
    window.addEventListener('pageshow', updateLayout);
    if (window.ResizeObserver) new ResizeObserver(scheduleUpdate).observe(body);
    updateLayout();
  }

  function setupReadingProgress() {
    const progress = document.querySelector('.blog-reading-progress');
    const masthead = document.querySelector('.masthead');
    if (!progress || !masthead) return;
    // Anchor the line to the header so it follows responsive height changes.
    masthead.append(progress);
    progress.hidden = false;
    let framePending = false;

    function updateProgress() {
      framePending = false;
      const bounds = body.getBoundingClientRect();
      const start = Math.max(0, window.scrollY + bounds.top - masthead.offsetHeight);
      const end = window.scrollY + bounds.bottom - window.innerHeight;
      // A short article is complete when its entire body fits in the viewport.
      const fraction = end <= start
        ? (bounds.bottom <= window.innerHeight ? 1 : 0)
        : (window.scrollY - start) / (end - start);
      progress.value = Math.round(Math.max(0, Math.min(1, fraction)) * 100);
    }

    function scheduleUpdate() {
      if (framePending) return;
      framePending = true;
      requestAnimationFrame(updateProgress);
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('pageshow', scheduleUpdate);
    window.addEventListener('load', scheduleUpdate);
    post.addEventListener('toggle', scheduleUpdate, true);
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(scheduleUpdate);
      // Include layout changes above the body, such as expanding the inline TOC.
      observer.observe(post);
      observer.observe(masthead);
    }
    scheduleUpdate();
  }

  setupTranslationNotice();
  renderMath();
  setupTableOfContents();
  setupReadingProgress();
})();
