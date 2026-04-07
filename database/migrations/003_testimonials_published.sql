-- Add visibility + carousel setting for client reviews.
-- If `published` already exists, skip the ALTER (or run only the INSERT below).

ALTER TABLE testimonials
  ADD COLUMN published TINYINT(1) NOT NULL DEFAULT 1 AFTER sort_order;

INSERT INTO settings (`key`, `value`) VALUES ('reviews_autoscroll', '1')
  ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);
