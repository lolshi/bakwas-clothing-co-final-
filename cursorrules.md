
# Project Coding & Structure Rules

## 1. File & Folder Naming

- **Components**: PascalCase for filenames and directories, e.g., `Button.tsx`, `ProductCard/`
- **Pages**: PascalCase for React components, e.g., `Shop.tsx`, `AdminDashboard.tsx`
- **Hooks**: camelCase starting with "use", e.g., `useHomepageData.ts`, `useImageUpload.ts`
- **Utilities**: camelCase, e.g., `utils.ts`, `formatPrice.ts`
- **Types & Schemas**: camelCase, e.g., `checkoutSchema.ts`, `supabaseTypes.ts`
- **Config Files**: lowercase with dashes, e.g., `tailwind.config.ts`, `vite.config.ts`

## 2. Directory Structure

```
/src
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── admin/           # Admin panel specific components
│   ├── checkout/        # Checkout flow components
│   └── shop/            # Shop page components
├── pages/               # Route components (React Router)
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations (Supabase)
├── schemas/             # Zod validation schemas
├── lib/                 # Utility functions and helpers
├── types/               # TypeScript type definitions
└── main.tsx            # Application entry point
```

**Folder Purposes:**
- `components/`: Modular, reusable React components organized by feature
- `pages/`: Top-level route components that compose other components
- `contexts/`: Global state management via React Context API
- `hooks/`: Custom React hooks for data fetching and state logic
- `integrations/`: Third-party service configurations (Supabase client)
- `schemas/`: Zod schemas for form validation and type safety
- `lib/`: Pure utility functions and helper methods
- `types/`: TypeScript type definitions and interfaces

## 3. Component Templates

**React Component Boilerplate:**
```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  className?: string;
  children?: React.ReactNode;
}

const ComponentName = ({ className, children }: ComponentNameProps) => {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
};

export default ComponentName;
```

**Page Component Boilerplate:**
```typescript
import { useEffect } from "react";

const PageName = () => {
  useEffect(() => {
    document.body.classList.add('page-transition');
  }, []);

  return (
    <div className="min-h-screen text-foreground relative">
      {/* Page content */}
    </div>
  );
};

export default PageName;
```

## 4. Import Aliases

- `@/components` → `./src/components`
- `@/pages` → `./src/pages`
- `@/contexts` → `./src/contexts`
- `@/hooks` → `./src/hooks`
- `@/lib` → `./src/lib`
- `@/integrations` → `./src/integrations`
- `@/schemas` → `./src/schemas`
- `@/types` → `./src/types`

## 5. Styling Conventions

- **Primary Framework**: Tailwind CSS exclusively
- **Brand Colors**: Use custom neon color palette (`neon-cyan`, `neon-purple`, `neon-pink`, `neon-orange`)
- **Typography**: `font-anton` for headings, `font-space` for body text
- **Custom Classes**: Defined in `src/index.css` for psychedelic effects
- **Animations**: Use custom keyframes (`psychedelic-pulse`, `gradient-shift`, `float`)
- **Backgrounds**: Leverage custom background images (`bg-home`, `bg-shop`, `bg-general`)
- **No inline styles**: All styling through Tailwind utility classes
- **Dark Theme**: Default color scheme with CSS custom properties

## 6. State Management Conventions

- **Global State**: React Context API for cart, auth, wishlist, admin auth
- **Server State**: TanStack Query for data fetching and caching
- **Form State**: React Hook Form with Zod validation
- **Local State**: useState for component-specific state
- **State Naming**: Descriptive names (e.g., `isLoading`, `selectedProduct`, `cartItems`)

## 7. TypeScript Guidelines

- **Strict Mode**: Enabled with no `any` types allowed
- **Interface Naming**: PascalCase with descriptive names
- **Props Interfaces**: Always define props interfaces for components
- **Supabase Types**: Import from `@/integrations/supabase/types`
- **Optional Props**: Use `?` for optional properties
- **Generic Types**: Use meaningful type parameters

## 8. API & Data Layer Rules

- **Supabase Client**: Import from `@/integrations/supabase/client`
- **Query Keys**: Descriptive array format for TanStack Query
- **Error Handling**: Use toast notifications for user feedback
- **Loading States**: Implement consistent loading indicators
- **Caching**: Leverage TanStack Query cache invalidation
- **RLS Policies**: Database-level security for data access

## 9. Authentication Patterns

- **User Auth**: Supabase Auth with email/password
- **Admin Auth**: Separate admin_users table with custom logic
- **Session Management**: Context providers for auth state
- **Route Protection**: `ProtectedRoute` and `ProtectedAdminRoute` components
- **Token Handling**: Automatic refresh via Supabase client

## 10. Component Organization

- **Single Responsibility**: Each component has one clear purpose
- **Composition**: Prefer composition over inheritance
- **Props Interface**: Always define TypeScript interfaces
- **Default Props**: Use default parameters in function signature
- **Event Handlers**: Prefix with "handle" (e.g., `handleSubmit`)
- **Conditional Rendering**: Use logical operators and ternary expressions

## 11. Form Handling

- **Validation**: Zod schemas for all forms
- **React Hook Form**: Standard form library
- **Error Display**: Consistent error message styling
- **Loading States**: Disable buttons during submission
- **Success Feedback**: Toast notifications for successful actions

## 12. Performance Guidelines

- **Lazy Loading**: Use React.lazy for code splitting on routes
- **Image Optimization**: Proper alt tags and responsive images
- **Bundle Size**: Monitor and optimize import statements
- **Memoization**: Use React.memo for expensive components
- **Query Optimization**: Efficient data fetching patterns

## 13. Accessibility Standards

- **Semantic HTML**: Use proper HTML elements
- **ARIA Labels**: Add labels for interactive elements
- **Keyboard Navigation**: Ensure full keyboard accessibility
- **Color Contrast**: Maintain WCAG AA compliance
- **Screen Readers**: Test with screen reader software

## 14. Security Practices

- **Environment Variables**: Use VITE_ prefix for client-side vars
- **API Keys**: Never expose sensitive keys in client code
- **Input Validation**: Validate all user inputs
- **XSS Prevention**: Sanitize user-generated content
- **CSRF Protection**: Implement proper token handling

## 15. Testing Guidelines

- **File Naming**: `.test.tsx` or `.spec.tsx` suffix
- **Test Location**: Co-locate tests with components
- **Testing Library**: React Testing Library for component tests
- **Mocking**: Mock external dependencies and API calls
- **Coverage**: Aim for meaningful test coverage

## 16. Code Quality Standards

- **ESLint**: Follow configured rules in `eslint.config.js`
- **TypeScript**: No unused variables (disabled in config for development)
- **Formatting**: Consistent code formatting
- **Comments**: JSDoc for complex functions
- **Naming**: Descriptive and consistent naming conventions

## 17. Git & Version Control

- **Commit Messages**: Use conventional commit format
- **Branch Naming**: `feature/description` or `fix/description`
- **Pull Requests**: Include description and testing notes
- **Code Reviews**: Required before merging to main
- **Merge Strategy**: Squash and merge for clean history

## 18. Deployment & Build

- **Build Tool**: Vite for fast development and optimized builds
- **Environment**: Different configs for dev/staging/production
- **Static Assets**: Store in `/public` directory
- **Optimization**: Tree shaking and code splitting enabled
- **Performance**: Monitor bundle size and loading times

## 19. Error Handling

- **Boundary Components**: React Error Boundaries for error catching
- **User Feedback**: Toast notifications for errors
- **Logging**: Console logs for development debugging
- **Graceful Degradation**: Fallback UI for failed states
- **Network Errors**: Retry mechanisms for failed requests

## 20. Documentation Standards

- **README**: Keep updated with setup instructions
- **Comments**: Explain complex business logic
- **Type Definitions**: Document interfaces and types
- **API Documentation**: Document custom hooks and utilities
- **Change Log**: Track significant changes and updates

---

> _Document last updated: 2025-01-25_

**Project**: BAKWAS E-Commerce Platform  
**Framework**: React 18 + TypeScript + Vite  
**Styling**: Tailwind CSS with custom brand theme  
**Backend**: Supabase (PostgreSQL + Auth + Storage)  
**State**: React Context + TanStack Query  
**Deployment**: Lovable Platform  