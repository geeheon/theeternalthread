/* ─── Audio Widget ─── */
(function () {
  'use strict';

  // Derive audio file path from current page filename
  // e.g. "vine-and-branches-flowchart.html" → "audio/vine-and-branches-flowchart.mp3"
  var pageName = location.pathname.split('/').pop() || '';
  if (!pageName || pageName === 'index.html') return; // No audio on index

  var audioSrc = 'audio/' + pageName.replace(/\.html$/, '.mp3');

  // ─── Build DOM ───
  var btn = document.createElement('button');
  btn.className = 'audio-toggle hidden';
  btn.setAttribute('aria-label', 'Listen to this page');
  btn.innerHTML =
    '<svg class="icon-play" viewBox="0 0 24 24"><polygon points="7,4 20,12 7,20" fill="currentColor" stroke="none"/></svg>' +
    '<svg class="icon-pause" viewBox="0 0 24 24" style="display:none"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/></svg>' +
    '<svg class="audio-progress-ring" viewBox="0 0 46 46">' +
    '  <circle class="audio-progress-track" cx="23" cy="23" r="22"/>' +
    '  <circle class="audio-progress-fill" cx="23" cy="23" r="22"/>' +
    '</svg>';

  // Speed popup
  var speedPopup = document.createElement('div');
  speedPopup.className = 'audio-speed';
  var speeds = [0.75, 1, 1.25, 1.5, 2];
  speeds.forEach(function (s) {
    var b = document.createElement('button');
    b.className = 'audio-speed-btn' + (s === 1 ? ' active' : '');
    b.textContent = s + 'x';
    b.setAttribute('data-speed', s);
    speedPopup.appendChild(b);
  });

  document.body.appendChild(btn);
  document.body.appendChild(speedPopup);

  var iconPlay = btn.querySelector('.icon-play');
  var iconPause = btn.querySelector('.icon-pause');
  var progressFill = btn.querySelector('.audio-progress-fill');
  var circumference = 2 * Math.PI * 22; // ~138.23

  // ─── Audio element ───
  var audio = new Audio();
  audio.preload = 'metadata';
  var isLoaded = false;

  // Check if the MP3 exists
  var req = new XMLHttpRequest();
  req.open('HEAD', audioSrc, true);
  req.onload = function () {
    if (req.status >= 200 && req.status < 400) {
      audio.src = audioSrc;
      btn.classList.remove('hidden');
      isLoaded = true;
    }
  };
  req.onerror = function () { /* no audio — button stays hidden */ };
  req.send();

  // ─── Playback controls ───
  var playing = false;
  var speedVisible = false;

  function togglePlay() {
    if (!isLoaded) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
  }

  function updatePlayState() {
    playing = !audio.paused;
    btn.classList.toggle('playing', playing);
    iconPlay.style.display = playing ? 'none' : '';
    iconPause.style.display = playing ? '' : 'none';
  }

  audio.addEventListener('play', updatePlayState);
  audio.addEventListener('pause', updatePlayState);
  audio.addEventListener('ended', function () {
    updatePlayState();
    progressFill.style.strokeDashoffset = circumference;
  });

  // Progress ring
  audio.addEventListener('timeupdate', function () {
    if (!audio.duration) return;
    var progress = audio.currentTime / audio.duration;
    progressFill.style.strokeDashoffset = circumference * (1 - progress);
  });

  // Main button: tap to play/pause
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (speedVisible) {
      hideSpeed();
    }
    togglePlay();
  });

  // Long press for speed menu
  var longPressTimer = null;
  btn.addEventListener('pointerdown', function () {
    longPressTimer = setTimeout(function () {
      longPressTimer = null;
      toggleSpeed();
    }, 500);
  });
  btn.addEventListener('pointerup', function () {
    if (longPressTimer) clearTimeout(longPressTimer);
  });
  btn.addEventListener('pointerleave', function () {
    if (longPressTimer) clearTimeout(longPressTimer);
  });

  // Right-click also opens speed menu (desktop)
  btn.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    toggleSpeed();
  });

  function toggleSpeed() {
    speedVisible = !speedVisible;
    speedPopup.classList.toggle('visible', speedVisible);
  }
  function hideSpeed() {
    speedVisible = false;
    speedPopup.classList.remove('visible');
  }

  // Speed buttons
  speedPopup.addEventListener('click', function (e) {
    var target = e.target.closest('.audio-speed-btn');
    if (!target) return;
    var speed = parseFloat(target.getAttribute('data-speed'));
    audio.playbackRate = speed;
    speedPopup.querySelectorAll('.audio-speed-btn').forEach(function (b) {
      b.classList.toggle('active', parseFloat(b.getAttribute('data-speed')) === speed);
    });
    setTimeout(hideSpeed, 200);
  });

  // Close speed popup when clicking elsewhere
  document.addEventListener('click', function (e) {
    if (speedVisible && !speedPopup.contains(e.target) && e.target !== btn) {
      hideSpeed();
    }
  });

})();
