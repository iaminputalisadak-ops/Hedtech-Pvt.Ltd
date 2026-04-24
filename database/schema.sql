-- Hedztech CMS schema (MySQL 8+)
CREATE DATABASE IF NOT EXISTS hedztech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hedztech;

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(128) PRIMARY KEY,
  `value` MEDIUMTEXT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS services (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(64) NOT NULL DEFAULT 'code',
  image_url VARCHAR(512) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS skills (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  level TINYINT UNSIGNED NOT NULL DEFAULT 80,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS projects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  body MEDIUMTEXT,
  category VARCHAR(64) NOT NULL DEFAULT 'web',
  service_type VARCHAR(16) NOT NULL DEFAULT 'web',
  status VARCHAR(16) NOT NULL DEFAULT 'completed',
  client_name VARCHAR(255) DEFAULT '',
  tags VARCHAR(512) DEFAULT '',
  progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
  meta_title VARCHAR(255) DEFAULT NULL,
  meta_description TEXT DEFAULT NULL,
  og_image VARCHAR(512) DEFAULT NULL,
  og_image_alt VARCHAR(255) DEFAULT NULL,
  image_url VARCHAR(512) DEFAULT NULL,
  image_fit VARCHAR(16) NOT NULL DEFAULT 'contain',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  live_url VARCHAR(512) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  body MEDIUMTEXT,
  category VARCHAR(64) NOT NULL DEFAULT 'news',
  tags VARCHAR(512) DEFAULT '',
  meta_title VARCHAR(255) DEFAULT NULL,
  meta_description TEXT DEFAULT NULL,
  og_image VARCHAR(512) DEFAULT NULL,
  og_image_alt VARCHAR(255) DEFAULT NULL,
  published TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trusted_companies (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(512) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS testimonials (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) DEFAULT '',
  video_url VARCHAR(512) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
  quote TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message MEDIUMTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS team_members (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) DEFAULT '',
  bio TEXT,
  photo_url VARCHAR(512) DEFAULT NULL,
  linkedin_url VARCHAR(512) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS seo_pages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  path VARCHAR(255) NOT NULL UNIQUE,
  meta_title VARCHAR(255) DEFAULT NULL,
  meta_description TEXT DEFAULT NULL,
  og_image VARCHAR(512) DEFAULT NULL,
  og_image_alt VARCHAR(255) DEFAULT NULL,
  robots VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO team_members (name, role, bio, photo_url, linkedin_url, sort_order, published) VALUES
('Karthik Sharma', 'Founder & Delivery Lead', 'Owns strategy, delivery, and client success. Focused on performance-first builds, clear communication, and measurable outcomes.', 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=640&q=80&auto=format&fit=crop', 'https://linkedin.com', 1, 1),
('Aarav Singh', 'Full‑Stack Engineer', 'Builds resilient APIs, modern React frontends, and integrations. Passionate about clean architecture and fast load times.', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=640&q=80&auto=format&fit=crop', 'https://linkedin.com', 2, 1),
('Saanvi Joshi', 'UI/UX Designer', 'Designs conversion-friendly interfaces with strong visual systems. Focus on accessibility, motion, and brand consistency.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=640&q=80&auto=format&fit=crop', 'https://linkedin.com', 3, 1),
('Rohan Patel', 'SEO & Growth', 'Handles technical SEO, structured data, analytics, and content strategy. Aligns pages with search intent and Core Web Vitals.', 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=640&q=80&auto=format&fit=crop', 'https://linkedin.com', 4, 1);

-- Default admin login: admin / password  (change immediately in production)
INSERT INTO admins (username, password_hash) VALUES (
  'admin',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
) ON DUPLICATE KEY UPDATE username = username;

INSERT INTO settings (`key`, `value`) VALUES
('site_name', 'Hedztech'),
('meta_title', 'Hedztech — Web, UX, SEO & Digital Growth'),
('meta_description', 'Hedztech delivers web development, UI/UX design, SEO, and digital marketing — fast, accessible, conversion-focused products with measurable outcomes.'),
('og_image', ''),
('canonical_base', 'http://localhost:5173'),
('project_count', '120'),
('hero_headline', 'High‑performing digital experiences that convert'),
('hero_tagline', 'Modern web, UI/UX, and SEO that drive real results—not vanity metrics.'),
('hero_eyebrow', 'Digital studio · Performance · SEO'),
('hero_cta_primary_label', 'Start a project'),
('hero_cta_primary_href', '/contact'),
('hero_cta_secondary_label', 'View selected work'),
('hero_cta_secondary_href', '/work'),
('hero_stat_label', 'Shipped milestones'),
('hero_stat_aside', 'Core Web Vitals–minded builds, accessible UI, and SEO that earns the click.'),
('brand_logo_url', ''),
('brand_mark_url', ''),
('brand_favicon_url', ''),
('hero_bg_mode', 'animated'),
('hero_wallpaper_fit', 'cover'),
('hero_wallpaper_position', 'center'),
('about_intro', 'Hedztech partners with ambitious teams to design and ship high-performance websites, products, and campaigns.'),
('mission', 'Deliver reliable, beautiful technology that moves your business forward.'),
('vision', 'To be the studio teams trust for craft, communication, and outcomes.'),
('values', '["Transparency","Performance","Partnership","Craft"]'),
('hero_gradient_css', ''),
('hero_banner_carousel_json', '[]'),
('address', 'Your City, Your Country'),
('business_phone', '+1 (555) 000-0000'),
('business_email', 'hello@hedztech.com'),
('map_lat', '40.7128'),
('map_lng', '-74.0060'),
('map_embed_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.11976397304603!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1'),
('social_linkedin', 'https://linkedin.com'),
('social_twitter', 'https://twitter.com'),
('social_github', 'https://github.com'),
('social_facebook', ''),
('social_instagram', ''),
('social_youtube', ''),
('social_tiktok', ''),
('social_whatsapp', ''),
('home_client_stories_enabled', '1'),
('reviews_autoscroll', '1')
ON DUPLICATE KEY UPDATE `key` = VALUES(`key`);

INSERT INTO services (title, description, icon, sort_order) VALUES
('Web Development', 'Scalable frontends and robust integrations — React, APIs, and performance-first delivery.', 'code', 1),
('Website Design (UI/UX)', 'Research-backed interfaces with motion, accessibility, and brand cohesion.', 'palette', 2),
('SEO Optimization', 'Technical SEO, structured data, and content strategy aligned to search intent.', 'search', 3),
('Digital Marketing', 'Campaigns, analytics, and funnels that turn traffic into qualified leads.', 'trending-up', 4),
('E-commerce Development', 'Stores that load fast, convert better, and scale with your catalog.', 'shopping-cart', 5),
('Maintenance & Support', 'Monitoring, updates, and proactive care so your site stays fast and secure.', 'life-buoy', 6);

INSERT INTO skills (name, level, sort_order) VALUES
('React & Modern JS', 95, 1),
('PHP & APIs', 90, 2),
('UI Systems & Design', 92, 3),
('SEO & Analytics', 88, 4),
('Cloud & DevOps', 82, 5);

INSERT IGNORE INTO projects (title, slug, excerpt, body, category, image_url, featured, sort_order, live_url) VALUES
('Nova Commerce', 'nova-commerce', 'Headless storefront with sub-second LCP and global CDN.', 'Full case study content managed in admin.', 'ecommerce', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80', 1, 0, 'https://example.com'),
('Pulse Analytics', 'pulse-analytics', 'Dashboard redesign that improved activation by 34%.', 'Details in admin.', 'web', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', 1, 1, NULL),
('Aurora Health Portal', 'aurora-health', 'Patient-first UX with WCAG AA compliance.', 'Details in admin.', 'web', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80', 0, 2, NULL);

INSERT IGNORE INTO blog_posts (title, slug, excerpt, body, category, tags, published) VALUES
('Core Web Vitals in 2026', 'core-web-vitals-2026', 'What still moves the needle for SEO and UX.', 'Write your full article in the admin panel.', 'SEO', 'seo,performance', 1),
('Design systems that ship', 'design-systems-that-ship', 'Tokens, components, and governance for teams.', 'Full post body from admin.', 'Design', 'design,react', 1);

INSERT INTO trusted_companies (name, logo_url, sort_order) VALUES
('Northwind', NULL, 1),
('BluePeak', NULL, 2),
('Vertex Labs', NULL, 3),
('Kite Systems', NULL, 4);

INSERT INTO testimonials (name, role, video_url, rating, quote, sort_order, published) VALUES
('Alex Rivera', 'CEO, Northwind', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5, 'Hedztech shipped on time and raised our conversion rate measurably.', 1, 1),
('Jordan Lee', 'Marketing Lead', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5, 'Clear communication and exceptional craft throughout.', 2, 1),
('Priya Nair', 'Founder, BrightWave', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5, 'Fast delivery, great communication, and the site feels premium.', 3, 1),
('Marcus Chen', 'Product Manager, Vertex Labs', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5, 'They improved our performance metrics immediately.', 4, 1),
('Aisha Khan', 'Operations Lead, Northwind', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5, 'Every milestone was clear and on schedule.', 5, 1),
('Diego Silva', 'Growth, Kite Systems', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5, 'Our leads improved after the launch and SEO cleanup.', 6, 1),
('Elena Petrova', 'CMO, BluePeak', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5, 'Beautiful design system and consistent execution.', 7, 1),
('Samir Patel', 'CTO, Aurora Health', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5, 'Solid engineering and thoughtful accessibility improvements.', 8, 1),
('Nora Johnson', 'Founder, Studio Nine', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5, 'A partner we can rely on for new launches.', 9, 1),
('Rahul Verma', 'Marketing, Pulse Analytics', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5, 'Clean UI/UX and the admin tools make updates easy.', 10, 1);
