-- Add hero wallpaper layout settings keys (safe to re-run)
INSERT INTO settings (`key`, `value`) VALUES
('hero_wallpaper_fit', 'cover'),
('hero_wallpaper_position', 'center')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

