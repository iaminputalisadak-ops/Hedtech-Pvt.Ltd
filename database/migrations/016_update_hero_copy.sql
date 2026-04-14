-- Update hero copy defaults (safe to run multiple times).
-- Use this on an existing database if you want the new homepage hero text immediately.

UPDATE settings
SET value = 'High‑performing digital experiences that convert'
WHERE `key` = 'hero_headline';

UPDATE settings
SET value = 'Modern web, UI/UX, and SEO that drive real results—not vanity metrics.'
WHERE `key` = 'hero_tagline';

UPDATE settings
SET value = 'Digital studio · Performance · SEO'
WHERE `key` = 'hero_eyebrow';

