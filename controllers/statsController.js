const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [stats] = await pool.query('SELECT * FROM site_stats ORDER BY id ASC');
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch site stats.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { stat_key, stat_value } = req.body;

    if (!stat_key || stat_value === undefined) {
      return res.status(400).json({ success: false, message: 'Stat key and value are required.' });
    }

    await pool.query('UPDATE site_stats SET stat_value = ? WHERE stat_key = ?', [stat_value, stat_key]);
    const [updated] = await pool.query('SELECT * FROM site_stats WHERE stat_key = ?', [stat_key]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update stat.' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [[clientCount]] = await pool.query('SELECT COUNT(*) AS count FROM clients');
    const [[reviewCount]] = await pool.query('SELECT SUM(current_count) AS count FROM reviews');
    const [[campaignCount]] = await pool.query("SELECT COUNT(*) AS count FROM reviews WHERE status = 'active'");
    const [[messageCount]] = await pool.query('SELECT COUNT(*) AS count FROM contact_messages WHERE is_read = FALSE');
    const [recentClients] = await pool.query('SELECT * FROM clients ORDER BY created_at DESC LIMIT 5');
    const [recentMessages] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5');

    res.json({
      success: true,
      data: {
        stats: {
          totalClients: clientCount.count,
          totalReviews: reviewCount.count || 0,
          activeCampaigns: campaignCount.count,
          unreadMessages: messageCount.count,
        },
        recentClients,
        recentMessages,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data.' });
  }
};
