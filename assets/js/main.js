/* 미래우주 - 가벼운 인터랙션 스크립트 */
(function () {
  'use strict';

  // 모바일 메뉴 토글
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 스크롤 시 헤더 그림자
  var header = document.getElementById('site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // 현재 보고 있는 섹션에 맞춰 내비 탭 활성화 (스크롤 스파이)
  var navLinks = {};
  document.querySelectorAll('#primary-nav a[href^="#"]').forEach(function (a) {
    navLinks[a.getAttribute('href').slice(1)] = a;
  });
  var sections = document.querySelectorAll('main section[id]');
  if (sections.length && Object.keys(navLinks).length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        Object.keys(navLinks).forEach(function (k) {
          navLinks[k].classList.toggle('is-active', k === id);
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // 등장 애니메이션
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
