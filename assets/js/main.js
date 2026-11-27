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

  // мобильное меню
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger && nav) {
    var menu = document.createElement('div');
    menu.className = 'menu';
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', 'Меню');
    menu.innerHTML =
      '<button class="menu__close" aria-label="Закрыть меню">&times;</button>' +
      '<nav class="menu__links"></nav>';
    var links = menu.querySelector('.menu__links');
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
      var c = document.createElement('a');
      c.href = a.getAttribute('href');
      c.textContent = a.textContent;
      links.appendChild(c);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.menu-extra a'), function (a) {
      var c = document.createElement('a');
      c.href = a.getAttribute('href');
      c.textContent = a.textContent;
      c.className = 'menu__sub';
      if (a.target) c.target = a.target;
      c.rel = 'noopener';
      links.appendChild(c);
    });
    var phone = document.querySelector('.header__phone');
    if (phone) {
      var p = document.createElement('a');
      p.className = 'menu__phone';
      p.href = phone.getAttribute('href');
      p.textContent = phone.textContent;
      links.appendChild(p);
    }
    document.body.appendChild(menu);

    var toggleMenu = function (open) {
      document.body.classList.toggle('is-menu', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', function () { toggleMenu(!document.body.classList.contains('is-menu')); });
    menu.querySelector('.menu__close').addEventListener('click', function () { toggleMenu(false); });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') toggleMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') toggleMenu(false);
    });
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

  // лајтбокс: одна галерея на все группы фото (МОП + интерьеры)
  var grids = document.querySelectorAll('.grid');
  if (grids.length) {
    var items = [];
    Array.prototype.forEach.call(grids, function (g) {
      Array.prototype.push.apply(items, Array.prototype.slice.call(g.querySelectorAll('button')));
    });
    if (!items.length) return;

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
      img.src = items[current].getAttribute('data-full');
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
