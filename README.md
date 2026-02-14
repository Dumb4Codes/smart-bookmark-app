# Smart Bookmark App

A modern, production-ready bookmark management application with real-time sync, built with Next.js, Supabase, and Tailwind CSS.

## Features

- ✅ **Google OAuth Authentication** - Secure sign-in with Google
- ✅ **Real-time Sync** - Changes sync instantly across browser tabs
- ✅ **Private Bookmarks** - Each user sees only their own bookmarks
- ✅ **Optimistic UI Updates** - Instant feedback for all actions
- ✅ **URL Validation** - Ensures proper URL format
- ✅ **Copy to Clipboard** - Quick URL copying
- ✅ **Responsive Design** - Works on all devices
- ✅ **Toast Notifications** - User-friendly success/error messages
- ✅ **Row Level Security** - Database-level security

## Tech Stack

- **Next.js 15** (App Router)
- **Supabase** (Auth, Database, Realtime)
- **TypeScript**
- **Tailwind CSS**
- **Vercel** (Deployment)

## Getting Started

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Google Cloud account (for OAuth)
- A Vercel account (for deployment)

### 2. Supabase Setup

#### Create Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and create

#### Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query and paste:

```sql
-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);
```

3. Click "Run"
4. Create another query for RLS policies:

```sql
-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert own bookmarks
CREATE POLICY "Users can insert own bookmarks"
ON bookmarks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view own bookmarks
CREATE POLICY "Users can view own bookmarks"
ON bookmarks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can delete own bookmarks
CREATE POLICY "Users can delete own bookmarks"
ON bookmarks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

5. Click "Run"

#### Enable Realtime

1. Go to **Database** > **Replication**
2. Find the `bookmarks` table
3. Toggle replication ON

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API":
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://YOUR-VERCEL-URL.vercel.app`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/callback`
     - `https://YOUR-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
     - `https://YOUR-VERCEL-URL.vercel.app/auth/callback`
5. Copy your **Client ID** and **Client Secret**

### 4. Configure Supabase Auth

1. In Supabase, go to **Authentication** > **Providers**
2. Find "Google" and enable it
3. Paste your Client ID and Client Secret
4. Click "Save"
5. Go to **Authentication** > **URL Configuration**
6. Set **Site URL**: `http://localhost:3000`
7. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR-VERCEL-URL.vercel.app/auth/callback`

### 5. Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Run development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### 6. Deploy to Vercel

1. Push code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR-GITHUB-REPO-URL
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (use your Vercel URL)
6. Click "Deploy"

### 7. Update OAuth URLs

After deployment:

1. Update Google OAuth:
   - Add Vercel URL to Authorized JavaScript origins
   - Add `https://YOUR-APP.vercel.app/auth/callback` to redirect URIs

2. Update Supabase Auth:
   - Update Site URL to your Vercel URL
   - Add Vercel callback URL to redirect URLs

## Project Structure

```
smart-bookmark-app/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard (protected)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts        # OAuth callback
│   └── globals.css             # Global styles
├── components/
│   ├── BookmarkCard.tsx        # Bookmark card UI
│   ├── BookmarkList.tsx        # List with realtime
│   ├── AddBookmarkForm.tsx     # Add bookmark form
│   ├── AuthButton.tsx          # Auth button
│   └── Toast.tsx               # Notifications
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   └── server.ts           # Server client
│   └── types.ts                # TypeScript types
├── hooks/
│   ├── useBookmarks.ts         # Realtime hook
│   └── useToast.ts             # Toast hook
└── middleware.ts               # Auth middleware
```

## Security

- **Row Level Security (RLS)** - Database-level protection
- **Private bookmarks** - Users can only access their own data
- **Secure authentication** - Google OAuth via Supabase
- **HTTPS enforced** - In production via Vercel

## Performance

- **Server Components** - Reduced client-side JS
- **Optimistic Updates** - Instant UI feedback
- **Realtime subscriptions** - Efficient WebSocket connections
- **Static generation** - Fast initial page loads

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
