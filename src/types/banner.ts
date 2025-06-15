export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  mobile_image_url: string | null;
  video_url: string | null;
  mobile_video_url: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  media_type: 'image' | 'video';
  show_title: boolean;
  show_subtitle: boolean;
  device_targeting: 'all' | 'desktop' | 'mobile' | 'tablet';
  created_at: string | null;
  start_date: string | null;
  end_date: string | null;
} 