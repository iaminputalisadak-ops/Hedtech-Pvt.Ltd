-- Add "Our Work" board fields (service type, status, client, tags, progress)
-- Safe to run on existing DBs (MySQL 8+ recommended).
ALTER TABLE projects
  ADD COLUMN service_type VARCHAR(16) NOT NULL DEFAULT 'web' AFTER category,
  ADD COLUMN status VARCHAR(16) NOT NULL DEFAULT 'completed' AFTER service_type,
  ADD COLUMN client_name VARCHAR(255) DEFAULT '' AFTER status,
  ADD COLUMN tags VARCHAR(512) DEFAULT '' AFTER client_name,
  ADD COLUMN progress TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER tags;

-- Seed new fields from existing columns when possible.
UPDATE projects
SET
  service_type = CASE
    WHEN category IN ('web','seo','marketing','design') THEN category
    ELSE 'web'
  END,
  status = 'completed',
  progress = 0
WHERE (service_type IS NULL OR service_type = '' OR status IS NULL OR status = '' OR progress IS NULL);

