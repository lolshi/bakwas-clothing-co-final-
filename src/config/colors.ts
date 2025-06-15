// Color configuration for the entire application

// Define color families - groups of similar shades
export type ColorFamily = {
  name: string;
  baseColor: string;
  shades: ColorShade[];
};

// Define individual color shades
export type ColorShade = {
  name: string;
  displayName: string;
  hex: string;
  value: string;
};

// Main color configuration
export const COLOR_FAMILIES: ColorFamily[] = [
  {
    name: 'Black',
    baseColor: 'black',
    shades: [
      { name: 'black', displayName: 'Black', hex: '#000000', value: 'black' },
      { name: 'charcoal', displayName: 'Charcoal', hex: '#36454F', value: 'charcoal' },
    ]
  },
  {
    name: 'White',
    baseColor: 'white',
    shades: [
      { name: 'white', displayName: 'White', hex: '#FFFFFF', value: 'white' },
      { name: 'off-white', displayName: 'Off White', hex: '#FAF9F6', value: 'off-white' },
    ]
  },
  {
    name: 'Blue',
    baseColor: 'blue',
    shades: [
      { name: 'navy-blue', displayName: 'Navy Blue', hex: '#000080', value: 'navy-blue' },
      { name: 'royal-blue', displayName: 'Royal Blue', hex: '#4169E1', value: 'royal-blue' },
      { name: 'sky-blue', displayName: 'Sky Blue', hex: '#87CEEB', value: 'sky-blue' },
      { name: 'light-blue', displayName: 'Light Blue', hex: '#ADD8E6', value: 'light-blue' },
      { name: 'steel-blue', displayName: 'Steel Blue', hex: '#4682B4', value: 'steel-blue' },
    ]
  },
  {
    name: 'Red',
    baseColor: 'red',
    shades: [
      { name: 'red', displayName: 'Red', hex: '#FF0000', value: 'red' },
      { name: 'maroon', displayName: 'Maroon', hex: '#800000', value: 'maroon' },
      { name: 'burgundy', displayName: 'Burgundy', hex: '#800020', value: 'burgundy' },
      { name: 'crimson', displayName: 'Crimson', hex: '#DC143C', value: 'crimson' },
      { name: 'wine-red', displayName: 'Wine Red', hex: '#722F37', value: 'wine-red' },
    ]
  },
  {
    name: 'Green',
    baseColor: 'green',
    shades: [
      { name: 'olive-green', displayName: 'Olive Green', hex: '#556B2F', value: 'olive-green' },
      { name: 'bottle-green', displayName: 'Bottle Green', hex: '#006A4E', value: 'bottle-green' },
      { name: 'mint-green', displayName: 'Mint Green', hex: '#98FF98', value: 'mint-green' },
      { name: 'forest-green', displayName: 'Forest Green', hex: '#228B22', value: 'forest-green' },
      { name: 'sage-green', displayName: 'Sage Green', hex: '#9DC183', value: 'sage-green' },
    ]
  },
  {
    name: 'Yellow',
    baseColor: 'yellow',
    shades: [
      { name: 'mustard-yellow', displayName: 'Mustard Yellow', hex: '#FFDB58', value: 'mustard-yellow' },
      { name: 'golden-yellow', displayName: 'Golden Yellow', hex: '#FFD700', value: 'golden-yellow' },
      { name: 'lemon-yellow', displayName: 'Lemon Yellow', hex: '#FFF44F', value: 'lemon-yellow' },
    ]
  },
  {
    name: 'Orange',
    baseColor: 'orange',
    shades: [
      { name: 'orange', displayName: 'Orange', hex: '#FFA500', value: 'orange' },
      { name: 'peach', displayName: 'Peach', hex: '#FFDAB9', value: 'peach' },
      { name: 'coral', displayName: 'Coral', hex: '#FF7F50', value: 'coral' },
      { name: 'rust', displayName: 'Rust', hex: '#B7410E', value: 'rust' },
    ]
  },
  {
    name: 'Purple',
    baseColor: 'purple',
    shades: [
      { name: 'lavender', displayName: 'Lavender', hex: '#E6E6FA', value: 'lavender' },
      { name: 'violet', displayName: 'Violet', hex: '#8F00FF', value: 'violet' },
      { name: 'plum', displayName: 'Plum', hex: '#8B4513', value: 'plum' },
      { name: 'mauve', displayName: 'Mauve', hex: '#E0B0FF', value: 'mauve' },
    ]
  },
  {
    name: 'Pink',
    baseColor: 'pink',
    shades: [
      { name: 'pink', displayName: 'Pink', hex: '#FFC0CB', value: 'pink' },
      { name: 'rose-pink', displayName: 'Rose Pink', hex: '#FF66CC', value: 'rose-pink' },
      { name: 'salmon-pink', displayName: 'Salmon Pink', hex: '#FF91A4', value: 'salmon-pink' },
      { name: 'baby-pink', displayName: 'Baby Pink', hex: '#FFB6C1', value: 'baby-pink' },
    ]
  },
  {
    name: 'Brown',
    baseColor: 'brown',
    shades: [
      { name: 'brown', displayName: 'Brown', hex: '#A52A2A', value: 'brown' },
      { name: 'chocolate', displayName: 'Chocolate', hex: '#D2691E', value: 'chocolate' },
      { name: 'coffee', displayName: 'Coffee', hex: '#6F4E37', value: 'coffee' },
      { name: 'tan', displayName: 'Tan', hex: '#D2B48C', value: 'tan' },
    ]
  },
  {
    name: 'Beige & Cream',
    baseColor: 'beige',
    shades: [
      { name: 'beige', displayName: 'Beige', hex: '#F5F5DC', value: 'beige' },
      { name: 'cream', displayName: 'Cream', hex: '#FFFDD0', value: 'cream' },
      { name: 'ivory', displayName: 'Ivory', hex: '#FFFFF0', value: 'ivory' },
      { name: 'khaki', displayName: 'Khaki', hex: '#C3B091', value: 'khaki' },
    ]
  },
  {
    name: 'Grey',
    baseColor: 'grey',
    shades: [
      { name: 'grey', displayName: 'Grey', hex: '#808080', value: 'grey' },
      { name: 'silver', displayName: 'Silver', hex: '#C0C0C0', value: 'silver' },
      { name: 'slate-grey', displayName: 'Slate Grey', hex: '#708090', value: 'slate-grey' },
      { name: 'ash-grey', displayName: 'Ash Grey', hex: '#B2BEB5', value: 'ash-grey' },
    ]
  },
  {
    name: 'Special',
    baseColor: 'special',
    shades: [
      { name: 'turquoise', displayName: 'Turquoise', hex: '#40E0D0', value: 'turquoise' },
      { name: 'teal', displayName: 'Teal', hex: '#008080', value: 'teal' },
      { name: 'aqua', displayName: 'Aqua', hex: '#00FFFF', value: 'aqua' },
    ]
  },
  {
    name: 'Neon',
    baseColor: 'neon',
    shades: [
      { name: 'neon-green', displayName: 'Neon Green', hex: '#39FF14', value: 'neon-green' },
      { name: 'neon-pink', displayName: 'Neon Pink', hex: '#FF6EC7', value: 'neon-pink' },
      { name: 'neon-yellow', displayName: 'Neon Yellow', hex: '#FFFF00', value: 'neon-yellow' },
      { name: 'neon-orange', displayName: 'Neon Orange', hex: '#FF9933', value: 'neon-orange' },
      { name: 'neon-purple', displayName: 'Neon Purple', hex: '#9D00FF', value: 'neon-purple' },
      { name: 'neon-cyan', displayName: 'Neon Cyan', hex: '#00FFFF', value: 'neon-cyan' },
    ]
  }
];

// Helper function to get the standardized color value from a hex code
export function getColorValueFromHex(hex: string): string {
  const normalizedHex = hex.toUpperCase();
  for (const family of COLOR_FAMILIES) {
    for (const shade of family.shades) {
      if (shade.hex.toUpperCase() === normalizedHex) {
        return shade.value;
      }
    }
  }
  // If no exact match, find the closest color family
  return findClosestColorValue(hex);
}

// Helper function to find the closest color family for a hex code
function findClosestColorValue(hex: string): string {
  // For now, return a default value
  // TODO: Implement color distance calculation for better matching
  return 'other';
}

// Get all available color values
export function getAllColorValues(): string[] {
  return COLOR_FAMILIES.flatMap(family => 
    family.shades.map(shade => shade.value)
  );
}

// Get display name for a color value
export function getColorDisplayName(value: string): string {
  for (const family of COLOR_FAMILIES) {
    const shade = family.shades.find(s => s.value === value);
    if (shade) {
      return shade.displayName;
    }
  }
  return value;
}

// Get hex code for a color value
export function getHexFromColorValue(value: string): string {
  for (const family of COLOR_FAMILIES) {
    const shade = family.shades.find(s => s.value === value);
    if (shade) {
      return shade.hex;
    }
  }
  return value;
}

// Get all colors in a specific family
export function getColorsByFamily(familyName: string): ColorShade[] {
  const family = COLOR_FAMILIES.find(f => f.name === familyName);
  return family ? family.shades : [];
}

// Color name to hex code mapping
export const COLOR_MAPPING: { [key: string]: string } = {
  // Basic Colors
  'black': '#000000',
  'white': '#FFFFFF',
  'red': '#FF0000',
  'green': '#008000',
  'blue': '#0000FF',
  'yellow': '#FFFF00',
  'purple': '#800080',
  'orange': '#FFA500',
  'pink': '#FFC0CB',
  'gray': '#808080',
  'grey': '#808080',
  'brown': '#A52A2A',

  // Shades of Brown
  'dark brown': '#5C4033',
  'light brown': '#B5651D',
  'chocolate brown': '#7B3F00',
  'coffee brown': '#4A2C2A',
  'tan brown': '#D2B48C',

  // Shades of Blue
  'navy blue': '#000080',
  'royal blue': '#4169E1',
  'sky blue': '#87CEEB',
  'light blue': '#ADD8E6',
  'dark blue': '#00008B',
  'electric blue': '#00FFFF',

  // Shades of Red
  'dark red': '#8B0000',
  'light red': '#FF6B6B',
  'burgundy': '#800020',
  'maroon': '#800000',
  'crimson': '#DC143C',

  // Shades of Green
  'dark green': '#006400',
  'light green': '#90EE90',
  'forest green': '#228B22',
  'olive green': '#808000',
  'mint green': '#98FF98',

  // Shades of Gray
  'dark gray': '#404040',
  'dark grey': '#404040',
  'light gray': '#D3D3D3',
  'light grey': '#D3D3D3',
  'charcoal': '#36454F',
  'silver': '#C0C0C0',

  // Neon Colors
  'neon pink': '#FF6EC7',
  'neon yellow': '#FFFF00',
  'neon orange': '#FF9933',
  'neon purple': '#9D00FF',
  'neon cyan': '#00FFFF',
  'neon green': '#39FF14',

  // Additional Fashion Colors
  'beige': '#F5F5DC',
  'khaki': '#C3B091',
  'coral': '#FF7F50',
  'turquoise': '#40E0D0',
  'lavender': '#E6E6FA',
  'teal': '#008080',
  'magenta': '#FF00FF',
  'gold': '#FFD700',
  'rose gold': '#B76E79',
  'champagne': '#F7E7CE',
  'ivory': '#FFFFF0',
  'off white': '#FAF9F6',
  'cream': '#FFFDD0',
};

// Function to get hex code from color name
export const getColorHexCode = (colorName: string): string | null => {
  if (!colorName) return null;
  
  // If it's already a hex code, return it
  if (colorName.startsWith('#')) {
    return colorName;
  }

  // Normalize the color name (lowercase and trim)
  const normalizedName = colorName.toLowerCase().trim();

  // Direct match
  if (COLOR_MAPPING[normalizedName]) {
    return COLOR_MAPPING[normalizedName];
  }

  // Try to find the closest match
  const closestMatch = Object.keys(COLOR_MAPPING).find(key => 
    normalizedName.includes(key) || key.includes(normalizedName)
  );

  return closestMatch ? COLOR_MAPPING[closestMatch] : null;
};

// Function to get standardized color name from hex code
export const getColorNameFromHex = (hexCode: string): string | null => {
  if (!hexCode) return null;

  // Normalize hex code
  const normalizedHex = hexCode.toUpperCase();
  
  // Find exact match
  for (const [name, hex] of Object.entries(COLOR_MAPPING)) {
    if (hex.toUpperCase() === normalizedHex) {
      return name;
    }
  }

  return null;
};

// Function to validate if a string is a valid hex color code
export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Utility to convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// Utility to calculate Euclidean distance between two RGB colors
function colorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  return Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
    Math.pow(rgb1[1] - rgb2[1], 2) +
    Math.pow(rgb1[2] - rgb2[2], 2)
  );
}

// Find the nearest base color family and named shade for a given hex code
export function getNearestColorFamilyAndShade(hex: string): { baseFamily: string, shadeName: string, displayName: string, hex: string } {
  const rgb = hexToRgb(hex);
  let minDist = Infinity;
  let nearest = {
    baseFamily: '',
    shadeName: '',
    displayName: '',
    hex: ''
  };
  for (const family of COLOR_FAMILIES) {
    for (const shade of family.shades) {
      const shadeRgb = hexToRgb(shade.hex);
      const dist = colorDistance(rgb, shadeRgb);
      if (dist < minDist) {
        minDist = dist;
        nearest = {
          baseFamily: family.name,
          shadeName: shade.name,
          displayName: shade.displayName,
          hex: shade.hex
        };
      }
    }
  }
  return nearest;
} 