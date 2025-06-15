-- ====================================================================
-- CLEANUP DUPLICATE PRODUCTS - BAKWAS E-commerce
-- ====================================================================
-- This script helps identify and remove duplicate products
-- Use this if you're getting slug conflict errors
-- ====================================================================

-- 1. FIND DUPLICATE PRODUCTS BY NAME
SELECT 
  name,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as product_ids,
  STRING_AGG(slug, ', ') as slugs
FROM products
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 2. FIND PRODUCTS WITH SIMILAR SLUGS (HELP IDENTIFY BASE DUPLICATES)
SELECT 
  slug,
  name,
  id,
  created_at,
  is_active
FROM products
WHERE slug LIKE '%-[0-9]%'
ORDER BY slug, created_at;

-- 3. DELETE SPECIFIC DUPLICATE PRODUCTS (EXAMPLE - MODIFY AS NEEDED)
-- ⚠️ UNCOMMENT AND MODIFY THE LINES BELOW TO DELETE SPECIFIC PRODUCTS
-- ⚠️ BE VERY CAREFUL - THIS WILL PERMANENTLY DELETE PRODUCTS

-- Delete products by specific ID (replace with actual IDs from query above)
-- DELETE FROM products WHERE id IN ('id1', 'id2', 'id3');

-- OR delete duplicates keeping only the latest one for each name
-- WITH ranked_products AS (
--   SELECT id, name, 
--          ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(name)) ORDER BY created_at DESC) as rn
--   FROM products
-- )
-- DELETE FROM products 
-- WHERE id IN (
--   SELECT id FROM ranked_products WHERE rn > 1
-- );

-- 4. VERIFY CLEANUP
SELECT 
  COUNT(*) as total_products,
  COUNT(DISTINCT LOWER(TRIM(name))) as unique_names,
  COUNT(*) - COUNT(DISTINCT LOWER(TRIM(name))) as potential_duplicates
FROM products;

-- 5. SHOW ALL PRODUCTS AFTER CLEANUP
SELECT 
  id,
  name,
  slug,
  is_active,
  is_featured,
  created_at
FROM products
ORDER BY created_at DESC;

-- ====================================================================
-- HOW TO USE THIS SCRIPT:
-- ====================================================================
-- 1. Run queries 1-2 to see if you have duplicates
-- 2. If duplicates exist, uncomment and modify query 3 to delete them
-- 3. Run queries 4-5 to verify the cleanup worked
-- ==================================================================== 