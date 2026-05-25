require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function resetAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@reviewboost.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'reviewboost',
  });

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const [existing] = await connection.query('SELECT id FROM admins WHERE email = ?', [email]);

    if (existing.length === 0) {
      await connection.query(
        'INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)',
        ['Admin', email, passwordHash]
      );
      console.log('Admin account created.');
    } else {
      await connection.query('UPDATE admins SET password_hash = ? WHERE email = ?', [passwordHash, email]);
      console.log('Admin password reset.');
    }

    console.log(`\nLogin at: http://localhost:${process.env.PORT || 3000}/admin`);
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Failed:', error.message);
    console.error('\nCheck MySQL is running and DB_PASSWORD in .env is correct.');
    process.exit(1);
  } finally {
    await connection.end();
  }
}

resetAdmin();
