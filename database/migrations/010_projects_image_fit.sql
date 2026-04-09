-- Add per-project image fit (cover vs contain) (MySQL 8+)
ALTER TABLE projects
  ADD COLUMN image_fit VARCHAR(16) NOT NULL DEFAULT 'contain';

