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

  // 하위메뉴 링크 클릭 시 모바일 전체메뉴 닫기
  document.querySelectorAll('.gnb-panel a').forEach(function (a) {
    a.addEventListener('click', function () {
      document.body.classList.remove('nav-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
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
    // 모션 최소화 설정 시 자동 전환 끔 (접근성)
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      playing = false;
      if (playBtn) { playBtn.setAttribute('data-playing', 'false'); playBtn.textContent = '▶'; playBtn.setAttribute('aria-label', '슬라이드 재생'); }
    }
    start();
  })();

  // 소식 보드 탭
  (function () {
    var board = document.querySelector('.board');
    if (!board) return;
    var tabs = [].slice.call(board.querySelectorAll('.board-tab'));
    var panels = [].slice.call(board.querySelectorAll('.board-panel'));
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

  // 미구현 항목(ENG·정책 링크·검색 등) 클릭 시 안내 토스트
  (function () {
    var toast;
    function show(msg) {
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'status');
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.classList.add('is-show');
      clearTimeout(toast._t);
      toast._t = setTimeout(function () { toast.classList.remove('is-show'); }, 2600);
    }
    document.querySelectorAll('[data-todo]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        show(el.getAttribute('data-todo') || '아직 미구현된 항목입니다.');
      });
    });
    var search = document.querySelector('.util-search');
    if (search) search.addEventListener('submit', function (e) { e.preventDefault(); show('검색 기능은 아직 준비 중입니다.'); });
  })();

  // 활동·연구 세부탭 (위성/로켓/심우주) + URL 해시 연동
  (function () {
    var wrap = document.querySelector('.subtabs');
    if (!wrap) return;
    var btns = [].slice.call(wrap.querySelectorAll('.subtab'));
    var panels = [].slice.call(document.querySelectorAll('.subpanel'));
    function has(key) { return btns.some(function (b) { return b.dataset.tab === key; }); }
    function activate(key) {
      if (!has(key)) return;
      btns.forEach(function (b) { var on = b.dataset.tab === key; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', String(on)); });
      panels.forEach(function (p) { p.classList.toggle('is-active', p.dataset.tab === key); });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        activate(b.dataset.tab);
        if (history.replaceState) history.replaceState(null, '', '#' + b.dataset.tab);
      });
    });
    function fromHash() {
      var h = (location.hash || '').replace('#', '');
      if (h) activate(h);
    }
    // 같은 페이지에서 내비 하위메뉴(#deepspace 등)를 눌러 해시가 바뀔 때도 탭 전환
    window.addEventListener('hashchange', fromHash);
    fromHash();
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
