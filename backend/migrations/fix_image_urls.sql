-- Fix image URLs: Change .jpg to .png
-- The database has .jpg extensions but the actual image files are .png

UPDATE products
SET image_urls = ARRAY[REPLACE(image_urls[1], '.jpg', '.png')]
WHERE image_urls[1] LIKE '%.jpg';

-- Verify the update
SELECT id, name, image_urls FROM products LIMIT 5;
