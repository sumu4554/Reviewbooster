const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const featured = req.query.featured === 'true';
    let query = 'SELECT * FROM testimonials';
    const params = [];

    if (featured) {
      query += ' WHERE is_featured = TRUE';
    }
    query += ' ORDER BY display_order ASC, created_at DESC';

    const [testimonials] = await pool.query(query, params);
    res.json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch testimonials.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { client_name, business_name, content, rating, avatar_initials, is_featured, display_order } = req.body;

    if (!client_name || !business_name || !content) {
      return res.status(400).json({ success: false, message: 'Client name, business name, and content are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO testimonials (client_name, business_name, content, rating, avatar_initials, is_featured, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [client_name, business_name, content, rating || 5.0, avatar_initials || client_name.substring(0, 2).toUpperCase(),
       is_featured !== undefined ? is_featured : true, display_order || 0]
    );

    const [newItem] = await pool.query('SELECT * FROM testimonials WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create testimonial.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { client_name, business_name, content, rating, avatar_initials, is_featured, display_order } = req.body;

    const [result] = await pool.query(
      `UPDATE testimonials SET client_name=?, business_name=?, content=?, rating=?,
       avatar_initials=?, is_featured=?, display_order=? WHERE id=?`,
      [client_name, business_name, content, rating, avatar_initials, is_featured, display_order, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }

    const [updated] = await pool.query('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update testimonial.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }
    res.json({ success: true, message: 'Testimonial deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete testimonial.' });
  }
};
