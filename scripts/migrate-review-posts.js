require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'reviewboost',
  });

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS review_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT,
        reviewer_name VARCHAR(150) NOT NULL,
        reviewer_email VARCHAR(255),
        business_name VARCHAR(255) NOT NULL,
        rating DECIMAL(2,1) NOT NULL DEFAULT 5.0,
        content TEXT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        approved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
      )
    `);
    console.log('review_submissions table ready.');
    console.log('Public review page: http://localhost:3000/post-review.html');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
