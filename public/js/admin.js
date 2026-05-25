let clientsCache = [];

const panelTitles = {
  overview: 'Dashboard Overview',
  clients: 'Manage Clients',
  reviews: 'Review Campaigns',
  'posted-reviews': 'Posted Reviews',
  testimonials: 'Testimonials',
  pricing: 'Pricing Plans',
  messages: 'Contact Messages',
};

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initLogin();
  initNavigation();
  initForms();
  initSidebarToggle();
});

function checkAuth() {
  const token = localStorage.getItem('adminToken');
  if (token) {
    api.auth.verify()
      .then((res) => showDashboard(res.admin))
      .catch(() => {
        localStorage.removeItem('adminToken');
        showLogin();
      });
  } else {
    showLogin();
  }
}

function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('dashboard').style.display = 'none';
}

function showDashboard(admin) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'flex';
  const name = admin?.name || admin?.email || 'Admin';
  const nameEl = document.getElementById('admin-name-text');
  const avatarEl = document.getElementById('admin-avatar');
  if (nameEl) nameEl.textContent = name;
  if (avatarEl) {
    avatarEl.textContent = name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
  loadOverview();
}

function initLogin() {
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('login-error');
    errorEl.classList.remove('show');

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    try {
      const res = await api.auth.login(email, password);
      localStorage.setItem('adminToken', res.token);
      showDashboard(res.admin);
    } catch (err) {
      errorEl.textContent = err.message === 'Invalid credentials.'
        ? 'Invalid email or password. Default: admin@reviewboost.com / ReviewBoost@2026! (or run npm run reset-admin)'
        : (err.message || 'Login failed. Open http://localhost:3000/admin with npm start running.');
      errorEl.classList.add('show');
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    showLogin();
  });
}

function initNavigation() {
  document.querySelectorAll('.admin-nav-item[data-panel]').forEach((item) => {
    item.addEventListener('click', () => {
      const panel = item.dataset.panel;
      switchPanel(panel);
      document.getElementById('admin-sidebar')?.classList.remove('open');
      document.getElementById('sidebar-backdrop')?.classList.remove('open');
    });
  });
}

function switchPanel(panel) {
  document.querySelectorAll('.admin-nav-item').forEach((i) => i.classList.remove('active'));
  document.querySelector(`[data-panel="${panel}"]`)?.classList.add('active');

  document.querySelectorAll('.admin-panel').forEach((p) => p.classList.remove('active'));
  document.getElementById(`panel-${panel}`)?.classList.add('active');

  document.getElementById('panel-title').textContent = panelTitles[panel] || 'Dashboard';

  const loaders = {
    overview: loadOverview,
    clients: loadClients,
    reviews: loadReviews,
    'posted-reviews': loadPostedReviews,
    testimonials: loadTestimonials,
    pricing: loadPricing,
    messages: loadMessages,
  };

  loaders[panel]?.();
}

function initSidebarToggle() {
  const sidebar = document.getElementById('admin-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  const closeSidebar = () => {
    sidebar?.classList.remove('open');
    backdrop?.classList.remove('open');
  };

  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    backdrop?.classList.toggle('open');
  });

  backdrop?.addEventListener('click', closeSidebar);
}

async function loadOverview() {
  try {
    const { data } = await api.stats.getDashboard();
    document.getElementById('stat-clients').textContent = data.stats.totalClients;
    document.getElementById('stat-reviews').textContent = data.stats.totalReviews;
    document.getElementById('stat-campaigns').textContent = data.stats.activeCampaigns;
    document.getElementById('stat-messages').textContent = data.stats.unreadMessages;

    fillTable('recent-clients-table', data.recentClients, (c) => `
      <tr>
        <td>${esc(c.business_name)}</td>
        <td>${esc(c.contact_name)}</td>
        <td><span class="status-badge ${c.status}">${c.status}</span></td>
      </tr>`);

    fillTable('recent-messages-table', data.recentMessages, (m) => `
      <tr>
        <td>${esc(m.name)}</td>
        <td>${esc(m.email)}</td>
        <td>${formatDate(m.created_at)}</td>
      </tr>`);
  } catch (err) {
    console.error(err);
  }
}

async function loadClients() {
  try {
    const { data } = await api.clients.getAll();
    clientsCache = data;

    fillTable('clients-table', data, (c) => `
      <tr>
        <td><strong>${esc(c.business_name)}</strong><br><span style="font-size:0.75rem;color:var(--admin-text-muted)">${esc(c.email)}</span></td>
        <td>
          <code style="font-size:0.75rem">/${esc(c.slug || '—')}</code>
        </td>
        <td>${esc(c.contact_name)}<br><span style="font-size:0.75rem;color:var(--admin-text-muted)">${esc(c.phone || '')}</span></td>
        <td><span class="status-badge ${c.status}">${c.status}</span></td>
        <td class="table-actions">
          <button class="table-btn table-btn-edit" onclick="copyReviewLink('${c.slug}')" title="Copy review page URL">Copy</button>
          <button class="table-btn table-btn-edit" onclick="openQrCode('${c.slug}')" title="Download QR code">QR</button>
          <button class="table-btn table-btn-edit" onclick="editClient(${c.id})">Edit</button>
          <button class="table-btn table-btn-delete" onclick="deleteClient(${c.id})">Delete</button>
        </td>
      </tr>`);
  } catch (err) {
    console.error(err);
  }
}

async function loadReviews() {
  try {
    await populateClientSelect('review-client');
    const { data } = await api.reviews.getAll();

    fillTable('reviews-table', data, (r) => `
      <tr>
        <td>${esc(r.campaign_name)}</td>
        <td>${esc(r.client_business_name || '—')}</td>
        <td>${esc(r.platform)}</td>
        <td>${r.current_count}/${r.target_count}</td>
        <td><span class="status-badge ${r.status}">${r.status}</span></td>
        <td class="table-actions">
          <button class="table-btn table-btn-edit" onclick="editReview(${r.id})">Edit</button>
          <button class="table-btn table-btn-delete" onclick="deleteReview(${r.id})">Delete</button>
        </td>
      </tr>`);
  } catch (err) {
    console.error(err);
  }
}

async function loadTestimonials() {
  try {
    const { data } = await api.testimonials.getAll();

    fillTable('testimonials-table', data, (t) => `
      <tr>
        <td>${esc(t.client_name)}</td>
        <td>${esc(t.business_name)}</td>
        <td>${t.rating} ★</td>
        <td>${t.is_featured ? 'Yes' : 'No'}</td>
        <td class="table-actions">
          <button class="table-btn table-btn-edit" onclick="editTestimonial(${t.id})">Edit</button>
          <button class="table-btn table-btn-delete" onclick="deleteTestimonial(${t.id})">Delete</button>
        </td>
      </tr>`);
  } catch (err) {
    console.error(err);
  }
}

async function loadPricing() {
  try {
    const { data } = await api.pricing.getAllAdmin();

    fillTable('pricing-table', data, (p) => `
      <tr>
        <td>${esc(p.name)}</td>
        <td>${formatINR(p.price)}</td>
        <td>${esc(p.billing_period)}</td>
        <td>${p.is_popular ? 'Yes' : 'No'}</td>
        <td>${p.is_active ? 'Yes' : 'No'}</td>
        <td class="table-actions">
          <button class="table-btn table-btn-edit" onclick="editPricing(${p.id})">Edit</button>
          <button class="table-btn table-btn-delete" onclick="deletePricing(${p.id})">Delete</button>
        </td>
      </tr>`);
  } catch (err) {
    console.error(err);
  }
}

async function loadMessages() {
  try {
    const { data } = await api.contact.getAll();

    fillTable('messages-table', data, (m) => `
      <tr style="${m.is_read ? '' : 'background:rgba(37,99,235,0.05)'}">
        <td>${esc(m.name)}</td>
        <td>${esc(m.email)}</td>
        <td>${esc(m.business_name || '—')}</td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.message)}</td>
        <td>${formatDate(m.created_at)}</td>
        <td class="table-actions">
          ${!m.is_read ? `<button class="table-btn table-btn-edit" onclick="markMessageRead(${m.id})">Mark Read</button>` : ''}
          <button class="table-btn table-btn-delete" onclick="deleteMessage(${m.id})">Delete</button>
        </td>
      </tr>`);
  } catch (err) {
    console.error(err);
  }
}

function initForms() {
  document.getElementById('client-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('client-id').value;
    const data = {
      business_name: document.getElementById('client-business').value,
      contact_name: document.getElementById('client-contact').value,
      email: document.getElementById('client-email').value,
      phone: document.getElementById('client-phone').value,
      industry: document.getElementById('client-industry').value,
      google_business_url: document.getElementById('client-gbp').value,
      logo: document.getElementById('client-logo').value,
      status: document.getElementById('client-status').value,
      notes: document.getElementById('client-notes').value,
    };

    try {
      if (id) await api.clients.update(id, data);
      else await api.clients.create(data);
      closeModal('client-modal');
      loadClients();
    } catch (err) {
      alert(err.message);
    }
  });

  document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('review-id').value;
    const data = {
      campaign_name: document.getElementById('review-campaign').value,
      client_id: document.getElementById('review-client').value || null,
      platform: document.getElementById('review-platform').value,
      target_count: parseInt(document.getElementById('review-target').value, 10) || 0,
      current_count: parseInt(document.getElementById('review-current').value, 10) || 0,
      status: document.getElementById('review-status').value,
      start_date: document.getElementById('review-start').value || null,
      end_date: document.getElementById('review-end').value || null,
      notes: document.getElementById('review-notes').value,
    };

    try {
      if (id) await api.reviews.update(id, data);
      else await api.reviews.create(data);
      closeModal('review-modal');
      loadReviews();
    } catch (err) {
      alert(err.message);
    }
  });

  document.getElementById('testimonial-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('testimonial-id').value;
    const data = {
      client_name: document.getElementById('testimonial-client').value,
      business_name: document.getElementById('testimonial-business').value,
      content: document.getElementById('testimonial-content').value,
      rating: parseFloat(document.getElementById('testimonial-rating').value) || 5,
      avatar_initials: document.getElementById('testimonial-initials').value,
      is_featured: document.getElementById('testimonial-featured').value === 'true',
      display_order: parseInt(document.getElementById('testimonial-order').value, 10) || 0,
    };

    try {
      if (id) await api.testimonials.update(id, data);
      else await api.testimonials.create(data);
      closeModal('testimonial-modal');
      loadTestimonials();
    } catch (err) {
      alert(err.message);
    }
  });

  document.getElementById('pricing-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('pricing-id').value;
    const features = document.getElementById('pricing-features').value
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const data = {
      name: document.getElementById('pricing-name').value,
      price: parseFloat(document.getElementById('pricing-price').value),
      billing_period: document.getElementById('pricing-period').value,
      description: document.getElementById('pricing-desc').value,
      features,
      is_popular: document.getElementById('pricing-popular').value === 'true',
      is_active: document.getElementById('pricing-active').value === 'true',
      display_order: parseInt(document.getElementById('pricing-order').value, 10) || 0,
    };

    try {
      if (id) await api.pricing.update(id, data);
      else await api.pricing.create(data);
      closeModal('pricing-modal');
      loadPricing();
    } catch (err) {
      alert(err.message);
    }
  });
}

function openClientModal(client = null) {
  document.getElementById('client-modal-title').textContent = client ? 'Edit Client' : 'Add Client';
  document.getElementById('client-id').value = client?.id || '';
  document.getElementById('client-business').value = client?.business_name || '';
  document.getElementById('client-contact').value = client?.contact_name || '';
  document.getElementById('client-email').value = client?.email || '';
  document.getElementById('client-phone').value = client?.phone || '';
  document.getElementById('client-industry').value = client?.industry || '';
  document.getElementById('client-gbp').value = client?.google_business_url || '';
  document.getElementById('client-logo').value = client?.logo || '';
  document.getElementById('client-status').value = client?.status || 'active';
  document.getElementById('client-notes').value = client?.notes || '';
  const slugPreview = document.getElementById('client-slug-preview');
  const slugUrl = document.getElementById('client-slug-url');
  if (client?.slug) {
    slugPreview.style.display = 'block';
    slugUrl.value = `${window.location.origin}/${client.slug}`;
  } else {
    slugPreview.style.display = 'none';
    slugUrl.value = '';
  }
  openModal('client-modal');
}

async function editClient(id) {
  const client = clientsCache.find((c) => c.id === id);
  if (client) openClientModal(client);
}

async function deleteClient(id) {
  if (!confirm('Delete this client?')) return;
  try {
    await api.clients.delete(id);
    loadClients();
  } catch (err) {
    alert(err.message);
  }
}

function openReviewModal(review = null) {
  populateClientSelect('review-client', review?.client_id);
  document.getElementById('review-modal-title').textContent = review ? 'Edit Campaign' : 'Add Campaign';
  document.getElementById('review-id').value = review?.id || '';
  document.getElementById('review-campaign').value = review?.campaign_name || '';
  document.getElementById('review-platform').value = review?.platform || 'google';
  document.getElementById('review-target').value = review?.target_count || 0;
  document.getElementById('review-current').value = review?.current_count || 0;
  document.getElementById('review-status').value = review?.status || 'planning';
  document.getElementById('review-start').value = review?.start_date ? review.start_date.split('T')[0] : '';
  document.getElementById('review-end').value = review?.end_date ? review.end_date.split('T')[0] : '';
  document.getElementById('review-notes').value = review?.notes || '';
  openModal('review-modal');
}

async function editReview(id) {
  const { data } = await api.reviews.getAll();
  const review = data.find((r) => r.id === id);
  if (review) openReviewModal(review);
}

async function deleteReview(id) {
  if (!confirm('Delete this campaign?')) return;
  try {
    await api.reviews.delete(id);
    loadReviews();
  } catch (err) {
    alert(err.message);
  }
}

function openTestimonialModal(testimonial = null) {
  document.getElementById('testimonial-modal-title').textContent = testimonial ? 'Edit Testimonial' : 'Add Testimonial';
  document.getElementById('testimonial-id').value = testimonial?.id || '';
  document.getElementById('testimonial-client').value = testimonial?.client_name || '';
  document.getElementById('testimonial-business').value = testimonial?.business_name || '';
  document.getElementById('testimonial-content').value = testimonial?.content || '';
  document.getElementById('testimonial-rating').value = testimonial?.rating || 5;
  document.getElementById('testimonial-initials').value = testimonial?.avatar_initials || '';
  document.getElementById('testimonial-featured').value = testimonial?.is_featured !== false ? 'true' : 'false';
  document.getElementById('testimonial-order').value = testimonial?.display_order || 0;
  openModal('testimonial-modal');
}

async function editTestimonial(id) {
  const { data } = await api.testimonials.getAll();
  const t = data.find((item) => item.id === id);
  if (t) openTestimonialModal(t);
}

async function deleteTestimonial(id) {
  if (!confirm('Delete this testimonial?')) return;
  try {
    await api.testimonials.delete(id);
    loadTestimonials();
  } catch (err) {
    alert(err.message);
  }
}

function openPricingModal(plan = null) {
  document.getElementById('pricing-modal-title').textContent = plan ? 'Edit Plan' : 'Add Pricing Plan';
  document.getElementById('pricing-id').value = plan?.id || '';
  document.getElementById('pricing-name').value = plan?.name || '';
  document.getElementById('pricing-price').value = plan?.price || '';
  document.getElementById('pricing-period').value = plan?.billing_period || 'monthly';
  document.getElementById('pricing-desc').value = plan?.description || '';
  document.getElementById('pricing-features').value = (plan?.features || []).join('\n');
  document.getElementById('pricing-popular').value = plan?.is_popular ? 'true' : 'false';
  document.getElementById('pricing-active').value = plan?.is_active !== false ? 'true' : 'false';
  document.getElementById('pricing-order').value = plan?.display_order || 0;
  openModal('pricing-modal');
}

async function editPricing(id) {
  const { data } = await api.pricing.getAllAdmin();
  const plan = data.find((p) => p.id === id);
  if (plan) openPricingModal(plan);
}

async function deletePricing(id) {
  if (!confirm('Delete this pricing plan?')) return;
  try {
    await api.pricing.delete(id);
    loadPricing();
  } catch (err) {
    alert(err.message);
  }
}

async function markMessageRead(id) {
  try {
    await api.contact.markRead(id);
    loadMessages();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  try {
    await api.contact.delete(id);
    loadMessages();
  } catch (err) {
    alert(err.message);
  }
}

async function populateClientSelect(selectId, selectedId = null) {
  if (clientsCache.length === 0) {
    const { data } = await api.clients.getAll();
    clientsCache = data;
  }

  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">— Select Client —</option>' +
    clientsCache.map((c) => `<option value="${c.id}" ${c.id == selectedId ? 'selected' : ''}>${esc(c.business_name)}</option>`).join('');
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function fillTable(tableId, data, rowFn) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="10">No data found.</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(rowFn).join('');
}

function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadPostedReviews() {
  try {
    const { data } = await api.reviewPosts.getAll();

    fillTable('posted-reviews-table', data, (r) => {
      const isPrivate = r.status === 'private' || r.is_private;
      const rowStyle = isPrivate ? 'background:rgba(245,158,11,0.08)' : (r.status === 'google_redirect' ? 'background:rgba(34,197,94,0.06)' : '');
      const typeLabel = isPrivate ? 'Private' : (r.status === 'google_redirect' ? 'Google redirect' : r.status);
      const typeClass = isPrivate ? 'private' : (r.status === 'google_redirect' ? 'google_redirect' : r.status);
      return `
      <tr style="${rowStyle}">
        <td>${esc(r.reviewer_name)}</td>
        <td>${esc(r.business_name)}</td>
        <td>${r.rating} ★</td>
        <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(r.content)}">${esc(r.content)}</td>
        <td><span class="status-badge ${typeClass}">${typeLabel}</span></td>
        <td>${formatDate(r.created_at)}</td>
        <td class="table-actions">
          ${r.status === 'google_redirect' ? `
            <button class="table-btn table-btn-edit" onclick="approvePostedReview(${r.id})">Publish</button>
          ` : ''}
          ${isPrivate ? `
            <button class="table-btn table-btn-edit" onclick="markPrivateHandled(${r.id})">Mark handled</button>
          ` : ''}
          <button class="table-btn table-btn-delete" onclick="deletePostedReview(${r.id})">Delete</button>
        </td>
      </tr>`;
    });
  } catch (err) {
    console.error(err);
  }
}

async function approvePostedReview(id) {
  if (!confirm('Approve this review and publish on the website?')) return;
  try {
    await api.reviewPosts.approve(id);
    loadPostedReviews();
  } catch (err) {
    alert(err.message);
  }
}

async function rejectPostedReview(id) {
  if (!confirm('Reject this review?')) return;
  try {
    await api.reviewPosts.reject(id);
    loadPostedReviews();
  } catch (err) {
    alert(err.message);
  }
}

async function deletePostedReview(id) {
  if (!confirm('Delete this posted review?')) return;
  try {
    await api.reviewPosts.delete(id);
    loadPostedReviews();
  } catch (err) {
    alert(err.message);
  }
}

async function markPrivateHandled(id) {
  try {
    await api.reviewPosts.reject(id);
    loadPostedReviews();
  } catch (err) {
    alert(err.message);
  }
}

function copyReviewLink(slug) {
  if (!slug) return alert('Save the client first to generate a review page URL.');
  const url = `${window.location.origin}/${slug}`;
  navigator.clipboard.writeText(url).then(() => {
    alert(`Review page URL copied:\n${url}`);
  }).catch(() => {
    prompt('Copy this review page URL:', url);
  });
}

function openQrCode(slug) {
  if (!slug) return alert('No slug available.');
  window.open(api.reviewPosts.getQrUrl(slug), '_blank');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

window.openClientModal = openClientModal;
window.openReviewModal = openReviewModal;
window.openTestimonialModal = openTestimonialModal;
window.openPricingModal = openPricingModal;
window.editClient = editClient;
window.deleteClient = deleteClient;
window.editReview = editReview;
window.deleteReview = deleteReview;
window.editTestimonial = editTestimonial;
window.deleteTestimonial = deleteTestimonial;
window.editPricing = editPricing;
window.deletePricing = deletePricing;
window.markMessageRead = markMessageRead;
window.deleteMessage = deleteMessage;
window.approvePostedReview = approvePostedReview;
window.rejectPostedReview = rejectPostedReview;
window.deletePostedReview = deletePostedReview;
window.markPrivateHandled = markPrivateHandled;
window.copyReviewLink = copyReviewLink;
window.openQrCode = openQrCode;
window.closeModal = closeModal;
