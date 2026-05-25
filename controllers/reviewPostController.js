const pool = require('../config/db');

exports.getBySlug = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, business_name, slug, logo, industry,
              google_business_url AS google_review_url, status
       FROM clients WHERE slug = ? AND status = 'active'`,
      [req.params.slug]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load business.' });
  }
};

exports.submit = async (req, res) => {
  try {
    const { slug, reviewer_name, reviewer_email, rating, content } = req.body;

    if (!slug) {
      return res.status(400).json({ success: false, message: 'Invalid business page.' });
    }

    if (!reviewer_name || !content) {
      return res.status(400).json({ success: false, message: 'Your name and feedback are required.' });
    }

    const ratingNum = parseFloat(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: 'Please select a rating from 1 to 5 stars.' });
    }

    if (content.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Please write a bit more about your experience.' });
    }

    const [clients] = await pool.query(
      'SELECT id, business_name, google_business_url FROM clients WHERE slug = ? AND status = ?',
      [slug, 'active']
    );

    if (clients.length === 0) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    const client = clients[0];

    if (reviewer_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(reviewer_email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }
    }

    const isPositive = ratingNum >= 4;
    const status = isPositive ? 'google_redirect' : 'private';
    const isPrivate = !isPositive;

    const [result] = await pool.query(
      `INSERT INTO review_submissions
        (client_id, reviewer_name, reviewer_email, business_name, rating, content, status, is_private)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client.id,
        reviewer_name.trim(),
        reviewer_email?.trim() || null,
        client.business_name,
        ratingNum,
        content.trim(),
        status,
        isPrivate,
      ]
    );

    if (isPositive && client.id) {
      await pool.query(
        `UPDATE reviews SET current_count = current_count + 1
         WHERE client_id = ? AND status = 'active'
         ORDER BY created_at DESC LIMIT 1`,
        [client.id]
      );
    }

    if (isPositive) {
      return res.status(201).json({
        success: true,
        type: 'positive',
        message: 'Thank you! Please also share your experience on Google — it helps us a lot.',
        google_review_url: client.google_business_url || null,
        id: result.insertId,
      });
    }

    res.status(201).json({
      success: true,
      type: 'negative',
      message: 'We\'re sorry for your experience. Your feedback has been sent privately to our team so we can improve.',
      id: result.insertId,
    });
  } catch (error) {
    console.error('Review submit error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit feedback. Please try again.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT rs.*, c.business_name AS linked_business, c.slug AS client_slug
      FROM review_submissions rs
      LEFT JOIN clients c ON rs.client_id = c.id
      ORDER BY rs.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch posted reviews.' });
  }
};

exports.approve = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query('SELECT * FROM review_submissions WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const review = rows[0];
    if (review.status === 'approved') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Review is already approved.' });
    }

    const initials = review.reviewer_name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    await connection.query(
      `INSERT INTO testimonials (client_name, business_name, content, rating, avatar_initials, is_featured, display_order)
       VALUES (?, ?, ?, ?, ?, TRUE, 0)`,
      [review.reviewer_name, review.business_name, review.content, review.rating, initials]
    );

    await connection.query(
      `UPDATE review_submissions SET status = 'approved', approved_at = NOW() WHERE id = ?`,
      [req.params.id]
    );

    await connection.commit();
    res.json({ success: true, message: 'Review approved and published on the website.' });
  } catch (error) {
    await connection.rollback();
    console.error('Approve review error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve review.' });
  } finally {
    connection.release();
  }
};

exports.reject = async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE review_submissions SET status = 'rejected' WHERE id = ? AND status IN ('pending', 'private', 'google_redirect')`,
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Review not found or already processed.' });
    }
    res.json({ success: true, message: 'Review rejected.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject review.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM review_submissions WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
};
