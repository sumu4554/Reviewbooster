require('dotenv').config();
const mysql = require('mysql2/promise');

async function seedClients() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'reviewboost',
  });

  try {
    const [rows] = await connection.query('SELECT COUNT(*) AS n FROM clients');
    if (rows[0].n > 0) {
      console.log(`Clients already exist (${rows[0].n}). Skipping seed.`);
      return;
    }

    await connection.query(
      `INSERT INTO clients (business_name, contact_name, email, phone, industry, google_business_url, status) VALUES
       ('SmileCare Dental', 'Dr. Priya Sharma', 'priya@smilecare.in', '+91 9876543210', 'Dental', 'https://maps.google.com', 'active'),
       ('Kumar Motors', 'Rajesh Kumar', 'rajesh@kumarmotors.in', '+91 9876543211', 'Automotive', 'https://maps.google.com', 'active'),
       ('Glow Wellness Spa', 'Ananya Reddy', 'ananya@glowspa.in', '+91 9876543212', 'Wellness', 'https://maps.google.com', 'active')`
    );
    console.log('Sample clients added for post-review page.');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedClients();
