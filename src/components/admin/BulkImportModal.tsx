import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface BlogPost {
  title: string;
  content: string;
  slug?: string;
  excerpt?: string | null;
  featured_image?: string | null;
  author_name?: string;
  categories?: string[];
  tags?: string[];
  is_active?: boolean;
  publish_date?: string;
  status?: string;
  post_type?: string;
  seo_title?: string;
  seo_description?: string;
  created_at?: string;
  updated_at?: string;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const sanitizeHtml = (html: string) => {
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'article', 'section', 'main', 'aside', 'figure', 'figcaption', 'cite'],
      ADD_ATTR: ['class', 'id', 'src', 'href', 'alt', 'title', 'target', 'rel', 'style'],
      ALLOW_DATA_ATTR: true
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Parse and preview the file with HTML content
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const previewData = results.data.slice(0, 3).map((row: any) => ({
            ...row,
            content: row.content ? sanitizeHtml(row.content) : '',
          }));
          setPreview(previewData);
        }
      });
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const results = await new Promise<any>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results),
          error: (error) => reject(error)
        });
      });

      const posts = results.data.map((row: any) => ({
        title: row.title?.trim(),
        content: row.content ? sanitizeHtml(row.content) : '',
        slug: row.slug || row.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        excerpt: row.excerpt?.trim() || null,
        featured_image: row.featured_image?.trim() || null,
        author_name: row.author_name?.trim() || 'Admin',
        categories: row.categories ? row.categories.split(',').map((c: string) => c.trim()) : [],
        tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
        is_active: row.is_active === 'true' || row.is_active === '1',
        publish_date: row.publish_date || new Date().toISOString(),
        status: row.status?.trim() || 'draft',
        post_type: row.post_type?.trim() || 'article',
        seo_title: row.seo_title?.trim() || row.title,
        seo_description: row.seo_description?.trim() || row.excerpt || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Validate required fields
      const invalidPosts = posts.filter((post: BlogPost) => !post.title || !post.content);
      if (invalidPosts.length > 0) {
        throw new Error(`${invalidPosts.length} posts are missing required fields (title or content)`);
      }

      const { error } = await supabase
        .from('blog_posts')
        .insert(posts);

      if (error) throw error;

      toast.success(`Successfully imported ${posts.length} blog posts`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error importing posts:', error);
      toast.error('Failed to import posts: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.type === 'application/vnd.ms-excel')) {
      setFile(droppedFile);
      Papa.parse(droppedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const previewData = results.data.slice(0, 3).map((row: any) => ({
            ...row,
            content: row.content ? sanitizeHtml(row.content) : '',
          }));
          setPreview(previewData);
        }
      });
    } else {
      toast.error('Please upload a CSV file');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/blog_posts_template.csv';
    link.download = 'blog_posts_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] bg-gray-900/95 backdrop-blur-xl border border-neon-cyan/50 text-white shadow-2xl overflow-hidden flex flex-col rounded-xl animate-in fade-in-0 duration-200">
        <DialogHeader className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 shrink-0 border-b border-gray-800">
          <DialogTitle className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20">
              <FileSpreadsheet className="h-5 w-5 text-neon-cyan" />
            </div>
            <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-neon-purple">
              Bulk Import Blog Posts
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-400 mt-2 ml-[44px]">
            Import multiple blog posts using a CSV file with HTML support
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 bg-gray-900/95 overflow-y-auto p-6">
          <div className="flex justify-end shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="bg-gray-800/50 text-neon-cyan hover:bg-gray-700/50 border-neon-cyan/30 hover:border-neon-cyan/50 transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <div 
            className={`border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
              file 
                ? 'border-neon-cyan/50 bg-gray-800/30' 
                : 'border-gray-700 bg-gray-800/20 hover:border-gray-600'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="text-center">
              {file ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mx-auto">
                    <FileSpreadsheet className="h-6 w-6 text-neon-cyan" />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-neon-cyan">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="font-medium">{file.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="text-red-400 hover:text-red-300 border-red-950 hover:border-red-900/50 bg-red-950/10 hover:bg-red-950/20"
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-gray-800/50 border-2 border-gray-700/50 flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-neon-cyan hover:text-neon-cyan/80 transition-colors duration-200"
                    >
                      <span>Upload a file</span>
                      <Input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".csv"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="text-gray-400">or drag and drop</p>
                    <p className="text-xs text-gray-500">CSV files up to 10MB</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {preview.length > 0 && (
            <div className="space-y-3 bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-sm font-medium text-neon-cyan flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                  <FileSpreadsheet className="h-4 w-4 text-neon-cyan" />
                </div>
                Preview (First 3 rows)
              </h3>
              <div className="text-xs bg-gray-900/80 border border-gray-800 p-4 rounded-lg overflow-x-auto text-gray-300 max-h-[200px] overflow-y-auto custom-scrollbar">
                <pre className="font-mono">{JSON.stringify(preview, null, 2)}</pre>
              </div>
            </div>
          )}

          <Alert className="bg-gray-800/30 border-neon-cyan/20 rounded-xl">
            <AlertCircle className="h-5 w-5 text-neon-cyan" />
            <AlertDescription className="text-gray-300 ml-2">
              <div className="space-y-2">
                <div>
                  <span className="text-neon-cyan font-medium">Required columns:</span>
                  <span className="text-white ml-2 font-medium">title, content</span>
                </div>
                <div>
                  <span className="text-neon-cyan font-medium">Optional:</span>
                  <span className="text-gray-400 ml-2">
                    slug, excerpt, featured_image, author_name, categories, tags, is_active, 
                    publish_date, status, post_type, seo_title, seo_description
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-800">
                  <span className="text-neon-cyan/90 font-medium flex items-center gap-2">
                    <code className="bg-neon-cyan/10 px-2 py-1 rounded text-sm">HTML</code>
                    content is supported in the content field
                  </span>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-3 shrink-0 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 border-gray-700 hover:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || importing}
              className={`relative overflow-hidden ${
                !file 
                  ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                  : 'bg-neon-cyan text-gray-900 hover:bg-neon-cyan/90'
              }`}
            >
              {importing ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Import Posts
                </>
              )}
              {file && !importing && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportModal; 