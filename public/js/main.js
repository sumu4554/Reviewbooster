document.addEventListener('DOMContentLoaded', async () => {
  injectLayout('home', { isHome: true });
  if (typeof initNavbar === 'function') initNavbar();
  if (typeof initSmoothScroll === 'function') initSmoothScroll();
  if (typeof initCardGlow === 'function') initCardGlow();
  if (typeof initFAQ === 'function') initFAQ();
  initDynamicContent();
});

async function initDynamicContent() {
  await Promise.all([
    loadSiteStats(),
    loadTestimonials(),
    loadPricing(),
  ]);

  initContactForm('home-contact-form', 'home-form-message');
}

async function loadSiteStats() {
  try {
    const { data } = await api.stats.getAll();

    data.forEach((stat) => {
      const el = document.querySelector(`[data-stat="${stat.stat_key}"]`);
      if (el) {
        el.dataset.counter = stat.stat_value;
        if (stat.stat_key === 'avg_rating_boost') {
          el.dataset.suffix = '%';
        } else if (stat.stat_key === 'reviews_delivered') {
          el.dataset.suffix = '+';
        } else if (stat.stat_key === 'happy_clients') {
          el.dataset.suffix = '+';
        }
      }
    });

    if (typeof initCounters === 'function') {
      document.querySelectorAll('[data-counter]').forEach((el) => {
        delete el.dataset.counted;
      });
      initCounters();
    }
  } catch {
    document.querySelectorAll('[data-counter]').forEach((el) => {
      if (!el.dataset.counter) {
        el.dataset.counter = el.textContent.replace(/\D/g, '') || '0';
      }
    });
  }
}

function renderTestimonialCard(t, index, total) {
  const initials = t.avatar_initials || t.client_name.substring(0, 2).toUpperCase();
  const stars = '★'.repeat(Math.round(t.rating)) + (t.rating % 1 ? '½' : '');
  const featured = total >= 3 && index === 1 ? ' testimonial-card-featured' : '';
  const delay = ` reveal-delay-${(index % 3) + 1}`;

  return `
    <article class="testimonial-card${featured} reveal${delay}">
      <div class="testimonial-card-top">
        <span class="testimonial-quote-icon" aria-hidden="true">"</span>
        <div class="testimonial-stars" aria-label="${t.rating} out of 5 stars">${stars}</div>
      </div>
      <p class="testimonial-text">${t.content}</p>
      <div class="testimonial-footer">
        <div class="testimonial-avatar">${initials}</div>
        <div class="testimonial-info">
          <h4>${t.client_name}</h4>
          <span>${t.business_name}</span>
        </div>
        <span class="testimonial-badge">Verified</span>
      </div>
    </article>`;
}

function renderPricingCard(plan) {
  const isPopular = plan.is_popular == 1 || plan.is_popular === true;
  const tierInitial = (plan.name || 'P').charAt(0).toUpperCase();
  const features = (plan.features || [])
    .map((f) => `<li>${f}</li>`)
    .join('');

  return `
    <article class="pricing-card${isPopular ? ' pricing-card-featured popular' : ''}">
      ${isPopular ? '<span class="pricing-badge">Most Popular</span>' : ''}
      <div class="pricing-card-head">
        <div class="pricing-tier-icon">${tierInitial}</div>
        <h3 class="pricing-name">${plan.name}</h3>
        <p class="pricing-desc">${plan.description || ''}</p>
        ${renderPricingAmount(plan.price, plan.billing_period)}
      </div>
      <div class="pricing-card-body">
        <ul class="pricing-features">${features}</ul>
        <a href="/contact.html" class="btn ${isPopular ? 'btn-primary' : 'btn-outline-dark'}">Get Started</a>
      </div>
    </article>`;
}

async function loadTestimonials() {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;

  try {
    const { data } = await api.testimonials.getAll(true);

    if (data.length === 0) return;

    grid.innerHTML = data.map((t, i) => renderTestimonialCard(t, i, data.length)).join('');

    if (typeof initScrollReveal === 'function') {
      initScrollReveal();
    }
  } catch {
    /* Keep static fallback testimonials */
  }
}

async function loadPricing() {
  const grid = document.getElementById('pricing-grid');
  if (!grid) return;

  try {
    const { data } = await api.pricing.getAll();

    if (!data || data.length === 0) return;

    const sorted = [...data].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    grid.innerHTML = sorted.map((plan) => renderPricingCard(plan)).join('');
  } catch {
    /* Keep static fallback pricing */
  }
}

function initContactForm(formId, messageId) {
  const form = document.getElementById(formId);
  const messageEl = document.getElementById(messageId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    btn.disabled = true;
    btn.textContent = 'Sending...';
    messageEl.className = 'form-message';
    messageEl.style.display = 'none';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const result = await api.contact.submit(data);
      messageEl.textContent = result.message;
      messageEl.className = 'form-message success';
      form.reset();
    } catch (err) {
      messageEl.textContent = err.message || 'Something went wrong. Please try again.';
      messageEl.className = 'form-message error';
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

window.initContactForm = initContactForm;
