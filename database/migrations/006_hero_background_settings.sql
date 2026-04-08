-- Add hero background settings keys (safe to re-run)
INSERT INTO settings (`key`, `value`) VALUES
('hero_bg_mode', 'animated'),
('hero_gradient_css', '')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

