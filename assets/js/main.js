(function () {
  'use strict';

  // header
  var header = document.querySelector('.header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-solid', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // hero video: load and play only when visible, respect data saving
  var frame = document.querySelector('.hero__frame');
  var video = frame && frame.querySelector('video[data-src]');
  if (video) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var saveData = navigator.connection && navigator.connection.saveData;
    if (!reduce && !saveData && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          if (!video.src) {
            video.src = video.getAttribute('data-src');
            video.load();
          }
          video.play().then(function () {
            video.classList.add('is-playing');
          }).catch(function () {});
          io.disconnect();
        });
      }, { rootMargin: '200px' });
      io.observe(frame);
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) video.pause();
        else if (video.src) video.play().catch(function () {});
      });
    }
  }

  // lightbox
  var grid = document.querySelector('.grid');
  if (grid) {
    var items = Array.prototype.slice.call(grid.querySelectorAll('button'));
    var lb = document.createElement('div');
    lb.className = 'lb';
    lb.innerHTML =
      '<button class="lb__btn lb__prev" aria-label="Назад">&#8249;</button>' +
      '<img alt="">' +
      '<button class="lb__btn lb__next" aria-label="Вперёд">&#8250;</button>' +
      '<button class="lb__btn lb__close" aria-label="Закрыть">&times;</button>' +
      '<div class="lb__count"></div>';
    document.body.appendChild(lb);
    var img = lb.querySelector('img');
    var count = lb.querySelector('.lb__count');
    var current = 0;

    function show(i) {
      current = (i + items.length) % items.length;
      var src = items[current].getAttribute('data-full');
      img.src = src;
      count.textContent = (current + 1) + ' / ' + items.length;
    }
    function open(i) {
      show(i);
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    items.forEach(function (btn, i) {
      btn.addEventListener('click', function () { open(i); });
    });
    lb.querySelector('.lb__prev').addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
    lb.querySelector('.lb__next').addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });
    lb.querySelector('.lb__close').addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });

    var startX = 0;
    lb.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }
})();
