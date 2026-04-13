-- Optional card image for each service (home + /services grid).
ALTER TABLE services
  ADD COLUMN image_url VARCHAR(512) DEFAULT NULL AFTER icon;
