-- Create blog_posts table with enhanced fields
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

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create blog_tags table
CREATE TABLE IF NOT EXISTS blog_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;

-- Public read access for published posts
CREATE POLICY "Public can view published posts" ON blog_posts
    FOR SELECT
    USING (is_active = true AND status = 'published');

-- Admin full access to all blog tables
CREATE POLICY "Admins have full access to posts" ON blog_posts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Admins have full access to comments" ON blog_comments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Admins have full access to categories" ON blog_categories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Admins have full access to tags" ON blog_tags
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.email = auth.jwt() ->> 'email'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts(status);
CREATE INDEX IF NOT EXISTS blog_posts_publish_date_idx ON blog_posts(publish_date);
CREATE INDEX IF NOT EXISTS blog_posts_created_at_idx ON blog_posts(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at
    BEFORE UPDATE ON blog_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO blog_categories (name, slug, description) VALUES
    ('Development', 'development', 'Technical articles and tutorials'),
    ('News', 'news', 'Latest updates and announcements'),
    ('Case Studies', 'case-studies', 'Real-world implementation examples');

INSERT INTO blog_tags (name, slug) VALUES
    ('React', 'react'),
    ('TypeScript', 'typescript'),
    ('Next.js', 'nextjs'),
    ('Web Development', 'web-development');

-- Insert sample blog posts
INSERT INTO blog_posts (
    title,
    slug,
    content,
    excerpt,
    author_name,
    categories,
    tags,
    is_active,
    status,
    post_type,
    publish_date
) VALUES (
    'Getting Started with Next.js',
    'getting-started-with-nextjs',
    'Next.js is a powerful React framework that makes building full-stack web applications simple and efficient...',
    'Learn the basics of Next.js and get started with your first project.',
    'John Doe',
    ARRAY['Development'],
    ARRAY['Next.js', 'React'],
    true,
    'published',
    'tutorial',
    now()
); 