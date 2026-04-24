-- Add SEO fields to projects (meta title/description + OG image + alt)
ALTER TABLE projects
  ADD COLUMN meta_title VARCHAR(255) DEFAULT NULL AFTER progress,
  ADD COLUMN meta_description TEXT DEFAULT NULL AFTER meta_title,
  ADD COLUMN og_image VARCHAR(512) DEFAULT NULL AFTER meta_description,
  ADD COLUMN og_image_alt VARCHAR(255) DEFAULT NULL AFTER og_image;

