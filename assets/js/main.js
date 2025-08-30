// Main interactions for Arya's dark portfolio
// - Mobile nav toggle
// - Reveal on scroll
// - Stats count-up
// - Subtle magnetic button effect
// - Testimonials carousel

(function () {
  const doc = document;

  // Utils
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  // Header nav toggle
  const navToggle = doc.querySelector('.nav__toggle');
  const navList = doc.querySelector('.nav__list');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when clicking a link (mobile UX)
    navList.addEventListener('click', (e) => {
      const t = e.target;
      if (t && t.tagName === 'A') {
        navList.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Auto-close on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navList.classList.contains('is-open')) {
        navList.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Reveal on scroll using IntersectionObserver
  const revealEls = Array.from(doc.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // Stats count-up
  const statEls = Array.from(doc.querySelectorAll('.stat__num'));
  const animateStat = (el) => {
    const target = Number(el.dataset.target || 0);
    const duration = 1200; // ms
    const start = performance.now();
    const step = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = t * (2 - t); // easeOutQuad
      el.textContent = Math.floor(eased * target).toString();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Trigger stat animation when visible
  const statObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateStat(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 }) : null;

  statEls.forEach(el => {
    if (statObserver) statObserver.observe(el); else animateStat(el);
  });

  // Magnetic button effect (subtle, stable)
  const magneticButtons = Array.from(doc.querySelectorAll('.magnetic'));
  magneticButtons.forEach((btn) => {
    const strength = 12; // px
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      const moveX = (relX / rect.width - 0.5) * strength;
      const moveY = (relY / rect.height - 0.5) * strength;
      btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  // Testimonials carousel (auto)
  const carousel = doc.querySelector('.carousel');
  if (carousel) {
    const track = carousel.querySelector('.carousel__track');
    const slides = Array.from(carousel.querySelectorAll('.testimonial'));
    const dotsWrap = carousel.querySelector('.carousel__dots');
    let index = 0;

    // Create dots
    slides.forEach((_, i) => {
      const b = doc.createElement('button');
      b.setAttribute('aria-label', `Go to slide ${i + 1}`);
      b.addEventListener('click', () => {
        index = i; update();
      });
      dotsWrap.appendChild(b);
    });

    const dots = Array.from(dotsWrap.querySelectorAll('button'));

    const update = () => {
      const offset = -index * 100;
      track.style.transform = `translateX(${offset}%)`;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    };

    const autoplay = carousel.dataset.autoplay === 'true';
    let timer = null;

    const start = () => {
      if (!autoplay) return;
      stop();
      timer = setInterval(() => {
        index = (index + 1) % slides.length; update();
      }, 3500);
    };
    const stop = () => timer && clearInterval(timer);

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);

    update();
    start();
  }

  // Scroll progress bar + active section highlight
  const progress = doc.querySelector('.scroll-progress');
  const sections = Array.from(doc.querySelectorAll('section[id]'));
  const navLinks = Array.from(doc.querySelectorAll('.nav__list a'));
  const linkFor = (id) => navLinks.find(a => a.getAttribute('href') === `#${id}`);

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = doc.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progress) progress.style.width = `${pct}%`;

    // Active link highlight
    let currentId = sections[0]?.id || '';
    for (const sec of sections) {
      const top = sec.getBoundingClientRect().top + window.scrollY - 100;
      if (scrollTop >= top) currentId = sec.id;
    }
    navLinks.forEach(a => a.classList.remove('is-active'));
    const active = linkFor(currentId);
    if (active) active.classList.add('is-active');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Footer year
  const yearEl = doc.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

  // Background parallax (mouse + scroll)
  const bg = doc.querySelector('.bg__gradient');
  if (bg) {
    const updateMouse = (e) => {
      const { innerWidth: w, innerHeight: h } = window;
      const x = (e.clientX / w - 0.5) * 10; // up to ±10px
      const y = (e.clientY / h - 0.5) * 10;
      doc.documentElement.style.setProperty('--bg-tx', `${x}px`);
      doc.documentElement.style.setProperty('--bg-ty', `${y}px`);
    };
    const updateScroll = () => {
      const y = window.scrollY * -0.02; // subtle upwards drift on scroll
      doc.documentElement.style.setProperty('--bg-scroll', `${y}px`);
    };
    window.addEventListener('mousemove', updateMouse, { passive: true });
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
  }
})();