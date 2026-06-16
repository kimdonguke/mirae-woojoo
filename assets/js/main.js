/* 미래우주 - 인터랙션 스크립트 */
(function () {
  'use strict';

  // 모바일 전체 메뉴 토글
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // 모바일에서 GNB 하위메뉴 아코디언
  var mqMobile = window.matchMedia ? window.matchMedia('(max-width: 1024px)') : null;
  document.querySelectorAll('.gnb-item').forEach(function (item) {
    var link = item.querySelector('a');
    var panel = item.querySelector('.gnb-panel');
    if (!link || !panel) return;
    link.addEventListener('click', function (e) {
      if (mqMobile && mqMobile.matches) {
        e.preventDefault();
        item.classList.toggle('is-open');
      }
    });
  });

  // 헤더 스크롤 그림자
  var header = document.querySelector('.site-header');
  if (header) {
    var onHeaderScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 10); };
    onHeaderScroll();
    window.addEventListener('scroll', onHeaderScroll, { passive: true });
  }

  // 히어로 슬라이더
  (function () {
    var hero = document.getElementById('hero');
    if (!hero) return;
    var slides = [].slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = [].slice.call(hero.querySelectorAll('.hero-dot'));
    if (slides.length <= 1) return;

    var idx = 0, timer = null, playing = true;
    var DELAY = 5500;
    var playBtn = hero.querySelector('.hero-play');
    var nextBtn = hero.querySelector('.hero-next');
    var prevBtn = hero.querySelector('.hero-prev');

    function show(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
      dots.forEach(function (d, i) {
        var on = i === idx;
        d.classList.toggle('is-active', on);
        d.setAttribute('aria-selected', String(on));
      });
    }
    function next() { show(idx + 1); }
    function prev() { show(idx - 1); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() { stop(); if (playing) timer = setInterval(next, DELAY); }

    if (nextBtn) nextBtn.addEventListener('click', function () { next(); start(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); start(); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () { show(parseInt(d.dataset.index, 10)); start(); });
    });
    if (playBtn) {
      playBtn.addEventListener('click', function () {
        playing = !playing;
        playBtn.setAttribute('data-playing', String(playing));
        playBtn.setAttribute('aria-label', playing ? '슬라이드 일시정지' : '슬라이드 재생');
        playBtn.textContent = playing ? '❚❚' : '▶';
        if (playing) start(); else stop();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  })();

  // 소식 보드 탭
  (function () {
    var board = document.querySelector('.board');
    if (!board) return;
    var tabs = [].slice.call(board.querySelectorAll('.board-tab'));
    var panels = [].slice.call(board.querySelectorAll('.board-list'));
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var key = tab.dataset.panel;
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', String(on));
        });
        panels.forEach(function (p) { p.classList.toggle('is-active', p.dataset.panel === key); });
      });
    });
  })();

  // 플로팅 메뉴 (TOP 버튼 + 표시 토글)
  (function () {
    var floating = document.querySelector('.floating');
    var top = document.querySelector('.float-top');
    if (top) {
      top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
    if (floating) {
      var onScroll = function () { floating.classList.toggle('is-visible', window.scrollY > 300); };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  })();

  // 등장 애니메이션
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
