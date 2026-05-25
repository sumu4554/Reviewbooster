document.addEventListener('DOMContentLoaded', () => {
  injectLayout('post-review');
  if (typeof initNavbar === 'function') initNavbar();
  if (typeof initSmoothScroll === 'function') initSmoothScroll();
  initPostReviewPage();
});

let selectedRating = 5;
let selectedClient = null;

async function initPostReviewPage() {
  initStarRating();
  initForm();
  await loadBusinesses();
  await loadPublishedReviews();
}

function initStarRating() {
  const stars = document.querySelectorAll('.star-btn');
  const label = document.getElementById('star-rating-label');
  const hidden = document.getElementById('review-rating');
  const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  function setRating(value) {
    selectedRating = value;
    hidden.value = value;
    stars.forEach((star) => {
      star.classList.toggle('active', parseInt(star.dataset.value, 10) <= value);
    });
    label.textContent = `${labels[value - 1]} — ${value} star${value > 1 ? 's' : ''}`;
  }

  stars.forEach((star) => {
    star.addEventListener('click', () => setRating(parseInt(star.dataset.value, 10)));
    star.addEventListener('mouseenter', () => {
      const hover = parseInt(star.dataset.value, 10);
      stars.forEach((s) => s.classList.toggle('hover', parseInt(s.dataset.value, 10) <= hover));
    });
  });

  document.getElementById('star-rating').addEventListener('mouseleave', () => {
    stars.forEach((s) => s.classList.remove('hover'));
    setRating(selectedRating);
  });

  setRating(5);
}

async function loadBusinesses() {
  const select = document.getElementById('review-client');
  if (!select) return;

  try {
    const res = await api.reviewPosts.getClients();
    const clients = res.data || [];

    select.innerHTML = '<option value="">— Select business —</option>';

    if (clients.length === 0) {
      select.innerHTML += '<option value="" disabled>No businesses available yet</option>';
      document.getElementById('review-business-label').textContent =
        'No businesses listed yet. Add clients in admin first.';
      return;
    }

    clients.forEach((client) => {
      const option = document.createElement('option');
      option.value = client.id;
      option.textContent = client.business_name;
      select.appendChild(option);
    });

    if (!select.dataset.bound) {
      select.dataset.bound = 'true';
      select.addEventListener('change', async () => {
        const id = select.value;
        if (!id) {
          selectedClient = null;
          document.getElementById('review-business-label').textContent =
            'Select a business and share your feedback';
          return;
        }
        try {
          const { data } = await api.reviewPosts.getClient(id);
          selectedClient = data;
          document.getElementById('review-business-label').textContent =
            `Reviewing: ${data.business_name}`;
        } catch {
          selectedClient = null;
        }
      });
    }

    const params = new URLSearchParams(window.location.search);
    const clientId = params.get('client');
    if (clientId && select.querySelector(`option[value="${clientId}"]`)) {
      select.value = clientId;
      select.dispatchEvent(new Event('change'));
    }
  } catch (err) {
    select.innerHTML = '<option value="">Unable to load businesses</option>';
    document.getElementById('review-business-label').textContent =
      err.message?.includes('Cannot reach server')
        ? 'Server offline — run npm start and open http://localhost:3000/post-review.html'
        : 'Could not load businesses. Restart server: npm start';
  }
}

async function loadPublishedReviews() {
  const list = document.getElementById('published-reviews-list');
  try {
    const { data } = await api.reviewPosts.getPublic();

    if (!data.length) {
      list.innerHTML = '<p class="text-muted" style="font-size:0.875rem">No published reviews yet. Be the first!</p>';
      return;
    }

    list.innerHTML = data
      .map(
        (r) => `
      <article class="published-review-item">
        <div class="published-review-stars">${'★'.repeat(Math.round(r.rating))}</div>
        <p>${escapeHtml(r.content)}</p>
        <footer>
          <strong>${escapeHtml(r.reviewer_name)}</strong>
          <span>${escapeHtml(r.business_name)}</span>
        </footer>
      </article>`
      )
      .join('');
  } catch {
    list.innerHTML = '<p class="text-muted" style="font-size:0.875rem">Could not load reviews.</p>';
  }
}

function initForm() {
  const form = document.getElementById('post-review-form');
  const messageEl = document.getElementById('post-review-message');
  const successEl = document.getElementById('post-review-success');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageEl.className = 'form-message';
    messageEl.style.display = 'none';

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    const payload = {
      client_id: document.getElementById('review-client').value || null,
      reviewer_name: document.getElementById('review-name').value.trim(),
      reviewer_email: document.getElementById('review-email').value.trim(),
      rating: parseFloat(document.getElementById('review-rating').value),
      content: document.getElementById('review-content').value.trim(),
    };

    try {
      const result = await api.reviewPosts.submit(payload);

      form.hidden = true;
      successEl.hidden = false;
      document.getElementById('success-text').textContent = result.message;

      const googleCta = document.getElementById('google-review-cta');
      const googleLink = document.getElementById('google-review-link');
      if (result.google_review_url) {
        googleCta.hidden = false;
        googleLink.href = result.google_review_url;
      } else {
        googleCta.hidden = true;
      }

      await loadPublishedReviews();
    } catch (err) {
      messageEl.textContent = err.message || 'Failed to submit review.';
      messageEl.className = 'form-message error';
      messageEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });

  document.getElementById('post-another-btn').addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    successEl.hidden = true;
    selectedRating = 5;
    document.querySelectorAll('.star-btn').forEach((s, i) => s.classList.toggle('active', i < 5));
    document.getElementById('review-rating').value = '5';
    document.getElementById('star-rating-label').textContent = 'Excellent — 5 stars';
    messageEl.style.display = 'none';
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
