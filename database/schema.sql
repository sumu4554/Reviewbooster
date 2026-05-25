CREATE DATABASE IF NOT EXISTS reviewboost;
USE reviewboost;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL,
  slug VARCHAR(120) UNIQUE,
  contact_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  industry VARCHAR(100),
  google_business_url TEXT,
  logo VARCHAR(500),
  status ENUM('active', 'paused', 'completed') DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT,
  campaign_name VARCHAR(255) NOT NULL,
  platform ENUM('google', 'facebook', 'yelp', 'other') DEFAULT 'google',
  target_count INT DEFAULT 0,
  current_count INT DEFAULT 0,
  status ENUM('planning', 'active', 'paused', 'completed') DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS review_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT,
  reviewer_name VARCHAR(150) NOT NULL,
  reviewer_email VARCHAR(255),
  business_name VARCHAR(255) NOT NULL,
  rating DECIMAL(2,1) NOT NULL DEFAULT 5.0,
  content TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'private', 'google_redirect') DEFAULT 'pending',
  is_private BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_name VARCHAR(150) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 5.0,
  avatar_initials VARCHAR(5),
  is_featured BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  business_name VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pricing_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  billing_period ENUM('monthly', 'yearly', 'one-time') DEFAULT 'monthly',
  description TEXT,
  features JSON,
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stat_key VARCHAR(50) NOT NULL UNIQUE,
  stat_value INT NOT NULL DEFAULT 0,
  label VARCHAR(100) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO site_stats (stat_key, stat_value, label) VALUES
  ('reviews_delivered', 1247, 'Reviews Delivered'),
  ('happy_clients', 186, 'Happy Clients'),
  ('avg_rating_boost', 48, 'Avg Rating Boost %'),
  ('campaigns_active', 42, 'Active Campaigns')
ON DUPLICATE KEY UPDATE stat_value = stat_value;

INSERT INTO pricing_plans (name, price, billing_period, description, features, is_popular, display_order) VALUES
('Starter', 7999.00, 'monthly', 'Perfect for small local businesses getting started.', '["Google Business Profile audit", "Review request templates", "Monthly reputation report", "Email support"]', FALSE, 1),
('Growth', 14999.00, 'monthly', 'Ideal for growing businesses ready to scale reviews.', '["Everything in Starter", "Review campaign management", "Customer feedback collection", "Bi-weekly strategy calls", "Priority support"]', TRUE, 2),
('Enterprise', 24999.00, 'monthly', 'Full-service reputation management for established brands.', '["Everything in Growth", "Multi-location support", "Dedicated account manager", "Custom review workflows", "Advanced analytics dashboard"]', FALSE, 3);

INSERT INTO clients (business_name, contact_name, email, phone, industry, google_business_url, status) VALUES
('SmileCare Dental', 'Dr. Priya Sharma', 'priya@smilecare.in', '+91 98765 43210', 'Dental', 'https://maps.google.com', 'active'),
('Kumar Motors', 'Rajesh Kumar', 'rajesh@kumarmotors.in', '+91 98765 43211', 'Automotive', 'https://maps.google.com', 'active');

INSERT INTO testimonials (client_name, business_name, content, rating, avatar_initials, display_order) VALUES
('Dr. Priya Sharma', 'SmileCare Dental, Bengaluru', 'ReviewBoost helped us go from 3.8 to 4.9 stars in just 3 months. Their customer engagement approach feels authentic and professional.', 5.0, 'PS', 1),
('Rajesh Kumar', 'Kumar Motors, Hyderabad', 'Our local visibility improved dramatically. More customers mention finding us through Google reviews now.', 5.0, 'RK', 2),
('Ananya Reddy', 'Glow Wellness Spa, Chennai', 'The team understands reputation management deeply. Professional, transparent, and results-driven service.', 4.9, 'AR', 3),
('Vikram Mehta', 'Mehta & Associates, Mumbai', 'We saw a 40% increase in consultation requests after improving our Google rating. Highly recommend ReviewBoost.', 5.0, 'VM', 4);
