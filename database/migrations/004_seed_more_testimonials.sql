-- Seed extra testimonials so desktop can show 4+ cards.
-- Safe to re-run: each insert is guarded by NOT EXISTS.

INSERT INTO testimonials (name, role, video_url, rating, quote, sort_order, published)
SELECT 'Priya Nair', 'Founder, BrightWave', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5,
       'Fast delivery, great communication, and the site feels premium.', 3, 1
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials WHERE name='Priya Nair' AND role='Founder, BrightWave' AND video_url='https://www.youtube.com/embed/dQw4w9WgXcQ'
);

INSERT INTO testimonials (name, role, video_url, rating, quote, sort_order, published)
SELECT 'Marcus Chen', 'Product Manager, Vertex Labs', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5,
       'They improved our performance metrics immediately.', 4, 1
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials WHERE name='Marcus Chen' AND role='Product Manager, Vertex Labs' AND video_url='https://www.youtube.com/embed/dQw4w9WgXcQ'
);

INSERT INTO testimonials (name, role, video_url, rating, quote, sort_order, published)
SELECT 'Aisha Khan', 'Operations Lead, Northwind', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5,
       'Every milestone was clear and on schedule.', 5, 1
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials WHERE name='Aisha Khan' AND role='Operations Lead, Northwind' AND video_url='https://www.youtube.com/embed/dQw4w9WgXcQ'
);

INSERT INTO testimonials (name, role, video_url, rating, quote, sort_order, published)
SELECT 'Diego Silva', 'Growth, Kite Systems', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5,
       'Our leads improved after the launch and SEO cleanup.', 6, 1
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials WHERE name='Diego Silva' AND role='Growth, Kite Systems' AND video_url='https://www.youtube.com/embed/dQw4w9WgXcQ'
);

INSERT INTO testimonials (name, role, video_url, rating, quote, sort_order, published)
SELECT 'Elena Petrova', 'CMO, BluePeak', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5,
       'Beautiful design system and consistent execution.', 7, 1
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials WHERE name='Elena Petrova' AND role='CMO, BluePeak' AND video_url='https://www.youtube.com/embed/dQw4w9WgXcQ'
);

INSERT INTO testimonials (name, role, video_url, rating, quote, sort_order, published)
SELECT 'Samir Patel', 'CTO, Aurora Health', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5,
       'Solid engineering and thoughtful accessibility improvements.', 8, 1
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials WHERE name='Samir Patel' AND role='CTO, Aurora Health' AND video_url='https://www.youtube.com/embed/dQw4w9WgXcQ'
);

INSERT INTO testimonials (name, role, video_url, rating, quote, sort_order, published)
SELECT 'Nora Johnson', 'Founder, Studio Nine', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5,
       'A partner we can rely on for new launches.', 9, 1
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials WHERE name='Nora Johnson' AND role='Founder, Studio Nine' AND video_url='https://www.youtube.com/embed/dQw4w9WgXcQ'
);

INSERT INTO testimonials (name, role, video_url, rating, quote, sort_order, published)
SELECT 'Rahul Verma', 'Marketing, Pulse Analytics', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5,
       'Clean UI/UX and the admin tools make updates easy.', 10, 1
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials WHERE name='Rahul Verma' AND role='Marketing, Pulse Analytics' AND video_url='https://www.youtube.com/embed/dQw4w9WgXcQ'
);

