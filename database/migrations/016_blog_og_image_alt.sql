-- Alt text for featured / Open Graph image (SEO & accessibility).
ALTER TABLE blog_posts
  ADD COLUMN og_image_alt VARCHAR(255) DEFAULT NULL AFTER og_image;
