-- Seed a few demo team members (safe to re-run)
INSERT INTO team_members (name, role, bio, photo_url, linkedin_url, sort_order, published)
SELECT * FROM (
  SELECT
    'Karthik Sharma' AS name,
    'Founder & Delivery Lead' AS role,
    'Owns strategy, delivery, and client success. Focused on performance-first builds, clear communication, and measurable outcomes.' AS bio,
    'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=640&q=80&auto=format&fit=crop' AS photo_url,
    'https://linkedin.com' AS linkedin_url,
    1 AS sort_order,
    1 AS published
  UNION ALL
  SELECT
    'Aarav Singh',
    'Full‑Stack Engineer',
    'Builds resilient APIs, modern React frontends, and integrations. Passionate about clean architecture and fast load times.',
    'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=640&q=80&auto=format&fit=crop',
    'https://linkedin.com',
    2,
    1
  UNION ALL
  SELECT
    'Saanvi Joshi',
    'UI/UX Designer',
    'Designs conversion-friendly interfaces with strong visual systems. Focus on accessibility, motion, and brand consistency.',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=640&q=80&auto=format&fit=crop',
    'https://linkedin.com',
    3,
    1
  UNION ALL
  SELECT
    'Rohan Patel',
    'SEO & Growth',
    'Handles technical SEO, structured data, analytics, and content strategy. Aligns pages with search intent and Core Web Vitals.',
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=640&q=80&auto=format&fit=crop',
    'https://linkedin.com',
    4,
    1
) AS v
WHERE NOT EXISTS (
  SELECT 1 FROM team_members t
  WHERE t.name = v.name AND t.role = v.role
);

