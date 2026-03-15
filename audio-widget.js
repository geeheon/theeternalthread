/* ─── Audio Widget ─── */
(function () {
  'use strict';

  var pageName = location.pathname.split('/').pop() || '';
  if (!pageName || pageName === 'index.html') return;

  var audioSrc = 'audio/' + pageName.replace(/\.html$/, '.mp3');

  // ─── Floating play button ───
  var toggle = document.createElement('button');
  toggle.className = 'audio-toggle hidden';
  toggle.setAttribute('aria-label', 'Listen to this page');
  toggle.innerHTML = '<svg class="icon-play" viewBox="0 0 24 24"><polygon points="8,5 20,12 8,19" fill="currentColor"/></svg>';

  // ─── Bottom bar ───
  var bar = document.createElement('div');
  bar.className = 'audio-bar';
  bar.innerHTML =
    '<div class="audio-scrub">' +
    '  <div class="audio-scrub-track"><div class="audio-scrub-fill"><div class="audio-scrub-handle"></div></div></div>' +
    '</div>' +
    '<div class="audio-controls">' +
    '  <button class="audio-btn skip" data-skip="-15" aria-label="Back 15 seconds">' +
    '    <svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/><text class="skip-label" x="12" y="14.5" text-anchor="middle">15</text></svg>' +
    '  </button>' +
    '  <button class="audio-btn play-pause" aria-label="Play">' +
    '    <svg class="pp-play" viewBox="0 0 24 24"><polygon points="8,5 20,12 8,19"/></svg>' +
    '    <svg class="pp-pause" viewBox="0 0 24 24" style="display:none"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>' +
    '  </button>' +
    '  <button class="audio-btn skip" data-skip="15" aria-label="Forward 15 seconds">' +
    '    <svg viewBox="0 0 24 24"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/><text class="skip-label" x="12" y="14.5" text-anchor="middle">15</text></svg>' +
    '  </button>' +
    '  <span class="audio-time">0:00 / 0:00</span>' +
    '  <span class="audio-spacer"></span>' +
    '  <button class="audio-speed-toggle" aria-label="Playback speed">1x</button>' +
    '  <button class="audio-close" aria-label="Close player">' +
    '    <svg viewBox="0 0 24 24"><line x1="7" y1="7" x2="17" y2="17"/><line x1="17" y1="7" x2="7" y2="17"/></svg>' +
    '  </button>' +
    '</div>';

  // Speed popup
  var speedPopup = document.createElement('div');
  speedPopup.className = 'audio-speed-popup';
  [0.75, 1, 1.25, 1.5, 2].forEach(function (s) {
    var b = document.createElement('button');
    b.className = 'audio-speed-opt' + (s === 1 ? ' active' : '');
    b.textContent = s + 'x';
    b.setAttribute('data-speed', s);
    speedPopup.appendChild(b);
  });

  document.body.appendChild(toggle);
  document.body.appendChild(bar);
  document.body.appendChild(speedPopup);

  // ─── Element refs ───
  var scrubArea = bar.querySelector('.audio-scrub');
  var scrubFill = bar.querySelector('.audio-scrub-fill');
  var ppBtn = bar.querySelector('.play-pause');
  var ppPlay = bar.querySelector('.pp-play');
  var ppPause = bar.querySelector('.pp-pause');
  var timeEl = bar.querySelector('.audio-time');
  var speedBtn = bar.querySelector('.audio-speed-toggle');
  var closeBtn = bar.querySelector('.audio-close');
  var skipBtns = bar.querySelectorAll('.skip');

  // ─── Audio ───
  var audio = new Audio();
  audio.preload = 'metadata';
  var isLoaded = false;
  var barOpen = false;
  var speedOpen = false;
  var currentSpeed = 1;

  // Check if MP3 exists
  var req = new XMLHttpRequest();
  req.open('HEAD', audioSrc, true);
  req.onload = function () {
    if (req.status >= 200 && req.status < 400) {
      audio.src = audioSrc;
      toggle.classList.remove('hidden');
      isLoaded = true;
    }
  };
  req.onerror = function () {};
  req.send();

  // ─── Helpers ───
  function fmt(sec) {
    if (!sec || !isFinite(sec)) return '0:00';
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function openBar() {
    bar.classList.add('open');
    toggle.classList.add('bar-open');
    document.body.classList.add('audio-bar-open');
    barOpen = true;
  }

  function closeBar() {
    bar.classList.remove('open');
    toggle.classList.remove('bar-open');
    document.body.classList.remove('audio-bar-open');
    barOpen = false;
    hideSpeed();
  }

  function updatePlayPause() {
    var playing = !audio.paused;
    ppPlay.style.display = playing ? 'none' : '';
    ppPause.style.display = playing ? '' : 'none';
  }

  function showSpeed() { speedOpen = true; speedPopup.classList.add('visible'); }
  function hideSpeed() { speedOpen = false; speedPopup.classList.remove('visible'); }

  // ─── Events: floating button ───
  toggle.addEventListener('click', function () {
    if (!isLoaded) return;
    audio.play();
    openBar();
  });

  // ─── Events: bar controls ───
  ppBtn.addEventListener('click', function () {
    if (audio.paused) { audio.play(); } else { audio.pause(); }
  });

  skipBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var skip = parseInt(btn.getAttribute('data-skip'), 10);
      audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + skip));
    });
  });

  closeBtn.addEventListener('click', function () {
    audio.pause();
    closeBar();
  });

  // ─── Events: audio state ───
  audio.addEventListener('play', updatePlayPause);
  audio.addEventListener('pause', updatePlayPause);
  audio.addEventListener('ended', function () {
    updatePlayPause();
    scrubFill.style.width = '0%';
  });

  audio.addEventListener('timeupdate', function () {
    if (!audio.duration) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    scrubFill.style.width = pct + '%';
    timeEl.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
  });

  audio.addEventListener('loadedmetadata', function () {
    timeEl.textContent = '0:00 / ' + fmt(audio.duration);
  });

  // ─── Scrub interaction ───
  var dragging = false;

  function scrubTo(e) {
    var rect = scrubArea.querySelector('.audio-scrub-track').getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    var pct = Math.max(0, Math.min(1, x / rect.width));
    if (audio.duration) {
      audio.currentTime = pct * audio.duration;
      scrubFill.style.width = (pct * 100) + '%';
    }
  }

  scrubArea.addEventListener('mousedown', function (e) {
    dragging = true;
    scrubArea.classList.add('dragging');
    scrubTo(e);
  });
  scrubArea.addEventListener('touchstart', function (e) {
    dragging = true;
    scrubArea.classList.add('dragging');
    scrubTo(e);
  }, { passive: true });

  document.addEventListener('mousemove', function (e) { if (dragging) scrubTo(e); });
  document.addEventListener('touchmove', function (e) { if (dragging) scrubTo(e); }, { passive: true });

  document.addEventListener('mouseup', function () {
    if (dragging) { dragging = false; scrubArea.classList.remove('dragging'); }
  });
  document.addEventListener('touchend', function () {
    if (dragging) { dragging = false; scrubArea.classList.remove('dragging'); }
  });

  // ─── Speed controls ───
  speedBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (speedOpen) hideSpeed(); else showSpeed();
  });

  speedPopup.addEventListener('click', function (e) {
    var opt = e.target.closest('.audio-speed-opt');
    if (!opt) return;
    currentSpeed = parseFloat(opt.getAttribute('data-speed'));
    audio.playbackRate = currentSpeed;
    speedBtn.textContent = currentSpeed + 'x';
    speedBtn.classList.toggle('non-default', currentSpeed !== 1);
    speedPopup.querySelectorAll('.audio-speed-opt').forEach(function (b) {
      b.classList.toggle('active', parseFloat(b.getAttribute('data-speed')) === currentSpeed);
    });
    setTimeout(hideSpeed, 150);
  });

  document.addEventListener('click', function (e) {
    if (speedOpen && !speedPopup.contains(e.target) && e.target !== speedBtn) {
      hideSpeed();
    }
  });

})();
