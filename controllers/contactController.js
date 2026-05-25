const pool = require('../config/db');

exports.submit = async (req, res) => {
  try {
    const { name, email, phone, business_name, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const [result] = await pool.query(
      'INSERT INTO contact_messages (name, email, phone, business_name, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, business_name || null, message]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. We will get back to you shortly.',
      id: result.insertId,
    });
  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit message. Please try again.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const [messages] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
};

exports.markRead = async (req, res) => {
  try {
    await pool.query('UPDATE contact_messages SET is_read = TRUE WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Message marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update message.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }
    res.json({ success: true, message: 'Message deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
};
