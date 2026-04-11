-- Display order for projects (admin drag-and-drop + public listing)
ALTER TABLE projects
  ADD COLUMN sort_order INT NOT NULL DEFAULT 0 AFTER featured;

UPDATE projects p
JOIN (
  SELECT id, ROW_NUMBER() OVER (ORDER BY featured DESC, created_at DESC) - 1 AS rn
  FROM projects
) t ON p.id = t.id
SET p.sort_order = t.rn;
