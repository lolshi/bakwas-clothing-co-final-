# 🆓 Setup Supabase Storage for Image Uploads

## Step 1: Create Storage Bucket in Supabase

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project** (the one you're using for this e-commerce site)
3. **Navigate to Storage** in the left sidebar
4. **Click "Create a new bucket"**
5. **Fill in the details**:
   - **Name**: `product-images`
   - **Public**: ✅ **Check this box** (so images are publicly accessible)
   - **File size limit**: 50MB (default is fine)
   - **Allowed MIME types**: Leave empty (allows all image types)
6. **Click "Create bucket"**

## Step 2: Test Image Upload

Once you've created the bucket:

1. **Go to Admin Products** in your app
2. **Click "Bulk Upload"**
3. **You'll see a new "Free Image Upload" section**
4. **Upload a test image** to verify it's working
5. **Copy the generated URL** and paste it in a browser to verify it's accessible

## Alternative: Manual SQL Setup (Advanced)

If you prefer SQL, run this in your Supabase SQL Editor:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 52428800, null);

-- Create RLS policies for the bucket
CREATE POLICY "Anyone can view product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

## 🎉 That's It!

Your free image hosting is now ready! You get:
- ✅ **1GB free storage** (part of your Supabase free tier)
- ✅ **Global CDN** for fast image loading
- ✅ **Direct integration** with your database
- ✅ **HTTPS URLs** automatically
- ✅ **No external dependencies**

## Usage in Bulk Upload:
1. Upload images using the image uploader
2. Copy the generated URLs
3. Paste them in your CSV/Excel template
4. Use the bulk upload feature normally

## Free Tier Limits:
- **Storage**: 1GB total
- **Bandwidth**: 2GB/month
- **File size**: 50MB per file
- **Perfect for**: Small to medium e-commerce stores

---

**Need more storage?** Check out the other free alternatives mentioned in the main response! 