require('dotenv').config();
const mysql = require('mysql2/promise');
const { slugify, generateUniqueSlug } = require('../utils/slug');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'reviewboost',
  });

  try {
    const [slugCol] = await connection.query(
      "SHOW COLUMNS FROM clients LIKE 'slug'"
    );
    if (slugCol.length === 0) {
      await connection.query(
        'ALTER TABLE clients ADD COLUMN slug VARCHAR(120) UNIQUE NULL AFTER business_name'
      );
      console.log('Added clients.slug');
    }

    const [logoCol] = await connection.query(
      "SHOW COLUMNS FROM clients LIKE 'logo'"
    );
    if (logoCol.length === 0) {
      await connection.query(
        'ALTER TABLE clients ADD COLUMN logo VARCHAR(500) NULL AFTER google_business_url'
      );
      console.log('Added clients.logo');
    }

    const [privateCol] = await connection.query(
      "SHOW COLUMNS FROM review_submissions LIKE 'is_private'"
    );
    if (privateCol.length === 0) {
      await connection.query(
        "ALTER TABLE review_submissions ADD COLUMN is_private BOOLEAN DEFAULT FALSE AFTER status"
      );
      console.log('Added review_submissions.is_private');
    }

    const [statusCol] = await connection.query(
      "SHOW COLUMNS FROM review_submissions LIKE 'status'"
    );
    if (statusCol.length > 0 && !statusCol[0].Type.includes('google_redirect')) {
      await connection.query(
        `ALTER TABLE review_submissions
         MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'private', 'google_redirect') DEFAULT 'pending'`
      );
      console.log('Updated review_submissions.status enum');
    }

    const [clients] = await connection.query('SELECT id, business_name, slug FROM clients');
    for (const client of clients) {
      if (!client.slug) {
        const slug = await generateUniqueSlug(connection, client.business_name, client.id);
        await connection.query('UPDATE clients SET slug = ? WHERE id = ?', [slug, client.id]);
        console.log(`Slug for "${client.business_name}": ${slug}`);
      }
    }

    console.log('Slug migration complete.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
