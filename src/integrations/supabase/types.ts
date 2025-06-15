export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_name: string | null
          categories: string[] | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          is_active: boolean | null
          publish_date: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
          seo_description: string | null
          seo_title: string | null
        }
        Insert: {
          author_name?: string | null
          categories?: string[] | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_active?: boolean | null
          publish_date?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
        }
        Update: {
          author_name?: string | null
          categories?: string[] | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_active?: boolean | null
          publish_date?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
        }
        Relationships: []
      }
      // ... rest of the tables
    }
  }
}
