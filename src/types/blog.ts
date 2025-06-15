export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  author_name: string;
  categories: string[];
  tags: string[];
  is_active: boolean;
  publish_date: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived';
  post_type: 'article' | 'news' | 'case_study' | 'tutorial' | 'opinion';
  view_count: number;
  reading_time: number;
  seo_title?: string;
  seo_description?: string;
}

// This type matches the actual Supabase database schema
export interface SupabaseBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  author_name: string | null;
  categories: string[] | null;
  tags: string[] | null;
  is_active: boolean | null;
  publish_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  status: ('draft' | 'review' | 'scheduled' | 'published' | 'archived') | null;
  post_type: ('article' | 'news' | 'case_study' | 'tutorial' | 'opinion') | null;
  view_count: number | null;
  reading_time: number | null;
  seo_title: string | null;
  seo_description: string | null;
}

export interface BlogStats {
  totalPosts: number;
  totalViews: number;
  totalAuthors: number;
  avgReadTime: number;
} 