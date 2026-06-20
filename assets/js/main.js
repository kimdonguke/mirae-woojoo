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

  // 사진 라이트박스 (.js-lightbox 앵커)
  (function () {
    var links = [].slice.call(document.querySelectorAll('a.js-lightbox'));
    if (!links.length) return;
    var box = null, imgEl, capEl, curList = links, curIdx = 0, openerEl = null;

    function build() {
      box = document.createElement('div');
      box.className = 'lightbox';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.setAttribute('aria-labelledby', 'lb-cap');
      box.innerHTML =
        '<button class="lb-close" aria-label="닫기">✕</button>' +
        '<button class="lb-nav lb-prev" aria-label="이전">‹</button>' +
        '<figure class="lb-figure"><img alt=""><figcaption id="lb-cap"></figcaption></figure>' +
        '<button class="lb-nav lb-next" aria-label="다음">›</button>';
      document.body.appendChild(box);
      imgEl = box.querySelector('img');
      capEl = box.querySelector('figcaption');
      box.querySelector('.lb-close').addEventListener('click', close);
      box.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); go(-1); });
      box.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); go(1); });
      box.addEventListener('click', function (e) { if (e.target === box) close(); });
      // 포커스 트랩 (모달 내 Tab 순환)
      box.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab') return;
        var f = [].slice.call(box.querySelectorAll('button'));
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }
    function open(i) {
      if (!box) build();
      curIdx = i;
      var a = curList[curIdx];
      imgEl.src = a.getAttribute('href');
      capEl.textContent = a.getAttribute('data-caption') || '';
      box.classList.add('is-open');
      document.body.classList.add('lb-lock');
      box.querySelector('.lb-close').focus();
    }
    function close() { if (box) { box.classList.remove('is-open'); document.body.classList.remove('lb-lock'); if (openerEl) { openerEl.focus(); openerEl = null; } } }
    function go(d) { open((curIdx + d + curList.length) % curList.length); }

    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); openerEl = a; curList = links; open(i); });
    });
    document.addEventListener('keydown', function (e) {
      if (!box || !box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    });
  })();

  // 동영상 임베드 facade (클릭 시 iframe 로드 — 성능)
  (function () {
    document.querySelectorAll('.video-facade').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var url = btn.getAttribute('data-embed');
        if (!url) return;
        var f = document.createElement('iframe');
        f.src = url;
        f.title = btn.getAttribute('aria-label') || '동영상';
        f.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
        f.setAttribute('allowfullscreen', '');
        f.className = 'video-frame';
        btn.replaceWith(f);
      });
    });
  })();

  // 국제 동향 지도: 마커 클릭 → 말풍선 팝업 + 해당 국가 강조 + 좌하단 보고서 오버레이
  (function () {
    var map = document.getElementById('agencyMap');
    if (!map) return;
    var svg = map.querySelector('.worldmap-img svg');
    var markers = [].slice.call(map.querySelectorAll('.map-marker'));
    var infoBtn = map.querySelector('.map-info-btn');
    var report = map.querySelector('.map-report-overlay');
    var reportCard = report && report.querySelector('.map-report');
    var reportClose = report && report.querySelector('.map-report-close');
    // data-agency 인덱스 → 나라 path id (agencies.yaml 항목 순서와 일치)
    var COUNTRY = ['usa', 'france', 'italy', 'honshu', 'south korea', 'india', 'emirates', 'china', 'russia'];
    function clearCountry() { if (svg) [].forEach.call(svg.querySelectorAll('path.is-active'), function (p) { p.classList.remove('is-active'); }); }
    function activateCountry(idx) { if (!svg) return; var id = COUNTRY[idx]; if (!id) return; var p = svg.querySelector('[id="' + id + '"]'); if (p) p.classList.add('is-active'); }
    function closeMarkers(except) { markers.forEach(function (m) { if (m !== except) m.classList.remove('is-open'); }); }
    function closeReport() { if (report) { report.classList.remove('is-open'); if (infoBtn) infoBtn.setAttribute('aria-expanded', 'false'); } }
    function closeAll() { closeMarkers(null); closeReport(); clearCountry(); }
    markers.forEach(function (m) {
      var btn = m.querySelector('.marker-btn');
      var pop = m.querySelector('.map-popup');
      if (btn) btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = m.classList.contains('is-open');
        closeMarkers(m); closeReport(); clearCountry();
        m.classList.toggle('is-open', !open);
        if (!open) activateCountry(parseInt(m.getAttribute('data-agency'), 10));
      });
      if (pop) pop.addEventListener('click', function (e) { e.stopPropagation(); });
    });
    if (infoBtn) infoBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = report && report.classList.contains('is-open');
      closeMarkers(null); clearCountry();
      if (report) report.classList.toggle('is-open', !open);
      infoBtn.setAttribute('aria-expanded', String(!open));
    });
    if (reportCard) reportCard.addEventListener('click', function (e) { e.stopPropagation(); });
    if (reportClose) reportClose.addEventListener('click', function (e) { e.stopPropagation(); closeReport(); });
    if (report) report.addEventListener('click', function () { closeReport(); });
    document.addEventListener('click', function () { closeAll(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
  })();
})();
