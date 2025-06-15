
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: {
        [key: string]: unknown;
        currency?: string;
        value?: number;
        items?: Array<{
          item_id: string;
          item_name: string;
          quantity: number;
          price: number;
          category?: string;
        }>;
      }
    ) => void;
  }
}

export {};
