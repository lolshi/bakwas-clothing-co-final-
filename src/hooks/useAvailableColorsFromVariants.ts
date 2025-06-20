import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getNearestColorFamilyAndShade, getColorHexCode } from '@/config/colors';

export interface AvailableColor {
  hex: string;
  displayName: string;
}

export function useAvailableColorsFromVariants(filters?: {
  categories?: string[];
  sizes?: string[];
  priceRange?: [number, number];
}) {
  const [colors, setColors] = useState<AvailableColor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchColors() {
      setLoading(true);

      // 1. Fetch all variants and their parent product price
      let { data: variants, error } = await supabase
        .from('product_variants')
        .select('color, price, size, product_id');

      if (error) {
        setColors([]);
        setLoading(false);
        return;
      }

      // 2. Fetch all products (for price fallback)
      let { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, price');

      if (prodError) {
        setColors([]);
        setLoading(false);
        return;
      }

      // 3. Build a map of product_id -> price
      const productPriceMap: Record<string, number> = {};
      (products || []).forEach((p: any) => {
        productPriceMap[p.id] = p.price;
      });

      // 4. Filter by size and price
      let filteredVariants = (variants || []);
      if (filters?.sizes?.length) {
        filteredVariants = filteredVariants.filter((v: any) =>
          filters.sizes?.includes(v.size)
        );
      }
      const priceRange = filters?.priceRange ?? [0, Infinity];
      if (filters?.priceRange) {
        filteredVariants = filteredVariants.filter((v: any) => {
          const price = v.price ?? productPriceMap[v.product_id];
          return (
            typeof price === 'number' &&
            price >= priceRange[0] &&
            price <= priceRange[1]
          );
        });
      }

      // 5. Get unique colors
      const uniqueColors = Array.from(
        new Set(
          filteredVariants
            .map((v: any) => v.color)
            .filter((c: string) => !!c)
        )
      );

      setColors(
        uniqueColors.map(colorValue => {
          const hex = colorValue.startsWith('#') ? colorValue : getColorHexCode(colorValue) || colorValue;
          const nearest = getNearestColorFamilyAndShade(hex);
          return { hex, displayName: nearest.displayName };
        })
      );
      setLoading(false);
    }
    fetchColors();
  }, [JSON.stringify(filters)]);

  return { colors, loading };
} 