const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [plans] = await pool.query(
      'SELECT * FROM pricing_plans WHERE is_active = TRUE ORDER BY display_order ASC'
    );

    const parsed = plans.map((plan) => ({
      ...plan,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features,
    }));

    res.json({ success: true, data: parsed });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pricing plans.' });
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const [plans] = await pool.query('SELECT * FROM pricing_plans ORDER BY display_order ASC');
    const parsed = plans.map((plan) => ({
      ...plan,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features,
    }));
    res.json({ success: true, data: parsed });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pricing plans.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, price, billing_period, description, features, is_popular, is_active, display_order } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Name and price are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO pricing_plans (name, price, billing_period, description, features, is_popular, is_active, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, price, billing_period || 'monthly', description || null, JSON.stringify(features || []),
       is_popular || false, is_active !== undefined ? is_active : true, display_order || 0]
    );

    const [newPlan] = await pool.query('SELECT * FROM pricing_plans WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: { ...newPlan[0], features: JSON.parse(newPlan[0].features) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create pricing plan.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, price, billing_period, description, features, is_popular, is_active, display_order } = req.body;

    const [result] = await pool.query(
      `UPDATE pricing_plans SET name=?, price=?, billing_period=?, description=?, features=?,
       is_popular=?, is_active=?, display_order=? WHERE id=?`,
      [name, price, billing_period, description, JSON.stringify(features), is_popular, is_active, display_order, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Pricing plan not found.' });
    }

    const [updated] = await pool.query('SELECT * FROM pricing_plans WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: { ...updated[0], features: JSON.parse(updated[0].features) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update pricing plan.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM pricing_plans WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Pricing plan not found.' });
    }
    res.json({ success: true, message: 'Pricing plan deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete pricing plan.' });
  }
};
