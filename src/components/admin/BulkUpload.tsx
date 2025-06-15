import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X, 
  FileSpreadsheet, 
  Sparkles,
  ArrowRight,
  Eye,
  Users,
  Zap
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Badge } from '@/components/ui/badge';
import ImageUploadHelper from './ImageUploadHelper';
import { getColorHexCode, COLOR_MAPPING } from '@/config/colors';

interface BulkUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProductRow {
  name: string;
  slug: string;
  description: string;
  price: number;
  is_active: boolean;
  is_featured: boolean;
  variants: string; // JSON string
  images: string;   // JSON string
  tags: string;
  category_ids: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

// JSON Builder Component
const JSONBuilder: React.FC = () => {
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [sizes, setSizes] = useState<{ [color: string]: { size: string; stock: number }[] }>({});
  const [sizeInput, setSizeInput] = useState<{ [color: string]: { size: string; stock: number } }>({});
  const [images, setImages] = useState<{ [color: string]: string }>({});
  const [imageInput, setImageInput] = useState<{ [color: string]: string }>({});

  // Add color
  const handleAddColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]);
      setColorInput('');
    }
  };

  // Remove color
  const handleRemoveColor = (color: string) => {
    setColors(colors.filter(c => c !== color));
    const newSizes = { ...sizes };
    delete newSizes[color];
    setSizes(newSizes);
    const newImages = { ...images };
    delete newImages[color];
    setImages(newImages);
  };

  // Add size for a color
  const handleAddSize = (color: string) => {
    const entry = sizeInput[color];
    if (entry && entry.size && entry.stock >= 0) {
      setSizes({
        ...sizes,
        [color]: [...(sizes[color] || []), { size: entry.size, stock: entry.stock }],
      });
      setSizeInput({ ...sizeInput, [color]: { size: '', stock: 0 } });
    }
  };

  // Remove size for a color
  const handleRemoveSize = (color: string, idx: number) => {
    setSizes({
      ...sizes,
      [color]: (sizes[color] || []).filter((_, i) => i !== idx),
    });
  };

  // Set images for a color
  const handleSetImages = (color: string) => {
    setImages({ ...images, [color]: imageInput[color] || '' });
  };

  // Remove images for a color
  const handleRemoveImages = (color: string) => {
    setImages({ ...images, [color]: '' });
    setImageInput({ ...imageInput, [color]: '' });
  };

  // Generate JSON
  const variantsJSON = JSON.stringify(
    colors.map(color => ({
      color,
      sizes: (sizes[color] || []).map(s => ({ size: s.size, stock: s.stock })),
    })),
    null,
    2
  );
  const imagesJSON = JSON.stringify(
    Object.fromEntries(
      colors.map(color => [color, (images[color] || '').split(',').map(url => url.trim()).filter(Boolean)])
    ),
    null,
    2
  );

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="border-2 border-yellow-300 shadow-xl bg-white mb-8">
      <CardHeader className="pb-4 bg-yellow-50 border-b border-yellow-200">
        <CardTitle className="text-xl font-bold text-yellow-900 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-yellow-600" />
          JSON Builder (for Variants & Images)
        </CardTitle>
        <p className="text-yellow-800 font-medium">Quickly generate JSON for variants and images fields</p>
      </CardHeader>
      <CardContent className="p-6 bg-white">
        {/* Add Colors */}
        <div className="mb-4">
          <label className="font-semibold text-yellow-900">Colors:</label>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={colorInput}
              onChange={e => setColorInput(e.target.value)}
              placeholder="Enter color name (e.g. Neon Green)"
              className="border rounded px-2 py-1"
            />
            <Button onClick={handleAddColor} size="sm" className="bg-yellow-500 text-white">Add Color</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {colors.map(color => (
              <Badge key={color} className="bg-yellow-200 text-yellow-900 flex items-center gap-1">
                {color}
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveColor(color)} />
              </Badge>
            ))}
          </div>
        </div>
        {/* Add Sizes and Stock for Each Color */}
        {colors.map(color => (
          <div key={color} className="mb-4 border-t pt-4">
            <div className="font-semibold text-yellow-900 mb-2">Sizes for {color}:</div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={sizeInput[color]?.size || ''}
                onChange={e => setSizeInput({ ...sizeInput, [color]: { ...sizeInput[color], size: e.target.value } })}
                placeholder="Size (e.g. S, M, L)"
                className="border rounded px-2 py-1"
              />
              <input
                type="number"
                value={sizeInput[color]?.stock || 0}
                onChange={e => setSizeInput({ ...sizeInput, [color]: { ...sizeInput[color], stock: Number(e.target.value) } })}
                placeholder="Stock"
                className="border rounded px-2 py-1 w-20"
                min={0}
              />
              <Button onClick={() => handleAddSize(color)} size="sm" className="bg-yellow-500 text-white">Add Size</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(sizes[color] || []).map((s, idx) => (
                <Badge key={idx} className="bg-yellow-100 text-yellow-900 flex items-center gap-1">
                  {s.size} ({s.stock})
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveSize(color, idx)} />
                </Badge>
              ))}
            </div>
            {/* Images for this color */}
            <div className="mt-2">
              <label className="text-yellow-900">Images for {color} (comma-separated URLs):</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={imageInput[color] || ''}
                  onChange={e => setImageInput({ ...imageInput, [color]: e.target.value })}
                  placeholder="https://example.com/img1.jpg,https://example.com/img2.jpg"
                  className="border rounded px-2 py-1 flex-1"
                />
                <Button onClick={() => handleSetImages(color)} size="sm" className="bg-yellow-500 text-white">Set Images</Button>
                <Button onClick={() => handleRemoveImages(color)} size="sm" variant="outline" className="border-yellow-300 text-yellow-900">Clear</Button>
              </div>
              {images[color] && (
                <div className="text-xs text-yellow-700 mt-1">{images[color]}</div>
              )}
            </div>
          </div>
        ))}
        {/* Show Generated JSON */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-yellow-900">Variants JSON</span>
              <Button size="sm" onClick={() => copyToClipboard(variantsJSON)} className="bg-yellow-500 text-white">Copy</Button>
            </div>
            <textarea
              className="w-full border rounded p-2 text-xs font-mono bg-yellow-50"
              rows={6}
              value={variantsJSON}
              readOnly
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-yellow-900">Images JSON</span>
              <Button size="sm" onClick={() => copyToClipboard(imagesJSON)} className="bg-yellow-500 text-white">Copy</Button>
            </div>
            <textarea
              className="w-full border rounded p-2 text-xs font-mono bg-yellow-50"
              rows={6}
              value={imagesJSON}
              readOnly
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BulkUpload: React.FC<BulkUploadProps> = ({ isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ProductRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState<'select' | 'preview' | 'uploading' | 'complete'>('select');
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch available categories
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;
      
      setCategories(data || []);
      
      if (data && data.length > 0) {
        toast({
          title: "Categories Loaded",
          description: `Found ${data.length} available categories for reference.`,
        });
      } else {
        toast({
          title: "No Categories Found",
          description: "No categories exist yet. You can leave category_ids empty or create categories first.",
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error Loading Categories",
        description: "Could not fetch categories. You can still proceed with empty category_ids.",
        variant: "destructive",
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  // Generate Excel template with dropdown validation
  const downloadExcelTemplate = () => {
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Define the headers
      const headers = [
        'name',
        'slug', 
        'description',
        'price',
        'stock_quantity',
        'is_active',
        'is_featured',
        'color',
        'tags',
        'category_ids',
        'images'
      ];
      
      // Sample data
      const sampleData = [
        [
          'Neon Street Tee',
          'neon-street-tee',
          'Bold neon design perfect for street style',
          799,
          50,
          'true',
          'false',
          'Neon Green',
          'streetwear,neon,trending',
          '',
          'https://example.com/image1.jpg,https://example.com/image2.jpg'
        ],
        [
          'Cyber Punk Hoodie',
          'cyber-punk-hoodie',
          'Futuristic hoodie with LED accents',
          1299,
          25,
          'true',
          'true',
          'Black',
          'cyberpunk,hoodie,premium',
          '',
          'https://example.com/hoodie1.jpg'
        ],
        [
          'Minimalist White Tee',
          'minimalist-white-tee',
          'Clean and simple design for everyday wear',
          599,
          100,
          'true',
          'false',
          'White',
          'minimalist,basic,cotton',
          '',
          'https://example.com/white-tee.jpg'
        ]
      ];
      
      // Create the main data worksheet
      const wsData = [headers, ...sampleData];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Define dropdown options
      const activeOptions = ['true', 'false'];
      const featuredOptions = ['true', 'false'];
      const colorOptions = [
        'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 
        'Pink', 'Brown', 'Gray', 'Navy Blue', 'Neon Green', 'Neon Pink', 
        'Neon Yellow', 'Neon Orange', 'Electric Blue', 'Hot Pink', 'Lime Green'
      ];
      
      // Create validation sheets for dropdowns
      const validationWs1 = XLSX.utils.aoa_to_sheet([['Active Options'], ...activeOptions.map(opt => [opt])]);
      const validationWs2 = XLSX.utils.aoa_to_sheet([['Featured Options'], ...featuredOptions.map(opt => [opt])]);
      const validationWs3 = XLSX.utils.aoa_to_sheet([['Color Options'], ...colorOptions.map(opt => [opt])]);
      
      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Products');
      XLSX.utils.book_append_sheet(wb, validationWs1, 'ActiveOptions');
      XLSX.utils.book_append_sheet(wb, validationWs2, 'FeaturedOptions');
      XLSX.utils.book_append_sheet(wb, validationWs3, 'ColorOptions');
      
      // Create instructions sheet
      const instructions = [
        ['Field', 'Description', 'Valid Values', 'Example'],
        ['name', 'Product name (required)', 'Any text', 'Neon Street Tee'],
        ['slug', 'URL-friendly identifier (required)', 'lowercase, numbers, hyphens only', 'neon-street-tee'],
        ['description', 'Product description', 'Any text', 'Bold neon design perfect for street style'],
        ['price', 'Price in your currency (required)', 'Number greater than 0', '799'],
        ['stock_quantity', 'Available quantity', 'Number 0 or greater', '50'],
        ['is_active', 'Product visibility on shop', 'true or false', 'true'],
        ['is_featured', 'Featured product status', 'true or false', 'false'],
        ['color', 'Product color', 'Color name or hex code', 'Dark Brown or #5C4033'],
        ['tags', 'Product tags for filtering/search', 'Comma-separated values (no spaces after commas)', 'streetwear,neon,trending'],
        ['category_ids', 'Category IDs (use Show Categories to find IDs)', 'Comma-separated category IDs or leave empty', 'cat-123,cat-456'],
        ['images', 'Product image URLs', 'Comma-separated full URLs to images (HTTPS recommended)', 'https://example.com/image1.jpg,https://example.com/image2.jpg']
      ];
      
      // Add color instructions
      const colorInstructions = [
        [],
        ['AVAILABLE COLORS:'],
        [],
        ...Object.entries(COLOR_MAPPING).map(([name, hex]) => 
          [`${name} (${hex})`]
        ),
        [],
        ['NOTE: You can use either the color name (e.g., "Dark Brown") or the hex code (e.g., "#5C4033")']
      ];
      
      // Add detailed field explanations
      const detailedInstructions = [
        [],
        ['DETAILED FIELD EXPLANATIONS:'],
        [],
        ['CATEGORY_IDS:'],
        ['• Use the "Show Categories" button in the upload dialog to see available category IDs'],
        ['• Format: cat-123,cat-456 (comma-separated, no spaces)'],
        ['• Leave empty if no categories or create categories first in admin'],
        ['• Categories help organize products and enable filtering'],
        [],
        ['IMAGES:'],
        ['• Use full URLs starting with https:// or http://'],
        ['• Supported formats: JPG, PNG, WebP, GIF'],
        ['• Multiple images: separate with commas (no spaces after commas)'],
        ['• Recommended size: 800x800px or larger for best quality'],
        ['• Images should be uploaded to a file hosting service first'],
        ['• Examples:'],
        ['  - Single: https://cdn.example.com/product1.jpg'],
        ['  - Multiple: https://cdn.example.com/front.jpg,https://cdn.example.com/back.jpg'],
        [],
        ['TAGS:'],
        ['• Help customers find products through search and filtering'],
        ['• Use lowercase, single words or short phrases'],
        ['• Separate with commas (no spaces after commas)'],
        ['• Examples: streetwear,neon,cotton,unisex,trending'],
        [],
        ['TIPS:'],
        ['• Required fields: name, slug, price'],
        ['• slug must be unique and URL-friendly'],
        ['• Use consistent naming for colors and tags'],
        ['• Test with a few products first before bulk upload']
      ];
      
      const allInstructions = [...instructions, ...colorInstructions, ...detailedInstructions];
      const instructionsWs = XLSX.utils.aoa_to_sheet(allInstructions);
      
      // Set column widths
      const wscols = [
        { wch: 20 }, // name
        { wch: 20 }, // slug
        { wch: 30 }, // description
        { wch: 10 }, // price
        { wch: 15 }, // stock_quantity
        { wch: 10 }, // is_active
        { wch: 12 }, // is_featured
        { wch: 15 }, // color
        { wch: 25 }, // tags
        { wch: 15 }, // category_ids
        { wch: 30 }  // images
      ];
      ws['!cols'] = wscols;
      
      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bulk_products_template.xlsx';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Excel Template Downloaded",
        description: "Excel template with dropdown validation downloaded successfully!",
      });
      
    } catch (error) {
      console.error('Excel template generation failed:', error);
      toast({
        title: "Excel Download Failed",
        description: "Failed to generate Excel template. Please try the CSV template instead.",
        variant: "destructive",
      });
    }
  };

  // Sample CSV template for the new model
  const downloadTemplate = () => {
    const headers = [
      'name',
      'slug',
      'description',
      'price',
      'is_active',
      'is_featured',
      'variants',
      'images',
      'tags',
      'category_ids'
    ];
    const sampleRow = [
      'Neon Street Tee',
      'neon-street-tee',
      'Bold neon design perfect for street style',
      '799',
      'true',
      'false',
      '[{"color":"Neon Green","sizes":[{"size":"S","stock":10},{"size":"M","stock":15}]},{"color":"Neon Pink","sizes":[{"size":"S","stock":5}]}]',
      '{"Neon Green":["https://example.com/green1.jpg","https://example.com/green2.jpg"],"Neon Pink":["https://example.com/pink1.jpg"]}',
      'streetwear,neon',
      'cat-tshirts'
    ];
    const csvContent = [headers.join(','), sampleRow.map(v => `"${v.replace(/"/g, '""')}"`).join(',')].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_products_template.csv';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast({
      title: "Template Downloaded",
      description: "CSV template downloaded successfully. Check your Downloads folder.",
    });
  };

  // Parse CSV file
  const parseCSV = (text: string): ProductRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    // Improved CSV parsing that handles quoted fields
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      let i = 0;
      
      while (i < line.length) {
        const char = line[i];
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            // Escaped quote
            current += '"';
            i += 2;
          } else {
            // Toggle quotes
            inQuotes = !inQuotes;
            i++;
          }
        } else if (char === ',' && !inQuotes) {
          // Field separator
          result.push(current.trim());
          current = '';
          i++;
        } else {
          current += char;
          i++;
        }
      }
      
      // Add the last field
      result.push(current.trim());
      return result;
    };
    
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    console.log('Parsed headers:', headers); // Debug log
    
    return lines.slice(1)
      .map((line, lineIndex) => {
        const values = parseCSVLine(line);
        
        // Check if this row has any meaningful data
        const hasData = values.some(value => value && value.trim() !== '');
        if (!hasData) {
          console.log(`Skipping empty line ${lineIndex + 2}`);
          return null; // Skip completely empty rows
        }
        
        console.log(`Parsing line ${lineIndex + 2}:`, values); // Debug log
        
        const row: any = {};
        
        headers.forEach((header, index) => {
          let value = values[index] || '';
          
          // Type conversion
          if (header === 'color') {
            // Convert color name to hex code if possible
            const hexCode = getColorHexCode(value);
            row[header] = hexCode || value; // Fallback to original value if no mapping found
          } else if (header === 'price' || header === 'stock_quantity') {
            row[header] = parseFloat(value) || 0;
          } else if (header === 'is_active' || header === 'is_featured') {
            row[header] = value.toLowerCase() === 'true';
          } else if (header === 'tags') {
            // Handle comma-separated tags
            row[header] = value ? value.split(',').map(t => t.trim()).filter(t => t) : [];
          } else if (header === 'category_ids') {
            // Handle comma-separated category IDs
            row[header] = value ? value.split(',').map(t => t.trim()).filter(t => t) : [];
          } else if (header === 'images') {
            // Handle comma-separated image URLs
            row[header] = value ? value.split(',').map(t => t.trim()).filter(t => t) : [];
          } else {
            row[header] = value;
          }
        });
        
        return row as ProductRow;
      })
      .filter(row => row !== null) as ProductRow[]; // Remove null entries (empty rows)
  };

  // Validate product data
  const validateData = (data: ProductRow[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Valid options for dropdown fields
    const validActiveOptions = ['true', 'false'];
    const validFeaturedOptions = ['true', 'false'];
    const suggestedColors = [
      'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 
      'Pink', 'Brown', 'Gray', 'Navy Blue', 'Neon Green', 'Neon Pink', 
      'Neon Yellow', 'Neon Orange', 'Electric Blue', 'Hot Pink', 'Lime Green'
    ];
    
    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 because row 1 is headers and we start from 0
      
      // Required fields
      if (!row.name?.trim()) {
        errors.push({ row: rowNum, field: 'name', message: 'Product name is required' });
      }
      
      if (!row.slug?.trim()) {
        errors.push({ row: rowNum, field: 'slug', message: 'Product slug is required' });
      }
      
      if (!row.price || row.price <= 0) {
        errors.push({ row: rowNum, field: 'price', message: 'Price must be greater than 0' });
      }
      
      // Slug format validation
      if (row.slug && !/^[a-z0-9-]+$/.test(row.slug)) {
        errors.push({ row: rowNum, field: 'slug', message: 'Slug must contain only lowercase letters, numbers, and hyphens' });
      }
      
      // Dropdown field validation with helpful suggestions
      if (row.is_active !== undefined) {
        const activeValue = String(row.is_active).toLowerCase();
        if (!validActiveOptions.includes(activeValue)) {
          errors.push({ 
            row: rowNum, 
            field: 'is_active', 
            message: `Must be "true" or "false". Found: "${row.is_active}"` 
          });
        }
      }
      
      if (row.is_featured !== undefined) {
        const featuredValue = String(row.is_featured).toLowerCase();
        if (!validFeaturedOptions.includes(featuredValue)) {
          errors.push({ 
            row: rowNum, 
            field: 'is_featured', 
            message: `Must be "true" or "false". Found: "${row.is_featured}"` 
          });
        }
      }
      
      // Images validation
      if (row.images && Array.isArray(row.images)) {
        row.images.forEach((imageUrl, index) => {
          if (imageUrl && !imageUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
            errors.push({ 
              row: rowNum, 
              field: 'images', 
              message: `Image ${index + 1}: "${imageUrl}" is not a valid image URL. Must start with http:// or https:// and end with image extension (.jpg, .png, .gif, .webp)` 
            });
          }
        });
      }
      
      // Category IDs validation (format check only, not existence)
      if (row.category_ids && Array.isArray(row.category_ids)) {
        row.category_ids.forEach((categoryId, index) => {
          if (categoryId && !categoryId.match(/^[a-zA-Z0-9-_]+$/)) {
            errors.push({ 
              row: rowNum, 
              field: 'category_ids', 
              message: `Category ID ${index + 1}: "${categoryId}" has invalid format. Use only letters, numbers, hyphens, and underscores` 
            });
          }
        });
      }
      
      // Check for duplicate slugs in the same file
      const duplicateSlug = data.find((otherRow, otherIndex) => 
        otherIndex !== index && otherRow.slug === row.slug
      );
      if (duplicateSlug) {
        errors.push({ row: rowNum, field: 'slug', message: 'Duplicate slug found in file' });
      }
    });
    
    return errors;
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV or Excel file (.csv, .xlsx, .xls).",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    
    if (fileName.endsWith('.csv')) {
      // Handle CSV file
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
          const data = parseCSV(text);
          setParsedData(data);
          
          const errors = validateData(data);
          setValidationErrors(errors);
          
          setStep('preview');
        } catch (error) {
          toast({
            title: "Parse Error",
            description: "Failed to parse CSV file. Please check the format.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(selectedFile);
    } else {
      // Handle Excel file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            throw new Error('Excel file is empty');
          }
          
          // Convert to our format
          const headers = (jsonData[0] as string[]).map(h => h.toLowerCase().trim());
          const rows = jsonData.slice(1) as any[][];
          
          const parsedExcelData: ProductRow[] = rows
            .map((row, index) => {
              // Check if this row has any meaningful data
              const hasData = row.some(value => value && String(value).trim() !== '');
              if (!hasData) {
                console.log(`Skipping empty Excel row ${index + 2}`);
                return null; // Skip completely empty rows
              }
              
              const rowData: any = {};
              headers.forEach((header, headerIndex) => {
                let value = row[headerIndex] || '';
                
                // Type conversion (same as CSV parsing)
                if (header === 'color') {
                  // Convert color name to hex code if possible
                  const hexCode = getColorHexCode(value);
                  rowData[header] = hexCode || value; // Fallback to original value if no mapping found
                } else if (header === 'price' || header === 'stock_quantity') {
                  rowData[header] = parseFloat(value) || 0;
                } else if (header === 'is_active' || header === 'is_featured') {
                  rowData[header] = String(value).toLowerCase() === 'true';
                } else if (header === 'tags') {
                  rowData[header] = value ? String(value).split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];
                } else if (header === 'category_ids') {
                  rowData[header] = value ? String(value).split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];
                } else if (header === 'images') {
                  rowData[header] = value ? String(value).split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];
                } else {
                  rowData[header] = String(value);
                }
              });
              return rowData as ProductRow;
            })
            .filter(row => row !== null) as ProductRow[]; // Remove null entries (empty rows)
          
          setParsedData(parsedExcelData);
          
          const errors = validateData(parsedExcelData);
          setValidationErrors(errors);
          
          setStep('preview');
          
        } catch (error) {
          console.error('Excel parsing error:', error);
          toast({
            title: "Parse Error",
            description: "Failed to parse Excel file. Please check the format and try again.",
            variant: "destructive",
          });
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  // Upload products to database (new robust model)
  const uploadProducts = async () => {
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Errors",
        description: "Please fix validation errors before uploading.",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    setStep('uploading');
    try {
      let successCount = 0;
      const totalProducts = parsedData.length;
      for (let i = 0; i < parsedData.length; i++) {
        const product = parsedData[i];
        // Parse variants and images JSON
        let variantsArr, imagesObj;
        try {
          variantsArr = JSON.parse(product.variants);
          imagesObj = JSON.parse(product.images);
        } catch (err) {
          toast({
            title: "JSON Parse Error",
            description: `Row ${i + 2}: Invalid JSON in variants or images column.`,
            variant: "destructive",
          });
          continue;
        }
        // Insert or update product
        const productData = {
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          price: product.price,
          is_active: product.is_active,
          is_featured: product.is_featured,
          tags: product.tags ? product.tags.split(',').map(t => t.trim()) : [],
          category_ids: product.category_ids ? product.category_ids.split(',').map(t => t.trim()) : [],
          images: Object.values(imagesObj).flat() // all images for gallery
        };
        // Upsert product by slug
        const { data: upsertedProduct, error: productError } = await supabase
          .from('products')
          .upsert(productData, { onConflict: 'slug' })
          .select('*')
          .single();
        if (productError || !upsertedProduct) {
          toast({
            title: "Upload Error",
            description: `Failed to upload product: ${product.name}`,
            variant: "destructive",
          });
          continue;
        }
        // Insert or update variants
        for (const variant of variantsArr) {
          const color = variant.color;
          const colorImages = imagesObj[color] || [];
          for (const sizeObj of variant.sizes) {
            const { size, stock } = sizeObj;
            // Upsert variant by product_id, color, size
            const { error: variantError } = await supabase
              .from('product_variants')
              .upsert({
                product_id: upsertedProduct.id,
                color,
                size,
                stock_quantity: stock,
                images: colorImages
              }, { onConflict: 'product_id,color,size' });
            if (variantError) {
              toast({
                title: "Variant Upload Error",
                description: `Failed to upload variant: ${product.name} - ${color} / ${size}`,
                variant: "destructive",
              });
            }
          }
        }
        successCount++;
        setUploadProgress(((i + 1) / totalProducts) * 100);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      setStep('complete');
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${successCount} of ${totalProducts} products.`,
      });
      if (successCount > 0) {
        onSuccess();
      }
    } catch (error) {
      console.error('Bulk upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "An error occurred during bulk upload.",
        variant: "destructive",
      });
    }
    setUploading(false);
  };

  // Reset component state
  const resetUpload = () => {
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setUploadProgress(0);
    setStep('select');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetUpload();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-white border-2 border-gray-300 shadow-2xl">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Bulk Upload Products
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Upload multiple products at once using a CSV file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 p-6 bg-white">
          {/* Step 1: File Selection */}
          {step === 'select' && (
            <div className="space-y-8 bg-white">
              {/* JSON Builder Section */}
              <JSONBuilder />
              {/* Template Download Section */}
              <Card className="border-2 border-gray-300 shadow-xl bg-white">
                <CardHeader className="pb-4 bg-green-50 border-b border-gray-200">
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white shadow-lg">
                      <Download className="h-6 w-6" />
                    </div>
                    Step 1: Download Template
                  </CardTitle>
                  <p className="text-gray-800 font-medium">
                    Choose your preferred template format to get started with bulk upload
                  </p>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Excel Template */}
                    <div className="bg-white border-2 border-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white">
                          <FileSpreadsheet className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">Excel Template</h3>
                          <p className="text-sm text-gray-700 font-medium">Recommended for beginners</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-800">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Dropdown validation for fields</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-800">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Built-in instructions sheet</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-800">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Error prevention features</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-800">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Sample data included</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={downloadExcelTemplate} 
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Download Excel Template
                      </Button>
                    </div>

                    {/* CSV Template */}
                    <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">CSV Template</h3>
                          <p className="text-sm text-gray-700 font-medium">Universal compatibility</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-800">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Works with all spreadsheet apps</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-800">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Smaller file size</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-800">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Faster processing</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-800">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Simple format</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={downloadTemplate} 
                        variant="outline"
                        className="w-full border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 font-semibold"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image Upload Helper */}
              <Card className="border-2 border-gray-300 shadow-xl bg-white">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                      <Upload className="h-5 w-5" />
                    </div>
                    Free Image Upload
                  </CardTitle>
                  <p className="text-gray-700">Upload product images and get URLs for your CSV/Excel file</p>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  <ImageUploadHelper 
                    onUrlsGenerated={(urls) => {
                      console.log('Generated URLs:', urls);
                    }} 
                  />
                </CardContent>
              </Card>

              {/* File Upload Section */}
              <Card className="border-2 border-gray-300 shadow-xl bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
                      <Upload className="h-6 w-6" />
                    </div>
                    Step 2: Upload Your File
                  </CardTitle>
                  <p className="text-gray-700">
                    Upload your completed CSV or Excel file with product data
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="bg-white">
                    <div className="border-2 border-dashed border-gray-400 rounded-2xl p-12 text-center bg-white hover:bg-blue-50 hover:border-blue-400 transition-all duration-300">
                      <div className="bg-white">
                        <FileText className="h-16 w-16 mx-auto text-gray-500 hover:text-blue-500 mb-6 transition-all duration-300" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3 hover:text-blue-700 transition-all duration-300">
                        Drop your file here or click to browse
                      </h3>
                      <p className="text-gray-600 mb-6 text-lg font-medium">
                        Supports CSV (.csv) and Excel (.xlsx, .xls) files up to 10MB
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 font-semibold"
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        Select File
                      </Button>
                    </div>
                  </div>
                  
                  {/* Quick Reference */}
                  <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white">
                    <Card className="bg-white border-2 border-blue-300 shadow-lg">
                      <CardHeader className="pb-3 bg-blue-50 border-b border-blue-200">
                        <CardTitle className="text-blue-800 flex items-center gap-2 font-bold">
                          <Eye className="h-5 w-5" />
                          Field Reference
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 bg-white">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-white p-2 rounded">
                              <span className="font-bold text-blue-800">is_active:</span>
                              <p className="text-blue-700 font-medium">true/false - Controls shop visibility</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <span className="font-bold text-blue-800">is_featured:</span>
                              <p className="text-blue-700 font-medium">true/false - Featured status</p>
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t border-blue-200 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-blue-800">Categories:</span>
                              <Button 
                                onClick={fetchCategories} 
                                disabled={loadingCategories}
                                size="sm" 
                                variant="outline" 
                                className="text-xs border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-medium"
                              >
                                {loadingCategories ? 'Loading...' : 'Show Categories'}
                              </Button>
                            </div>
                            {categories.length > 0 ? (
                              <div className="max-h-24 overflow-y-auto bg-white rounded border-2 border-blue-200 p-2">
                                {categories.slice(0, 3).map(cat => (
                                  <div key={cat.id} className="text-xs mb-1 bg-white p-1 rounded">
                                    <code className="bg-blue-100 px-1 rounded text-blue-800 font-medium">{cat.id}</code> 
                                    <span className="text-gray-700 font-medium"> - {cat.name}</span>
                                  </div>
                                ))}
                                {categories.length > 3 && (
                                  <div className="text-xs text-blue-600 font-medium">...and {categories.length - 3} more</div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-blue-600 bg-white p-2 rounded border border-blue-200 font-medium">
                                Format: cat-123,cat-456 (comma-separated)
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white border-2 border-purple-300 shadow-lg">
                      <CardHeader className="pb-3 bg-purple-50 border-b border-purple-200">
                        <CardTitle className="text-purple-800 flex items-center gap-2 font-bold">
                          <Sparkles className="h-5 w-5" />
                          Image Guidelines
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 bg-white">
                        <div className="space-y-3 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 bg-white p-1 rounded">
                              <CheckCircle className="h-4 w-4 text-purple-600" />
                              <span className="text-purple-800 font-medium">Full URLs starting with https://</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white p-1 rounded">
                              <CheckCircle className="h-4 w-4 text-purple-600" />
                              <span className="text-purple-800 font-medium">Formats: JPG, PNG, WebP, GIF</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white p-1 rounded">
                              <CheckCircle className="h-4 w-4 text-purple-600" />
                              <span className="text-purple-800 font-medium">Multiple images: comma-separated</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white p-1 rounded">
                              <CheckCircle className="h-4 w-4 text-purple-600" />
                              <span className="text-purple-800 font-medium">Recommended: 800x800px+</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 p-2 bg-white rounded border-2 border-purple-200">
                            <p className="text-xs text-purple-700 font-medium">
                              <strong>Example:</strong><br/>
                              https://cdn.example.com/front.jpg,https://cdn.example.com/back.jpg
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Data Preview & Validation */}
          {step === 'preview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Preview & Validation
                  </h2>
                  <p className="text-gray-600 mt-1">Review your data before uploading</p>
                </div>
                <Button onClick={resetUpload} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <X className="h-4 w-4 mr-2" />
                  Choose Different File
                </Button>
              </div>

              {/* Validation Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-900">{parsedData.length}</div>
                        <p className="text-sm text-green-700">Products Found</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className={`${validationErrors.length > 0 ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl text-white ${validationErrors.length > 0 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}>
                        {validationErrors.length > 0 ? (
                          <AlertCircle className="h-6 w-6" />
                        ) : (
                          <CheckCircle className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${validationErrors.length > 0 ? 'text-red-900' : 'text-green-900'}`}>
                          {validationErrors.length}
                        </div>
                        <p className={`text-sm ${validationErrors.length > 0 ? 'text-red-700' : 'text-green-700'}`}>
                          Validation {validationErrors.length === 1 ? 'Error' : 'Errors'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-900">
                          {validationErrors.length === 0 ? 'Ready' : 'Pending'}
                        </div>
                        <p className="text-sm text-blue-700">Upload Status</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
                  <CardHeader>
                    <CardTitle className="text-red-800 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Validation Errors ({validationErrors.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {validationErrors.map((error, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-800">
                              Row {error.row} - {error.field}
                            </p>
                            <p className="text-sm text-red-600">{error.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Data Preview */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Data Preview (First 5 rows)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                          <th className="text-left p-4 font-semibold text-gray-800">Name</th>
                          <th className="text-left p-4 font-semibold text-gray-800">Slug</th>
                          <th className="text-left p-4 font-semibold text-gray-800">Price</th>
                          <th className="text-left p-4 font-semibold text-gray-800">Stock</th>
                          <th className="text-left p-4 font-semibold text-gray-800">Active</th>
                          <th className="text-left p-4 font-semibold text-gray-800">Featured</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 5).map((product, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                            <td className="p-4 font-medium text-gray-900">{product.name}</td>
                            <td className="p-4 text-gray-600 font-mono text-xs">{product.slug}</td>
                            <td className="p-4 font-semibold text-gray-900">₹{product.price.toLocaleString()}</td>
                            <td className="p-4 text-gray-600">
                              {
                                (() => {
                                  try {
                                    const variantsArr = JSON.parse(product.variants);
                                    return variantsArr.reduce((sum: number, variant: any) => sum + (Array.isArray(variant.sizes) ? variant.sizes.reduce((s: number, sz: any) => s + (sz.stock || 0), 0) : 0), 0);
                                  } catch {
                                    return '';
                                  }
                                })()
                              }
                            </td>
                            <td className="p-4">
                              <Badge variant={product.is_active ? 'default' : 'secondary'} className={product.is_active ? 'bg-green-600' : ''}>
                                {product.is_active ? 'Yes' : 'No'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge variant={product.is_featured ? 'default' : 'secondary'} className={product.is_featured ? 'bg-blue-600' : ''}>
                                {product.is_featured ? 'Yes' : 'No'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedData.length > 5 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700 text-center">
                        ... and <strong>{parsedData.length - 5}</strong> more products
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button onClick={resetUpload} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancel
                </Button>
                <Button 
                  onClick={uploadProducts} 
                  disabled={validationErrors.length > 0}
                  className={`${validationErrors.length > 0 ? 'opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'} text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8`}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Upload {parsedData.length} Products
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Uploading */}
          {step === 'uploading' && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white">
                    <Upload className="h-12 w-12 animate-bounce" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                  Uploading Products...
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Please don't close this window during upload
                </p>
                
                <div className="max-w-md mx-auto">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress 
                      value={uploadProgress} 
                      className="h-3 bg-gray-200"
                    />
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-700">
                      <Sparkles className="h-4 w-4 inline mr-1" />
                      Processing your products with care...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-xl"></div>
                  <div className="relative p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white animate-pulse">
                    <CheckCircle className="h-12 w-12" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                  Upload Complete!
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Your products have been successfully uploaded to the database
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-lg font-bold text-green-900">{parsedData.length}</div>
                      <p className="text-sm text-green-700">Products Added</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-lg font-bold text-blue-900">Ready</div>
                      <p className="text-sm text-blue-700">For Sale</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-lg font-bold text-purple-900">Live</div>
                      <p className="text-sm text-purple-700">On Store</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={resetUpload} 
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6"
                  >
                    Upload More Products
                  </Button>
                  <Button 
                    onClick={handleClose}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
                  >
                    Close & View Products
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUpload; 