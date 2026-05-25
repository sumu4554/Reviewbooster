let selectedRating = 5;
let businessData = null;

document.addEventListener('DOMContentLoaded', initBusinessReviewPage);

function getSlugFromPath() {
  return window.location.pathname.replace(/^\//, '').split('/')[0].trim();
}

async function initBusinessReviewPage() {
  const slug = getSlugFromPath();
  const loader = document.getElementById('page-loader');
  const error = document.getElementById('page-error');
  const content = document.getElementById('page-content');

  if (!slug) {
    loader.hidden = true;
    error.hidden = false;
    return;
  }

  try {
    const { data } = await api.reviewPosts.getBusiness(slug);
    businessData = data;

    document.title = `${data.business_name} — Share Your Experience | ReviewBoost`;
    document.getElementById('business-title').textContent = `${data.business_name} — Share Your Experience`;

    if (data.industry) {
      document.getElementById('business-industry').textContent = data.industry;
    }

    if (data.logo) {
      const img = document.getElementById('business-logo');
      img.src = data.logo;
      img.alt = data.business_name;
      img.hidden = false;
      document.getElementById('business-logo-fallback').hidden = true;
    } else {
      document.getElementById('business-logo-fallback').textContent =
        data.business_name.charAt(0).toUpperCase();
    }

    initStarRating();
    initForm(slug);

    loader.hidden = true;
    content.hidden = false;
  } catch (err) {
    console.error('Business review page load failed:', err);
    loader.hidden = true;
    error.hidden = false;
  }
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

function initForm(slug) {
  const form = document.getElementById('review-form');
  const messageEl = document.getElementById('form-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageEl.className = 'form-message';
    messageEl.style.display = 'none';

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    try {
      const result = await api.reviewPosts.submit({
        slug,
        reviewer_name: document.getElementById('review-name').value.trim(),
        reviewer_email: document.getElementById('review-email').value.trim(),
        rating: parseFloat(document.getElementById('review-rating').value),
        content: document.getElementById('review-content').value.trim(),
      });

      form.hidden = true;

      if (result.type === 'positive') {
        const positive = document.getElementById('success-positive');
        positive.hidden = false;
        document.getElementById('success-positive-text').textContent = result.message;

        const googleBtn = document.getElementById('google-review-btn');
        if (result.google_review_url) {
          googleBtn.href = result.google_review_url;
          setTimeout(() => {
            window.open(result.google_review_url, '_blank', 'noopener');
          }, 1500);
        } else {
          googleBtn.hidden = true;
          document.querySelector('.br-success-note').textContent =
            'Thank you for your wonderful feedback!';
        }
      } else {
        const negative = document.getElementById('success-negative');
        negative.hidden = false;
        document.getElementById('success-negative-text').textContent = result.message;
      }
    } catch (err) {
      messageEl.textContent = err.message || 'Failed to submit. Please try again.';
      messageEl.className = 'form-message error';
      messageEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}
