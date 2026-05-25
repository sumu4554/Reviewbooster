require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/db');
const { isReservedSlug } = require('./utils/slug');

const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const reviewRoutes = require('./routes/reviews');
const testimonialRoutes = require('./routes/testimonials');
const pricingRoutes = require('./routes/pricing');
const contactRoutes = require('./routes/contact');
const statsRoutes = require('./routes/stats');
const reviewPostRoutes = require('./routes/reviewPosts');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/review-posts', reviewPostRoutes);

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.get('/post-review.html', (req, res) => {
  res.redirect('/');
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/:slug', async (req, res, next) => {
  const { slug } = req.params;

  if (isReservedSlug(slug)) {
    return next();
  }

  try {
    const [rows] = await pool.query(
      'SELECT slug FROM clients WHERE slug = ? AND status = ?',
      [slug, 'active']
    );

    if (rows.length === 0) {
      return next();
    }

    res.sendFile(path.join(__dirname, 'public', 'business-review.html'));
  } catch (error) {
    console.error('Slug route error:', error);
    next(error);
  }
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found.' });
  }
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`ReviewBoost server running at http://localhost:${PORT}`);
});
