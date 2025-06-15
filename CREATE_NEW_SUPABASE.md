# 🆕 Create New Supabase Project (If Current One is Inaccessible)

## Step 1: Create New Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization and fill in:
   - **Name**: BAKWAS Ecommerce
   - **Database Password**: [Choose strong password]
   - **Region**: Select closest to your location

## Step 2: Get New Credentials
1. Wait for project creation (2-3 minutes)
2. Go to **Settings** → **API**
3. Copy:
   - **Project URL** (will be different from current one)
   - **anon/public key**

## Step 3: Update Your Code
Update `src/integrations/supabase/client.ts`:

```typescript
const SUPABASE_URL = "YOUR_NEW_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_NEW_ANON_KEY";
```

## Step 4: Set Up Database
Run the SQL commands from `fix_supabase_performance.sql` to create tables and sample data.

## Step 5: Test Connection
Restart your dev server and check if the errors are gone. 