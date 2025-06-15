-- ====================================================================
-- SUPABASE PERFORMANCE FIX: RLS POLICY OPTIMIZATION
-- ====================================================================
-- This script fixes performance warnings by:
-- 1. Optimizing auth function calls in RLS policies
-- 2. Consolidating multiple permissive policies
-- 3. Improving query performance at scale
-- ====================================================================

BEGIN;

-- ====================================================================
-- 1. PROFILES TABLE - Fix Auth RLS Issues
-- ====================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create optimized policies with (select auth.uid())
CREATE POLICY "Users can manage their own profile" ON public.profiles
  FOR ALL 
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- ====================================================================
-- 2. RETURNS TABLE - Fix Auth RLS Issues & Multiple Policies
-- ====================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their returns" ON public.returns;
DROP POLICY IF EXISTS "Users can create returns" ON public.returns;
DROP POLICY IF EXISTS "Admins can manage returns" ON public.returns;

-- Create consolidated optimized policies
CREATE POLICY "Users can manage their own returns" ON public.returns
  FOR ALL
  USING (
    customer_email = (select auth.jwt() ->> 'email')
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    customer_email = (select auth.jwt() ->> 'email')
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  );

-- ====================================================================
-- 3. BLOG_POSTS TABLE - Consolidate Multiple Policies
-- ====================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public can read active blog posts" ON public.blog_posts;

-- Create single consolidated policy
CREATE POLICY "Blog posts access policy" ON public.blog_posts
  FOR SELECT
  USING (
    is_active = true 
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  );

-- Admin management policy
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  );

-- ====================================================================
-- 4. CATEGORIES TABLE - Consolidate Multiple Policies
-- ====================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin full access to categories" ON public.categories;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;

-- Create single consolidated policy
CREATE POLICY "Categories access policy" ON public.categories
  FOR SELECT
  USING (true); -- Public read access

-- Admin management policy
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  );

-- ====================================================================
-- 5. FAQS TABLE - Consolidate Multiple Policies
-- ====================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage FAQs" ON public.faqs;
DROP POLICY IF EXISTS "Public can read active FAQs" ON public.faqs;

-- Create single consolidated policy
CREATE POLICY "FAQs access policy" ON public.faqs
  FOR SELECT
  USING (
    is_active = true 
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  );

-- Admin management policy
CREATE POLICY "Admins can manage FAQs" ON public.faqs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  );

-- ====================================================================
-- 6. FEATURED_PRODUCTS TABLE - Consolidate Multiple Policies
-- ====================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin full access to featured_products" ON public.featured_products;
DROP POLICY IF EXISTS "Public read featured products" ON public.featured_products;

-- Create single consolidated policy
CREATE POLICY "Featured products access policy" ON public.featured_products
  FOR SELECT
  USING (true); -- Public read access

-- Admin management policy
CREATE POLICY "Admins can manage featured products" ON public.featured_products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  );

-- ====================================================================
-- 7. HOMEPAGE_BANNERS TABLE - Consolidate Multiple Policies
-- ====================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin full access to homepage_banners" ON public.homepage_banners;
DROP POLICY IF EXISTS "Public read active banners" ON public.homepage_banners;

-- Create single consolidated policy
CREATE POLICY "Homepage banners access policy" ON public.homepage_banners
  FOR SELECT
  USING (
    is_active = true 
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  );

-- Admin management policy
CREATE POLICY "Admins can manage homepage banners" ON public.homepage_banners
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  );

-- ====================================================================
-- 8. PRODUCTS TABLE - Consolidate Multiple Policies
-- ====================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin full access to products" ON public.products;
DROP POLICY IF EXISTS "Public read active products" ON public.products;

-- Create single consolidated policy
CREATE POLICY "Products access policy" ON public.products
  FOR SELECT
  USING (
    is_active = true 
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  );

-- Admin management policy
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  );

-- ====================================================================
-- 9. PROMO_CODES TABLE - Consolidate Multiple Policies
-- ====================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Public can read active promo codes" ON public.promo_codes;

-- Create single consolidated policy
CREATE POLICY "Promo codes access policy" ON public.promo_codes
  FOR SELECT
  USING (
    is_active = true 
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  );

-- Admin management policy
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  );

-- ====================================================================
-- 10. SITE_PAGES TABLE - Consolidate Multiple Policies
-- ====================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage site pages" ON public.site_pages;
DROP POLICY IF EXISTS "Public can read site pages" ON public.site_pages;

-- Create single consolidated policy
CREATE POLICY "Site pages access policy" ON public.site_pages
  FOR SELECT
  USING (true); -- Public read access

-- Admin management policy
CREATE POLICY "Admins can manage site pages" ON public.site_pages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (select auth.jwt() ->> 'email')
    )
  );

-- ====================================================================
-- 11. CREATE INDEXES FOR BETTER PERFORMANCE
-- ====================================================================

-- Index for admin_users email lookups (used in many policies)
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Indexes for commonly filtered columns
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_active ON blog_posts(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_is_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_banners_is_active ON homepage_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_is_active ON promo_codes(is_active);

-- Index for returns customer_email lookup
CREATE INDEX IF NOT EXISTS idx_returns_customer_email ON returns(customer_email);

COMMIT;

-- ====================================================================
-- VERIFICATION QUERIES
-- ====================================================================

-- Check that policies were created successfully
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname; 