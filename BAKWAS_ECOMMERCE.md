
# BAKWAS E-Commerce Platform

> A modern streetwear e-commerce platform specializing in psychedelic designs and oversized fits, built for Delhi's street culture with limited drops and no restocks.

---

## Table of Contents

1. Project Overview  
2. Goals & Success Metrics  
3. Tech Stack  
4. Architecture Diagram  
5. Folder & File Structure  
6. Core Features & User Flows  
7. Component Breakdown  
8. API & Data Layer  
9. Authentication & Authorization  
10. State Management  
11. Environment & Configuration  
12. Setup & Installation  
13. Running & Deployment  
14. Testing & QA  
15. Cursor-Specific Instructions  
16. Roadmap & Next Steps  
17. Contributing  
18. License  

---

## 1. Project Overview

BAKWAS is a premium streetwear e-commerce platform that combines psychedelic aesthetics with street culture. The platform focuses on limited edition drops with no restocks, creating exclusivity and urgency for customers.

**Target Users:**
- Street fashion enthusiasts aged 18-35
- Customers seeking unique, oversized streetwear
- Fashion-forward individuals interested in psychedelic designs
- Urban culture participants looking for exclusive pieces

**Problem Solved:**
- Provides a curated platform for exclusive streetwear drops
- Eliminates the mass-market approach with limited, unique collections
- Offers an immersive shopping experience with trippy, engaging UI

## 2. Goals & Success Metrics

**Primary Objectives:**
- Enable users to discover and purchase limited streetwear in under 3 minutes
- Create an engaging, psychedelic shopping experience that reflects brand identity
- Build customer loyalty through exclusive drops and no-restock policy
- Establish a strong brand presence in Delhi's street fashion scene

**Key Performance Indicators:**
- Conversion rate: Target 3-5%
- Average order value: ₹1,500+
- Customer retention rate: 40%+
- Page load speed: <2 seconds
- Mobile responsiveness: 100% functional on all devices

## 3. Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS for styling
- Framer Motion for animations
- shadcn/ui component library
- Radix UI primitives

**Backend & Database:**
- Supabase (PostgreSQL database)
- Supabase Auth for authentication
- Supabase Storage for file management
- Row Level Security (RLS) policies

**State Management:**
- React Context API
- TanStack Query for server state
- Local storage for cart persistence

**Routing & Navigation:**
- React Router v6

**Third-party Services:**
- Supabase (full backend solution)
- Lucide React (icons)
- Recharts (analytics charts)

**Deployment:**
- Lovable platform hosting
- Supabase cloud backend

## 4. Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│   Supabase API  │◄──►│  PostgreSQL DB  │
│                 │    │                 │    │                 │
│ - Components    │    │ - Auth          │    │ - Products      │
│ - Context       │    │ - Database      │    │ - Orders        │
│ - Hooks         │    │ - Storage       │    │ - Users         │
│ - Pages         │    │ - RLS Policies  │    │ - Categories    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └─────────────►│ Supabase Storage│
                        │                 │
                        │ - Product Images│
                        │ - User Avatars  │
                        │ - Blog Assets   │
                        └─────────────────┘
```

## 5. Folder & File Structure

```
/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui base components
│   │   ├── admin/          # Admin panel components
│   │   ├── checkout/       # Checkout flow components
│   │   ├── shop/           # Shop-specific components
│   │   ├── Hero.tsx        # Homepage hero section
│   │   ├── Header.tsx      # Navigation header
│   │   ├── Footer.tsx      # Site footer
│   │   └── USPSection.tsx  # Unique selling points
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   ├── WishlistContext.tsx
│   │   └── AdminAuthContext.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useHomepageData.ts
│   │   ├── useImageUpload.ts
│   │   └── useBannerForm.ts
│   ├── integrations/       # External service integrations
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── pages/              # Route components
│   │   ├── Index.tsx       # Homepage
│   │   ├── Shop.tsx        # Product catalog
│   │   ├── Cart.tsx        # Shopping cart
│   │   ├── Checkout.tsx    # Checkout process
│   │   ├── Admin*.tsx      # Admin pages
│   │   └── [other pages]
│   ├── schemas/            # Zod validation schemas
│   ├── lib/                # Utility functions
│   └── main.tsx           # App entry point
├── public/                 # Static assets
│   └── lovable-uploads/   # User-uploaded images
├── supabase/              # Supabase configuration
│   └── config.toml
├── tailwind.config.ts     # Tailwind CSS configuration
├── vite.config.ts         # Vite build configuration
├── package.json
└── README.md
```

**Key Directories:**
- `/src/components`: Modular, reusable React components
- `/src/pages`: Top-level route components
- `/src/contexts`: Global state management via React Context
- `/src/hooks`: Custom React hooks for data fetching and state
- `/public/lovable-uploads`: User-uploaded images and assets

## 6. Core Features & User Flows

### **Product Discovery & Shopping**
1. User lands on homepage with hero banner and USP section
2. Browse products via Shop page with filtering options
3. View product details in quick-view modal or dedicated page
4. Add items to cart with size/color selection
5. Proceed to checkout with guest or authenticated flow
6. Complete purchase with address and payment information

**Screens:** Homepage, Shop, Product Quick View, Cart, Checkout

### **User Account Management**
1. User registration with email/password
2. Email verification and profile creation
3. Login with session persistence
4. Account dashboard with order history
5. Profile updates and preferences

**Screens:** Login, Signup, My Account, Order History

### **Admin Content Management**
1. Admin login with separate authentication
2. Product management (add, edit, delete, featured products)
3. Homepage banner management
4. Order processing and status updates
5. Blog content management
6. Promo code creation and management

**Screens:** Admin Dashboard, Products, Orders, Homepage, Blog, Promo Codes

### **Customer Support**
1. FAQ browsing with search functionality
2. Contact form submission
3. Return request with photo uploads
4. Help center navigation

**Screens:** FAQs, Contact, Help, Return Request

## 7. Component Breakdown

### **Layout Components**
- **GlobalLayout**: Main layout wrapper with background theming
- **Header**: Navigation with cart count, search, user menu
- **Footer**: Site links, social media, company information
- **Breadcrumbs**: Navigation breadcrumb trail

### **Homepage Components**
- **Hero**: Hero banner with logo, CTA buttons, background image
- **USPSection**: Three-column unique selling points with icons
- **ProductGrid**: Featured products display with filtering

### **Shop Components**
- **FilterSidebar**: Product filtering by category, price, color, size
- **ProductGrid**: Grid layout of product cards with pagination
- **QuickViewModal**: Product quick view with image carousel
- **ImageCarousel**: Multi-image product display

### **Admin Components**
- **AdminLayout**: Admin panel layout with sidebar navigation
- **ProductForm**: Product creation and editing form
- **BannerForm**: Homepage banner management
- **ImageUpload**: Single and multi-image upload components
- **ProductCard**: Admin product card with actions

### **Checkout Components**
- **CheckoutForm**: Multi-step checkout with validation
- **OrderSummary**: Order totals and item breakdown
- **PromoCode**: Promo code application and validation
- **ProgressBar**: Checkout step indicator

### **UI Components (shadcn/ui)**
- **Button**: Various button styles and sizes
- **Card**: Content containers with borders and shadows
- **Dialog/Modal**: Overlay components for forms and content
- **Form**: Form components with validation
- **Input**: Text inputs with various types
- **Select**: Dropdown selection components
- **Sheet**: Slide-out panels for mobile

## 8. API & Data Layer

### **Supabase Tables & Schema**

**Products Table:**
```sql
- id: uuid (primary key)
- name: text
- description: text
- price: numeric
- images: text[] (array of image URLs)
- category_ids: uuid[] (array of category references)
- tags: text[]
- color: text
- stock_quantity: integer
- is_active: boolean
- is_featured: boolean
- slug: text (unique)
- created_at: timestamp
- updated_at: timestamp
```

**Categories Table:**
```sql
- id: uuid (primary key)
- name: text
- slug: text (unique)
- description: text
- created_at: timestamp
```

**Orders Table:**
```sql
- id: uuid (primary key)
- order_number: text (unique)
- customer_name: text
- customer_email: text
- customer_phone: text
- shipping_address: jsonb
- subtotal: numeric
- shipping_cost: numeric
- discount_amount: numeric
- total_amount: numeric
- status: text ('pending', 'confirmed', 'shipped', 'delivered')
- payment_status: text ('pending', 'paid', 'failed')
- created_at: timestamp
- updated_at: timestamp
```

**Order Items Table:**
```sql
- id: uuid (primary key)
- order_id: uuid (foreign key)
- product_id: uuid (foreign key)
- product_name: text
- product_image: text
- unit_price: numeric
- quantity: integer
- total_price: numeric
```

**Other Tables:**
- `admin_users`: Admin authentication
- `blog_posts`: Blog content management
- `faqs`: Frequently asked questions
- `homepage_banners`: Homepage banner content
- `promo_codes`: Discount codes
- `returns`: Return requests
- `profiles`: User profiles
- `site_pages`: Static page content

### **Data Access Patterns**
- **Products**: Fetch with pagination, filtering, and search
- **Orders**: User-specific queries with RLS policies
- **Real-time**: Cart updates, order status changes
- **Caching**: TanStack Query for server state caching

## 9. Authentication & Authorization

### **User Authentication**
- **Email/Password**: Supabase Auth with email verification
- **Session Management**: JWT tokens with automatic refresh
- **Password Reset**: Email-based password recovery

### **Admin Authentication**
- **Separate Admin System**: Custom admin_users table
- **Role-based Access**: Admin-only routes and components
- **Session Persistence**: Admin session management

### **Authorization Rules**
- **Row Level Security (RLS)**: Database-level access control
- **User Data Isolation**: Users can only access their own orders/data
- **Admin Privileges**: Full access to products, orders, content
- **Public Data**: Products, categories, blog posts readable by all

## 10. State Management

### **Global State (React Context)**
- **AuthContext**: User authentication state
- **CartContext**: Shopping cart items and totals
- **WishlistContext**: Saved products for later
- **AdminAuthContext**: Admin authentication state

### **Server State (TanStack Query)**
- **Product Data**: Cached product listings and details
- **Order History**: User order data with background refetch
- **Admin Data**: Dashboard metrics and management data

### **Local State**
- **Form State**: React Hook Form for form management
- **UI State**: Modal visibility, loading states, filters
- **Preferences**: Theme, language, recent searches

## 11. Environment & Configuration

### **Required Environment Variables**
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://yzibxyahovaxhgtxesxl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
VITE_APP_URL=http://localhost:5173
VITE_API_URL=https://api.bakwas.com
```

### **Build Configuration**
- **Vite Config**: TypeScript, React, Tailwind CSS setup
- **Tailwind Config**: Custom colors, fonts, animations
- **ESLint Config**: Code quality and consistency rules

## 12. Setup & Installation

### **Prerequisites**
- Node.js 18+ and npm
- Git
- Supabase account (if setting up backend)

### **Step-by-step Setup**
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bakwas-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Fill in Supabase credentials and other required values
   ```

4. **Database setup**
   - Create Supabase project
   - Run database migrations from `/supabase` folder
   - Set up RLS policies

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Admin panel: http://localhost:5173/admin

## 13. Running & Deployment

### **Local Development**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### **Production Deployment**
- **Platform**: Lovable hosting platform
- **Build Process**: Automated via Lovable interface
- **Environment**: Production environment variables configured in Lovable
- **Database**: Supabase cloud with production configuration

### **CI/CD Pipeline**
- **Source Control**: GitHub integration with Lovable
- **Automated Builds**: Triggered on code changes
- **Environment Promotion**: Staging → Production workflow

## 14. Testing & QA

### **Testing Framework**
- **Unit Tests**: Not currently implemented (recommended: Vitest)
- **Component Tests**: Not currently implemented (recommended: React Testing Library)
- **E2E Tests**: Not currently implemented (recommended: Playwright)

### **Code Quality**
- **ESLint**: Configured with React and TypeScript rules
- **TypeScript**: Strict type checking enabled
- **Prettier**: Code formatting (recommended to add)

### **Manual Testing Checklist**
- [ ] User registration and login flow
- [ ] Product browsing and filtering
- [ ] Shopping cart functionality
- [ ] Checkout process
- [ ] Admin panel operations
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## 15. Cursor-Specific Instructions

### **Project Setup in Cursor**
1. **Import Project**: Open the project folder in Cursor
2. **Environment Configuration**: Set up .env file with Supabase credentials
3. **Extension Recommendations**:
   - TypeScript and JavaScript Language Features
   - Tailwind CSS IntelliSense
   - ES7+ React/Redux/React-Native snippets

### **Cursor-Specific Files**
- Place this documentation in project root as `BAKWAS_ECOMMERCE.md`
- Configure Cursor settings for TypeScript and React development
- Set up code formatting and linting integration

### **Development Workflow**
- Use Cursor's AI assistance for component generation
- Leverage TypeScript IntelliSense for Supabase types
- Utilize Tailwind CSS autocomplete for styling

### **Code Conventions**
- **Components**: PascalCase, functional components with TypeScript
- **Files**: Use descriptive names matching component names
- **Imports**: Organize with absolute imports using @ alias
- **Styling**: Tailwind CSS classes, custom utilities in tailwind.config.ts

## 16. Roadmap & Next Steps

### **Short-term (1-3 months)**
- [ ] Add unit and integration tests
- [ ] Implement product reviews and ratings
- [ ] Add wishlist sharing functionality
- [ ] Enhance mobile app-like experience (PWA)
- [ ] Add product recommendations

### **Medium-term (3-6 months)**
- [ ] Implement inventory management
- [ ] Add multi-currency support
- [ ] Create customer loyalty program
- [ ] Add social media integration
- [ ] Implement advanced search with filters

### **Long-term (6+ months)**
- [ ] Mobile app development (React Native)
- [ ] International shipping integration
- [ ] AI-powered style recommendations
- [ ] Augmented reality try-on features
- [ ] Marketplace for independent designers

### **Technical Debt**
- Add comprehensive error boundaries
- Implement proper loading states throughout
- Add accessibility (a11y) improvements
- Optimize images and implement lazy loading
- Add comprehensive monitoring and analytics

## 17. Contributing

### **Development Workflow**
1. **Fork and Clone**: Create personal fork of the repository
2. **Branch Strategy**: Create feature branches from main
3. **Commits**: Use conventional commit messages
4. **Pull Requests**: Submit PRs with clear descriptions

### **Coding Standards**
- **TypeScript**: Strict mode enabled, no any types
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes, no custom CSS
- **File Organization**: Component per file, logical folder structure

### **Code Review Checklist**
- [ ] TypeScript compilation without errors
- [ ] Component props properly typed
- [ ] Responsive design implemented
- [ ] Accessibility considerations addressed
- [ ] Performance optimizations applied
- [ ] Error handling implemented

## 18. License

This project is proprietary software owned by BAKWAS Clothing Co. All rights reserved.

**Restrictions:**
- No distribution or modification without written permission
- Commercial use restricted to authorized parties only
- Source code confidentiality must be maintained

---

> _Document last updated: 2025-01-25_

**Contact Information:**
- Project Lead: [Contact details]
- Technical Lead: [Contact details]
- Repository: [GitHub URL]
- Production URL: [Live site URL]
