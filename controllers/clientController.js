const pool = require('../config/db');
const { generateUniqueSlug } = require('../utils/slug');

exports.getAll = async (req, res) => {
  try {
    const [clients] = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch clients.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch client.' });
  }
};

exports.getQrCode = async (req, res) => {
  try {
    const QRCode = require('qrcode');
    const [rows] = await pool.query(
      'SELECT business_name, slug FROM clients WHERE slug = ? AND status = ?',
      [req.params.slug, 'active']
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const reviewUrl = `${protocol}://${host}/${rows[0].slug}`;

    const png = await QRCode.toBuffer(reviewUrl, {
      type: 'png',
      width: 512,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="${rows[0].slug}-qr.png"`);
    res.send(png);
  } catch (error) {
    console.error('QR error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate QR code.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { business_name, contact_name, email, phone, industry, google_business_url, logo, status, notes } = req.body;

    if (!business_name || !contact_name || !email) {
      return res.status(400).json({ success: false, message: 'Business name, contact name, and email are required.' });
    }

    const slug = await generateUniqueSlug(pool, business_name);

    const [result] = await pool.query(
      `INSERT INTO clients (business_name, slug, contact_name, email, phone, industry, google_business_url, logo, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        business_name,
        slug,
        contact_name,
        email,
        phone || null,
        industry || null,
        google_business_url || null,
        logo || null,
        status || 'active',
        notes || null,
      ]
    );

    const [newClient] = await pool.query('SELECT * FROM clients WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newClient[0] });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ success: false, message: 'Failed to create client.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { business_name, contact_name, email, phone, industry, google_business_url, logo, status, notes } = req.body;

    const [existing] = await pool.query('SELECT id, business_name, slug FROM clients WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    let slug = existing[0].slug;
    if (business_name && business_name !== existing[0].business_name) {
      slug = await generateUniqueSlug(pool, business_name, req.params.id);
    }

    const [result] = await pool.query(
      `UPDATE clients SET business_name=?, slug=?, contact_name=?, email=?, phone=?, industry=?,
       google_business_url=?, logo=?, status=?, notes=? WHERE id=?`,
      [
        business_name,
        slug,
        contact_name,
        email,
        phone,
        industry,
        google_business_url,
        logo || null,
        status,
        notes,
        req.params.id,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update client.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM clients WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }
    res.json({ success: true, message: 'Client deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete client.' });
  }
};
