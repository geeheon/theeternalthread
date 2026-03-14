/* ─── Navigation Widget ─── */
(function () {
  'use strict';

  // Resolve path to site-map.json relative to current page
  var mapUrl = 'site-map.json';

  // Detect current page filename
  var currentFile = location.pathname.split('/').pop() || 'index.html';

  // Build DOM
  var toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.setAttribute('aria-label', 'Open navigation');
  toggle.innerHTML =
    '<svg viewBox="0 0 24 24"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>';

  var overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.innerHTML =
    '<div class="nav-panel">' +
    '  <div class="nav-panel-header">' +
    '    <div class="nav-panel-title">The Eternal Thread</div>' +
    '    <div class="nav-panel-sub">Tracing the structural logic of Scripture</div>' +
    '  </div>' +
    '  <button class="nav-close" aria-label="Close navigation">' +
    '    <svg viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>' +
    '  </button>' +
    '  <div class="nav-sections"></div>' +
    '  <a href="index.html" class="nav-home">\u2190 All Figures</a>' +
    '</div>';

  document.body.appendChild(toggle);
  document.body.appendChild(overlay);

  var panel = overlay.querySelector('.nav-panel');
  var sectionsContainer = overlay.querySelector('.nav-sections');
  var closeBtn = overlay.querySelector('.nav-close');

  function openNav() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeNav() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', openNav);
  closeBtn.addEventListener('click', closeNav);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeNav();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeNav();
  });

  // Fetch site-map.json and build nav
  fetch(mapUrl)
    .then(function (r) { return r.json(); })
    .then(function (data) { buildNav(data); })
    .catch(function () {
      // Silently fail — nav just won't populate
      console.warn('[nav-widget] Could not load site-map.json');
    });

  function buildNav(data) {
    var pageNum = 0;
    var activeSectionIndex = -1;

    data.sections.forEach(function (section, sIdx) {
      var sectionEl = document.createElement('div');
      sectionEl.className = 'nav-section';

      var titleEl = document.createElement('div');
      titleEl.className = 'nav-section-title';
      titleEl.innerHTML =
        '<span>' + section.title + '</span>' +
        '<svg class="chevron" viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>';

      var pagesEl = document.createElement('div');
      pagesEl.className = 'nav-pages';

      var sectionHasActive = false;

      section.pages.forEach(function (page) {
        pageNum++;
        var numStr = pageNum < 10 ? '0' + pageNum : '' + pageNum;
        var isActive = page.file === currentFile;
        if (isActive) {
          sectionHasActive = true;
          activeSectionIndex = sIdx;
        }

        var a = document.createElement('a');
        a.className = 'nav-page-link' + (isActive ? ' active' : '');
        a.href = page.file;
        a.setAttribute('data-theme', page.theme);
        a.innerHTML =
          '<div class="nav-page-num">' + numStr + '</div>' +
          '<div class="nav-page-title">' + page.title + '</div>' +
          '<div class="nav-page-verse">' + page.verse + '</div>';

        pagesEl.appendChild(a);
      });

      titleEl.addEventListener('click', function () {
        sectionEl.classList.toggle('expanded');
      });

      sectionEl.appendChild(titleEl);
      sectionEl.appendChild(pagesEl);
      sectionsContainer.appendChild(sectionEl);

      // Auto-expand section containing current page
      if (sectionHasActive) {
        sectionEl.classList.add('expanded');
      }
    });
  }

})();
