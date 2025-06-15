
# BAKWAS E-Commerce Platform - Technical Documentation

> Comprehensive technical architecture and implementation details for the BAKWAS streetwear e-commerce platform.

---

## 1. Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 18)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │ Components  │  │   Context Providers │  │
│  │  (Routes)   │  │    (UI)     │  │  (State Management) │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Supabase Backend Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ PostgreSQL  │  │    Auth     │  │       Storage       │  │
│  │ Database    │  │   Service   │  │    (File Uploads)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Edge        │  │ Real-time   │  │    Row Level        │  │
│  │ Functions   │  │ Subscriptions│  │    Security (RLS)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: React Router v6 with protected routes and admin sections
- **Styling**: Tailwind CSS with custom psychedelic color palette
- **UI Components**: shadcn/ui + Radix UI primitives
- **Animations**: Framer Motion for smooth transitions and effects
- **Forms**: React Hook Form with Zod validation schemas

**Backend/Data Layer**: Supabase (All-in-one Backend-as-a-Service)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Built-in auth with email/password and session management
- **Storage**: File storage for product images and user uploads
- **Real-time**: WebSocket subscriptions for live updates
- **Edge Functions**: Server-side logic for complex operations

**State Management**:
- **Global State**: React Context API for cart, wishlist, and authentication
- **Server State**: TanStack Query for data fetching and caching
- **Local State**: React useState for component-specific state

**CI/CD & Deployment**:
- **Platform**: Lovable hosting with automatic deployments
- **Environment**: Production environment variables managed through Lovable
- **Database**: Supabase cloud with automated backups

---

## 2. Page-by-Page Functionality

### 2.1 Home Page (`/`)

**Path & Route**: `/` (Index component)

**Purpose & UX Flow**:
- Hero banner with psychedelic BAKWAS logo and brand messaging
- Call-to-action buttons linking to shop and collection pages
- USP (Unique Selling Points) section showcasing brand values
- Featured products grid with filtering and quick-view functionality
- Newsletter signup integration

**Data Requirements**:
- `homepage_banners` table for dynamic hero content
- `products` table with `is_featured = true` for featured products
- `categories` table for product categorization

**API Calls**:
```typescript
// Fetch homepage banners
const { data: banners } = await supabase
  .from('homepage_banners')
  .select('*')
  .eq('is_active', true)
  .order('sort_order');

// Fetch featured products
const { data: featuredProducts } = await supabase
  .from('products')
  .select('*')
  .eq('is_featured', true)
  .eq('is_active', true)
  .limit(6);
```

**State Management**:
- Global cart context for add-to-cart functionality
- Local state for banner image loading and animation states
- TanStack Query for caching featured products data

### 2.2 Shop Page (`/shop`)

**Path & Route**: `/shop` with optional query parameters for filtering

**Purpose & UX Flow**:
- Product catalog with grid layout
- Advanced filtering sidebar (category, price, color, size)
- Sorting options (price, popularity, newest)
- Pagination or infinite scroll
- Quick-view modal for product details
- Add to cart and wishlist functionality

**Data Requirements**:
- `products` table with full product information
- `categories` table for filter options
- `featured_products` table for promoting specific items

**API Calls**:
```typescript
// Fetch products with filters
const { data: products, count } = await supabase
  .from('products')
  .select('*', { count: 'exact' })
  .eq('is_active', true)
  .filter('category_ids', 'cs', categoryFilter) // contains filter
  .gte('price', minPrice)
  .lte('price', maxPrice)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit);

// Real-time subscription for product updates
const subscription = supabase
  .channel('product-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'products'
  }, handleProductChange)
  .subscribe();
```

**State Management**:
- FilterState interface for managing active filters
- Cart context for add-to-cart operations
- Wishlist context for save-for-later functionality
- Local pagination state

### 2.3 Product Detail (`/product/[slug]`)

**Path & Route**: `/product/:slug` (dynamic routing based on product slug)

**Purpose & UX Flow**:
- Detailed product information with image carousel
- Size and color selection
- Quantity picker and add-to-cart functionality
- Product description and specifications
- Related products recommendations
- Customer reviews and ratings (future feature)

**Data Requirements**:
- `products` table for main product data
- Product images array for carousel
- Related products based on category or tags

**API Calls**:
```typescript
// Fetch single product by slug
const { data: product } = await supabase
  .from('products')
  .select('*')
  .eq('slug', productSlug)
  .eq('is_active', true)
  .single();

// Fetch related products
const { data: relatedProducts } = await supabase
  .from('products')
  .select('*')
  .filter('category_ids', 'cs', product.category_ids)
  .neq('id', product.id)
  .limit(4);
```

**State Management**:
- Local state for selected size, color, and quantity
- Cart context for add-to-cart operation
- Image carousel state for current image index

### 2.4 Cart Page (`/cart`)

**Path & Route**: `/cart`

**Purpose & UX Flow**:
- Display cart items with product details
- Quantity modification and item removal
- Price calculation (subtotal, shipping, taxes)
- Promo code application
- Proceed to checkout button
- Continue shopping link

**Data Requirements**:
- Cart items stored in React Context (persisted to localStorage)
- `promo_codes` table for discount validation
- Product data for displaying cart items

**API Calls**:
```typescript
// Validate promo code
const { data: promoCode } = await supabase
  .from('promo_codes')
  .select('*')
  .eq('code', code)
  .eq('is_active', true)
  .single();

// For authenticated users, sync cart with database
const { error } = await supabase
  .from('cart_items')
  .upsert({
    user_id: user.id,
    product_id: productId,
    quantity: quantity
  });
```

**State Management**:
- CartContext maintains cart items, total, and cart operations
- Local state for promo code input and loading states

### 2.5 Checkout Page (`/checkout`)

**Path & Route**: `/checkout` (protected route - authentication required)

**Purpose & UX Flow**:
- Multi-step checkout process with progress indicator
- Customer information form (name, email, phone)
- Shipping address form with validation
- Order summary with final pricing
- Payment method selection (future: Stripe integration)
- Order confirmation and email receipt

**Data Requirements**:
- `orders` table for order creation
- `order_items` table for order line items
- Cart items for order processing

**API Calls**:
```typescript
// Create order transaction
const { data: order, error } = await supabase
  .from('orders')
  .insert({
    order_number: generateOrderNumber(),
    customer_name: formData.name,
    customer_email: formData.email,
    customer_phone: formData.phone,
    shipping_address: formData.address,
    subtotal: cartTotal,
    shipping_cost: shippingCost,
    discount_amount: discountAmount,
    total_amount: finalTotal,
    status: 'pending',
    payment_status: 'pending'
  })
  .select()
  .single();

// Create order items
const orderItems = cartItems.map(item => ({
  order_id: order.id,
  product_id: item.product.id,
  product_name: item.product.name,
  product_image: item.product.images[0],
  unit_price: item.product.price,
  quantity: item.quantity,
  total_price: item.product.price * item.quantity
}));

const { error: itemsError } = await supabase
  .from('order_items')
  .insert(orderItems);
```

**State Management**:
- Multi-step form state with validation
- Cart context for order processing
- Loading states for form submission

### 2.6 User Profile (`/my-account`)

**Path & Route**: `/my-account` (protected route)

**Purpose & UX Flow**:
- User profile information display and editing
- Order history with status tracking
- Wishlist management
- Address book management
- Account settings and preferences

**Data Requirements**:
- `auth.users` for authentication data
- `profiles` table for extended user information
- `orders` table for order history

**API Calls**:
```typescript
// Fetch user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

// Fetch user orders
const { data: orders } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (
      *,
      products (name, images)
    )
  `)
  .eq('customer_email', user.email)
  .order('created_at', { ascending: false });

// Update profile
const { error } = await supabase
  .from('profiles')
  .update(profileData)
  .eq('id', user.id);
```

**State Management**:
- AuthContext for user session management
- Local form state for profile updates
- Order history cached with TanStack Query

---

## 3. Admin Dashboard

### Admin Route Structure
- **Base Route**: `/admin/*` (protected by AdminAuthContext)
- **Authentication**: Separate admin authentication system using `admin_users` table
- **Access Control**: Role-based access with admin-only routes

### Admin Pages

#### 3.1 Admin Dashboard (`/admin`)

**Functionality**:
- Real-time analytics and KPIs
- Recent orders overview
- Low stock alerts
- Sales performance charts

**Data Sources**:
```typescript
// Dashboard stats
const { data: stats } = await supabase
  .rpc('get_dashboard_stats', {
    date_range: '30 days'
  });

// Recent orders with date filtering
const { data: recentOrders } = await supabase
  .from('orders')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);
```

#### 3.2 Products Management (`/admin/products`)

**Functionality**:
- CRUD operations on products
- Image upload to Supabase Storage
- Bulk operations (activate/deactivate)
- Product variants management
- SEO optimization fields

**Key Operations**:
```typescript
// Create product with image upload
const imageUploadPromises = images.map(async (file) => {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('products')
    .upload(fileName, file);
  return data?.path;
});

const imagePaths = await Promise.all(imageUploadPromises);

const { data: product } = await supabase
  .from('products')
  .insert({
    name: formData.name,
    description: formData.description,
    price: formData.price,
    images: imagePaths,
    category_ids: formData.categories,
    is_active: true,
    is_featured: formData.featured
  });
```

#### 3.3 Orders Management (`/admin/orders`)

**Functionality**:
- View all orders with filtering and search
- Update order status (pending → processing → shipped → delivered)
- Order details with customer information
- Export orders to CSV
- Email notifications for status updates

**Order Status Flow**:
```typescript
// Update order status
const { error } = await supabase
  .from('orders')
  .update({ 
    status: newStatus,
    updated_at: new Date().toISOString()
  })
  .eq('id', orderId);

// Trigger status change notification (future: Edge Function)
```

#### 3.4 Homepage Management (`/admin/homepage`)

**Functionality**:
- Manage hero banners with image uploads
- Configure featured products
- Update USP sections
- A/B testing for banner performance

#### 3.5 Promo Codes (`/admin/promo-codes`)

**Functionality**:
- Create and manage discount codes
- Set usage limits and expiration dates
- Track promo code performance
- Bulk operations for seasonal campaigns

---

## 4. Supabase Integration & Logic

### 4.1 Database Schema

**Core Tables**:

```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  images TEXT[] DEFAULT '{}',
  category_ids UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  color TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping_cost NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  unit_price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  total_price NUMERIC NOT NULL
);

-- Admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Promo codes table
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
  discount_value NUMERIC NOT NULL,
  min_cart_total NUMERIC DEFAULT 0,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Homepage banners table
CREATE TABLE homepage_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.2 Authentication Flow

**User Authentication**:
- Uses Supabase Auth with email/password
- JWT tokens stored in browser storage
- Automatic token refresh handled by Supabase client

**Admin Authentication**:
- Separate authentication system using `admin_users` table
- Password hashing with bcrypt
- Session management through React Context

```typescript
// User auth state management
const { data: { session } } = await supabase.auth.getSession();

supabase.auth.onAuthStateChange((event, session) => {
  setSession(session);
  setUser(session?.user ?? null);
});

// Admin auth implementation
const adminLogin = async (email: string, password: string) => {
  const { data: admin } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single();
  
  // Verify password hash
  const isValid = await bcrypt.compare(password, admin.password_hash);
  return isValid ? admin : null;
};
```

### 4.3 Row-Level Security (RLS)

**Security Policies**:

```sql
-- Enable RLS on sensitive tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Orders policy: users can only see their own orders
CREATE POLICY "Users can view their own orders" 
ON orders FOR SELECT 
USING (customer_email = auth.email());

-- Admin access policy
CREATE POLICY "Admins can view all orders" 
ON orders FOR ALL 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE email = auth.email()
));

-- Public read policies for products
CREATE POLICY "Products are publicly readable" 
ON products FOR SELECT 
USING (is_active = true);

-- Admin-only write policies
CREATE POLICY "Only admins can modify products" 
ON products FOR ALL 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE email = auth.email()
));
```

### 4.4 Edge Functions & Database Functions

**Custom Database Functions**:

```sql
-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate order number function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'BAKWAS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
         LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0');
END;
$$ LANGUAGE plpgsql;
```

### 4.5 Storage & File Management

**Storage Buckets**:
- `products`: Product images with public access
- `banners`: Homepage banner images
- `uploads`: General file uploads with authentication

**Image Upload Implementation**:
```typescript
// Upload product images
const uploadProductImage = async (file: File, productId: string) => {
  const fileName = `${productId}/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('products')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(fileName);
    
  return publicUrl;
};
```

---

## 5. Real-Time Features

### Real-Time Subscriptions

**Product Updates**:
```typescript
// Subscribe to product changes for admin dashboard
const productSubscription = supabase
  .channel('admin-products')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'products'
  }, (payload) => {
    // Update product list in real-time
    setProducts(prevProducts => {
      switch (payload.eventType) {
        case 'INSERT':
          return [...prevProducts, payload.new];
        case 'UPDATE':
          return prevProducts.map(p => 
            p.id === payload.new.id ? payload.new : p
          );
        case 'DELETE':
          return prevProducts.filter(p => p.id !== payload.old.id);
        default:
          return prevProducts;
      }
    });
  })
  .subscribe();
```

**Order Status Updates**:
```typescript
// Real-time order updates for admin
const orderSubscription = supabase
  .channel('admin-orders')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'orders'
  }, (payload) => {
    // Notify admin of order status changes
    toast.success(`Order ${payload.new.order_number} status updated to ${payload.new.status}`);
  })
  .subscribe();
```

---

## 6. Error Handling & Logging

### Client-Side Error Handling

```typescript
// Global error handler for Supabase operations
const handleSupabaseError = (error: any) => {
  console.error('Supabase Error:', error);
  
  switch (error.code) {
    case 'PGRST301':
      toast.error('Resource not found');
      break;
    case '23505':
      toast.error('This item already exists');
      break;
    default:
      toast.error('An unexpected error occurred');
  }
};

// Example usage in data fetching
const fetchProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
};
```

### Logging Strategy

**Frontend Logging**:
- Console logs for development debugging
- Error tracking with detailed context
- User action tracking for analytics

**Backend Logging**:
- Supabase automatic query logging
- Custom event logging for business logic
- Performance monitoring for slow queries

---

## 7. Environment & Configuration

### Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://yzibxyahovaxhgtxesxl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
VITE_APP_NAME=BAKWAS
VITE_APP_URL=https://bakwas.lovable.app

# External Services (Future)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### Build Configuration

**Vite Configuration**:
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
});
```

**Deployment Pipeline**:
1. Code push triggers Lovable build
2. Automatic TypeScript compilation and testing
3. Static asset optimization and CDN deployment
4. Environment-specific configuration injection
5. Health checks and rollback capability

---

## 8. Performance Optimization

### Frontend Optimization
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: WebP format with fallbacks
- **Caching**: TanStack Query with stale-while-revalidate
- **Bundle Analysis**: Regular monitoring of bundle size

### Database Optimization
- **Indexing**: Strategic indexes on frequently queried columns
- **Query Optimization**: Efficient joins and filtered queries
- **Connection Pooling**: Supabase manages database connections
- **Real-time Optimization**: Selective subscriptions to reduce overhead

### Caching Strategy
```typescript
// TanStack Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error.status === 404) return false;
        return failureCount < 3;
      }
    }
  }
});
```

---

## 9. Security Considerations

### Data Protection
- **RLS Policies**: Comprehensive row-level security
- **Input Validation**: Zod schemas for all user inputs
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: Sanitized user-generated content

### Authentication Security
- **JWT Security**: Short-lived tokens with refresh mechanism
- **Password Requirements**: Strong password enforcement
- **Session Management**: Secure session storage and cleanup
- **Admin Access**: Separate authentication system with elevated privileges

### API Security
- **Rate Limiting**: Supabase built-in rate limiting
- **CORS Configuration**: Restricted origins for API access
- **API Key Management**: Environment-based key rotation
- **Audit Logging**: Comprehensive logging of admin actions

---

> _Document last updated: 2025-01-27_  
> _Project: BAKWAS E-Commerce Platform_  
> _Framework: React 18 + TypeScript + Supabase_  
> _Deployment: Lovable Platform_
