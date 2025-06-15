import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getNearestColorFamilyAndShade } from '@/config/colors';

export interface AvailableColor {
  hex: string;
  displayName: string;
}

export function useAvailableColorsFromVariants() {
  const [colors, setColors] = useState<AvailableColor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchColors() {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_variants')
        .select('color');
      if (error) {
        setColors([]);
        setLoading(false);
        return;
      }
      const uniqueHexes = Array.from(
        new Set(
          (data || [])
            .map((v: any) => v.color)
            .filter((c: string) => !!c && c.startsWith('#'))
        )
      );
      setColors(
        uniqueHexes.map(hex => {
          const nearest = getNearestColorFamilyAndShade(hex);
          return { hex, displayName: nearest.displayName };
        })
      );
      setLoading(false);
    }
    fetchColors();
  }, []);

  return { colors, loading };
} 