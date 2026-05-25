function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));
}

function initNavbar() {
  const navbar = document.getElementById('main-navbar') || document.querySelector('.navbar');
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });
  }
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const startTime = performance.now();
  const suffix = element.dataset.suffix || '';
  const prefix = element.dataset.prefix || '';

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * eased);

    element.textContent = prefix + current.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          const target = parseInt(entry.target.dataset.counter, 10);
          animateCounter(entry.target, target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function initParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  for (let i = 0; i < 40; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${8 + Math.random() * 12}s`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    particle.style.width = `${2 + Math.random() * 4}px`;
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }
}

function initCardGlow() {
  document.querySelectorAll('.glass-card.glow-hover').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

function initFAQ() {
  document.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', () => {
      const item = question.closest('.faq-item');
      const wasOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach((openItem) => {
        openItem.classList.remove('open');
      });

      if (!wasOpen) {
        item.classList.add('open');
      }
    });
  });
}

class TestimonialSlider {
  constructor(container) {
    this.container = container;
    this.track = container.querySelector('.testimonials-track');
    this.slides = container.querySelectorAll('.testimonial-slide');
    this.dotsContainer = container.querySelector('.testimonial-dots');
    this.currentIndex = 0;
    this.autoPlayInterval = null;

    if (this.slides.length === 0) return;

    this.createDots();
    this.startAutoPlay();
    this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
    this.container.addEventListener('mouseleave', () => this.startAutoPlay());
  }

  createDots() {
    if (!this.dotsContainer) return;

    this.slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = `testimonial-dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.addEventListener('click', () => this.goTo(i));
      this.dotsContainer.appendChild(dot);
    });
  }

  goTo(index) {
    this.currentIndex = index;
    this.track.style.transform = `translateX(-${index * 100}%)`;

    this.dotsContainer?.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  next() {
    this.goTo((this.currentIndex + 1) % this.slides.length);
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => this.next(), 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
}

function initTestimonialSlider() {
  const slider = document.querySelector('.testimonials-slider');
  if (slider) {
    new TestimonialSlider(slider);
  }
}

function initPageTransition() {
  document.body.classList.add('page-transition');

  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http') || href.startsWith('//')) {
      return;
    }

    if (link.hostname && link.hostname !== window.location.hostname) return;

    link.addEventListener('click', (e) => {
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  });
}

function initBenefitsGraphs() {
  const section = document.querySelector('.benefits-section');
  if (!section) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        section.querySelectorAll('.benefit-progress-item').forEach((item, i) => {
          const bar = item.querySelector('.benefit-progress-bar span');
          const label = item.querySelector('[data-progress]');
          const width = bar?.dataset.width || label?.dataset.progress || 0;
          if (bar) bar.style.setProperty('--progress', width);
          setTimeout(() => {
            item.classList.add('animated');
            if (label) {
              label.dataset.suffix = '%';
              animateCounter(label, parseInt(label.dataset.progress, 10), 1200);
            }
          }, i * 120);
        });

        section.querySelector('.graph-card-main')?.classList.add('animated');
        section.querySelector('.graph-donut-wrap')?.classList.add('animated');

        const barChart = section.querySelector('.graph-bar-chart');
        if (barChart) {
          barChart.classList.add('animated');
          barChart.querySelectorAll('.graph-bar').forEach((bar) => {
            bar.style.setProperty('--bar-height', bar.dataset.height || '50');
          });
        }

        observer.disconnect();
      });
    },
    { threshold: 0.25 }
  );

  observer.observe(section);
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initNavbar();
  initSmoothScroll();
  initCounters();
  initParticles();
  initCardGlow();
  initFAQ();
  initTestimonialSlider();
  initPageTransition();
  initBenefitsGraphs();
});

window.initScrollReveal = initScrollReveal;
window.TestimonialSlider = TestimonialSlider;
window.animateCounter = animateCounter;
