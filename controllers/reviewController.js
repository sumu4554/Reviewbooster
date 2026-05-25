const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [reviews] = await pool.query(`
      SELECT r.*, c.business_name AS client_business_name
      FROM reviews r
      LEFT JOIN clients c ON r.client_id = c.id
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, c.business_name AS client_business_name
      FROM reviews r LEFT JOIN clients c ON r.client_id = c.id
      WHERE r.id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review campaign not found.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch review campaign.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { client_id, campaign_name, platform, target_count, current_count, status, start_date, end_date, notes } = req.body;

    if (!campaign_name) {
      return res.status(400).json({ success: false, message: 'Campaign name is required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO reviews (client_id, campaign_name, platform, target_count, current_count, status, start_date, end_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [client_id || null, campaign_name, platform || 'google', target_count || 0, current_count || 0,
       status || 'planning', start_date || null, end_date || null, notes || null]
    );

    const [newReview] = await pool.query('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newReview[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create review campaign.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { client_id, campaign_name, platform, target_count, current_count, status, start_date, end_date, notes } = req.body;

    const [result] = await pool.query(
      `UPDATE reviews SET client_id=?, campaign_name=?, platform=?, target_count=?, current_count=?,
       status=?, start_date=?, end_date=?, notes=? WHERE id=?`,
      [client_id, campaign_name, platform, target_count, current_count, status, start_date, end_date, notes, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Review campaign not found.' });
    }

    const [updated] = await pool.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update review campaign.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Review campaign not found.' });
    }
    res.json({ success: true, message: 'Review campaign deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete review campaign.' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT
        COUNT(*) AS total_campaigns,
        SUM(current_count) AS total_reviews,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_campaigns,
        AVG(CASE WHEN target_count > 0 THEN (current_count / target_count) * 100 ELSE 0 END) AS avg_progress
      FROM reviews
    `);
    res.json({ success: true, data: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch review stats.' });
  }
};
