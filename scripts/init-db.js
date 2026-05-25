require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schema);
    console.log('Database schema initialized successfully.');

    const dbName = process.env.DB_NAME || 'reviewboost';
    await connection.query(`USE ${dbName}`);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@reviewboost.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const [existing] = await connection.query('SELECT id FROM admins WHERE email = ?', [adminEmail]);

    if (existing.length === 0) {
      await connection.query(
        'INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)',
        ['Admin', adminEmail, passwordHash]
      );
      console.log(`Default admin created: ${adminEmail}`);
    } else {
      await connection.query('UPDATE admins SET password_hash = ? WHERE email = ?', [passwordHash, adminEmail]);
      console.log('Admin account synced with ADMIN_PASSWORD from .env');
    }

    console.log('\nSetup complete! Run: npm start');
    console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDatabase();
