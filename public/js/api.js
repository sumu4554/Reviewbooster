const API_BASE = (() => {
  const port = window.location.port;
  const host = window.location.hostname || 'localhost';
  if (window.location.protocol === 'file:' || (port && port !== '3000' && port !== '')) {
    return `http://${host}:3000/api`;
  }
  return '/api';
})();

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('adminToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
    } catch {
      throw new Error('Cannot reach server. Run "npm start" and open http://localhost:3000/admin');
    }

    let data = {};
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server returned an invalid response. Is the backend running?');
      }
    }

    if (response.status === 401 && endpoint !== '/auth/login') {
      localStorage.removeItem('adminToken');
    }

    if (!response.ok) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
  },

  get(endpoint) {
    return this.request(endpoint);
  },

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  },

  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  auth: {
    login: (email, password) => api.post('/auth/login', { email, password }),
    verify: () => api.get('/auth/verify'),
  },

  clients: {
    getAll: () => api.get('/clients'),
    create: (data) => api.post('/clients', data),
    update: (id, data) => api.put(`/clients/${id}`, data),
    delete: (id) => api.delete(`/clients/${id}`),
  },

  reviews: {
    getAll: () => api.get('/reviews'),
    getStats: () => api.get('/reviews/stats/summary'),
    create: (data) => api.post('/reviews', data),
    update: (id, data) => api.put(`/reviews/${id}`, data),
    delete: (id) => api.delete(`/reviews/${id}`),
  },

  testimonials: {
    getAll: (featured) => api.get(`/testimonials${featured ? '?featured=true' : ''}`),
    create: (data) => api.post('/testimonials', data),
    update: (id, data) => api.put(`/testimonials/${id}`, data),
    delete: (id) => api.delete(`/testimonials/${id}`),
  },

  pricing: {
    getAll: () => api.get('/pricing'),
    getAllAdmin: () => api.get('/pricing/admin/all'),
    create: (data) => api.post('/pricing', data),
    update: (id, data) => api.put(`/pricing/${id}`, data),
    delete: (id) => api.delete(`/pricing/${id}`),
  },

  contact: {
    submit: (data) => api.post('/contact', data),
    getAll: () => api.get('/contact'),
    markRead: (id) => api.patch(`/contact/${id}/read`),
    delete: (id) => api.delete(`/contact/${id}`),
  },

  stats: {
    getAll: () => api.get('/stats'),
    getDashboard: () => api.get('/stats/dashboard'),
    update: (data) => api.put('/stats', data),
  },

  reviewPosts: {
    getBusiness: (slug) => api.get(`/review-posts/business/${slug}`),
    getQrUrl: (slug) => `/api/review-posts/business/${slug}/qr`,
    submit: (data) => api.post('/review-posts/submit', data),
    getAll: () => api.get('/review-posts'),
    approve: (id) => api.patch(`/review-posts/${id}/approve`),
    reject: (id) => api.patch(`/review-posts/${id}/reject`),
    delete: (id) => api.delete(`/review-posts/${id}`),
  },
};

window.api = api;
