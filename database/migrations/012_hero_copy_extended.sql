-- Optional hero copy (eyebrow, CTAs, stat line). Safe on existing DBs.
INSERT IGNORE INTO settings (`key`, `value`) VALUES
('hero_eyebrow', 'Digital studio · Performance · SEO'),
('hero_cta_primary_label', 'Start a project'),
('hero_cta_primary_href', '/contact'),
('hero_cta_secondary_label', 'View selected work'),
('hero_cta_secondary_href', '/work'),
('hero_stat_label', 'Shipped milestones'),
('hero_stat_aside', 'Core Web Vitals–minded builds, accessible UI, and SEO that earns the click.');
