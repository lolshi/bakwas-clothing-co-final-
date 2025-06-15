import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const executeMigration = async () => {
  try {
    // Check if table exists
    const { error: tableError } = await supabase.from('blog_posts').select('id').limit(1);
    
    if (tableError?.code === 'PGRST204') {
      // Table doesn't exist, create it using raw SQL via Supabase dashboard
      toast.error('Blog posts table does not exist. Please run the following SQL in your Supabase dashboard:');
      console.info(`
        CREATE TABLE IF NOT EXISTS blog_posts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            content TEXT NOT NULL,
            excerpt TEXT,
            featured_image TEXT,
            author_name TEXT,
            categories TEXT[] DEFAULT '{}',
            tags TEXT[] DEFAULT '{}',
            is_active BOOLEAN DEFAULT false,
            publish_date TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now(),
            status TEXT CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived')) DEFAULT 'draft',
            post_type TEXT CHECK (post_type IN ('article', 'news', 'case_study', 'tutorial', 'opinion')) DEFAULT 'article',
            view_count INTEGER DEFAULT 0,
            reading_time INTEGER DEFAULT 0,
            seo_title TEXT,
            seo_description TEXT
        );

        -- Add indexes for better performance
        CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug);
        CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts(status);
        CREATE INDEX IF NOT EXISTS blog_posts_publish_date_idx ON blog_posts(publish_date);
        CREATE INDEX IF NOT EXISTS blog_posts_created_at_idx ON blog_posts(created_at);

        -- Enable RLS
        ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

        -- Public read access for published posts
        CREATE POLICY "Public can view published posts" ON blog_posts
            FOR SELECT
            USING (is_active = true AND status = 'published');

        -- Admin full access
        CREATE POLICY "Admins have full access to posts" ON blog_posts
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM admin_users
                    WHERE admin_users.email = auth.jwt() ->> 'email'
                )
            );
      `);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Migration error:', error);
    toast.error('Failed to check blog system tables: ' + error.message);
    return false;
  }
};

export const updateBlogTable = async () => {
  try {
    // Check if status column exists
    const { error: checkError } = await supabase
      .from('blog_posts')
      .select('status')
      .limit(1);

    if (checkError?.message.includes('column "status" does not exist')) {
      // Need to add the columns - provide SQL to run in dashboard
      toast.error('Missing columns detected. Please run the following SQL in your Supabase dashboard:');
      console.info(`
        -- Add status column
        ALTER TABLE blog_posts 
        ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived')) DEFAULT 'draft';

        -- Add post_type column
        ALTER TABLE blog_posts 
        ADD COLUMN IF NOT EXISTS post_type TEXT CHECK (post_type IN ('article', 'news', 'case_study', 'tutorial', 'opinion')) DEFAULT 'article';

        -- Add view_count column
        ALTER TABLE blog_posts 
        ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

        -- Add reading_time column
        ALTER TABLE blog_posts 
        ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0;

        -- Update status based on is_active
        UPDATE blog_posts 
        SET status = CASE 
          WHEN is_active = true THEN 'published'
          ELSE 'draft'
        END;
      `);
      return false;
    }

    // If we get here, the columns exist
    toast.success('Blog table structure is up to date');
    return true;
  } catch (error: any) {
    console.error('Update error:', error);
    toast.error('Failed to check blog table structure: ' + error.message);
    return false;
  }
}; 