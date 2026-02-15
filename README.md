# Smart Bookmark App

A modern, production-ready bookmark management application with real-time synchronization across devices, built with Next.js 16, Supabase, and Tailwind CSS.

![Smart Bookmark App](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Supabase](https://img.shields.io/badge/Supabase-Realtime-green) ![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure sign-in with Google
- ⚡ **Real-time Sync** - Changes sync instantly across all open tabs and devices
- 🔒 **Private & Secure** - Each user sees only their own bookmarks with Row Level Security
- 🔄 **Auth State Sync** - Sign out in one tab, all tabs redirect automatically
- ✅ **URL Validation** - Ensures proper URL format before saving
- 📋 **Copy to Clipboard** - Quick URL copying with visual feedback
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- 🎨 **Dark Mode Support** - Input fields remain readable in both light and dark modes
- 🔔 **Toast Notifications** - User-friendly success/error messages
- 🛡️ **Row Level Security** - Database-level security for complete data isolation
- 🎯 **Clean UI/UX** - Minimal, modern design with smooth animations

## 🚀 Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Authentication, Realtime)
- **Deployment:** Vercel
- **Authentication:** Google OAuth via Supabase Auth
- **Real-time:** Supabase Realtime (WebSocket subscriptions)

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A [Supabase](https://supabase.com) account
- A [Google Cloud](https://console.cloud.google.com) account (for OAuth)
- A [Vercel](https://vercel.com) account (for deployment)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Dumb4Codes/smart-bookmark-app.git
cd smart-bookmark-app
npm install
```

### 2. Supabase Setup

#### Create a New Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and create

#### Set Up Database Schema

In Supabase Dashboard → **SQL Editor**, create a new query and run:
```sql
-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);
```

#### Enable Row Level Security

Create another query and run:
```sql
-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only INSERT their own bookmarks
CREATE POLICY "Users can insert own bookmarks"
ON bookmarks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only SELECT their own bookmarks
CREATE POLICY "Users can view own bookmarks"
ON bookmarks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can only DELETE their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
ON bookmarks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

#### Enable Realtime

1. Go to **Database** → **Publications** (under Configuration)
2. Click on `supabase_realtime`
3. Make sure `bookmarks` table is included
4. If not, add it manually

#### Get API Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Google OAuth Setup

#### Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**:
   - APIs & Services → Library
   - Search "Google+ API" → Enable
4. Create OAuth credentials:
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Application type: **Web application**
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://your-app.vercel.app`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/callback`
     - `https://your-supabase-project.supabase.co/auth/v1/callback`
     - `https://your-app.vercel.app/auth/callback`
5. Copy **Client ID** and **Client Secret**

#### Configure Supabase Auth

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Google**
3. Paste your Client ID and Client Secret
4. Click "Save"
5. Go to **Authentication** → **URL Configuration**:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: Add both localhost and production URLs

### 4. Environment Variables

Create `.env.local` in the project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚢 Deployment to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Smart Bookmark App"
git branch -M main
git remote add origin https://github.com/Dumb4Codes/smart-bookmark-app.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add **Environment Variables**:
```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```
5. Click "Deploy"

### 3. Update OAuth Redirect URLs

After deployment, update:

**Google OAuth:**
- Add Vercel URL to Authorized JavaScript origins
- Add `https://your-app.vercel.app/auth/callback` to redirect URIs

**Supabase:**
- Update Site URL to your Vercel URL
- Add Vercel callback URL to redirect URLs

## 📁 Project Structure
```
smart-bookmark-app/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Landing page with Google sign-in
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard (protected route)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts        # OAuth callback handler
│   └── globals.css             # Global styles with dark mode fixes
├── components/
│   ├── AuthButton.tsx          # Google sign-in/out button
│   ├── AuthSync.tsx            # Auth state sync across tabs
│   ├── BookmarkCard.tsx        # Individual bookmark card UI
│   ├── BookmarkList.tsx        # Bookmark list container
│   ├── AddBookmarkForm.tsx     # Add bookmark form with validation
│   └── Toast.tsx               # Toast notification component
├── hooks/
│   ├── useBookmarks.ts         # Real-time bookmarks hook
│   └── useToast.ts             # Toast notifications hook
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server Supabase client
│   └── types.ts                # TypeScript type definitions
├── middleware.ts               # Auth middleware for route protection
├── .env.local                  # Environment variables (local)
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## 🎯 Key Features Explained

### Real-time Synchronization

The app uses Supabase Realtime to sync bookmarks across all open tabs:
- Add a bookmark in Tab 1 → Instantly appears in Tab 2
- Delete a bookmark in Tab 1 → Instantly disappears in Tab 2
- Works across different devices when logged in

### Auth State Management

Authentication state is synchronized across tabs:
- Sign out in one tab → All other tabs redirect to home
- Prevents data exposure after logout
- Uses Supabase's `onAuthStateChange` listener

### Row Level Security (RLS)

Database-level security ensures:
- Users can only see their own bookmarks
- No data leakage between users
- Enforced at the PostgreSQL level

### Mobile Responsive Design

Fully responsive with Tailwind CSS:
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly buttons and inputs

## 🔧 Challenges & Solutions

During development, I encountered and solved several interesting challenges:

### 1. Dark Mode Input Text Visibility 🌗

**Problem:** When users had their browser/system in dark mode, input text appeared white on white background, making it invisible.

**Root Cause:** CSS `prefers-color-scheme: dark` was changing text color globally, affecting form inputs.

**Solution:** Added explicit CSS rules in `globals.css` to force dark text in input fields regardless of color scheme:
```css
input[type="text"],
input[type="url"],
input[type="email"],
input[type="password"],
textarea,
select {
  color: rgb(17, 24, 39) !important; /* gray-900 */
}
```

**Result:** Input fields remain readable in both light and dark modes.

---

### 2. Real-time Sync Working Only for DELETE, Not INSERT ⚡

**Problem:** Bookmarks deleted in one tab would instantly disappear in other tabs, but newly added bookmarks wouldn't appear without refresh.

**Root Cause:** The Supabase Realtime subscription wasn't filtering INSERT events by `user_id`, causing the events to be broadcast but not properly received by the client.

**Solution:** 
1. Moved user authentication check before setting up the subscription
2. Added explicit `filter: 'user_id=eq.${user.id}'` to the INSERT event listener
3. Separated INSERT and DELETE into individual `.on()` handlers

**Code:**
```typescript
// Get user ID first
const { data: { user } } = await supabase.auth.getUser();

// Then set up filtered subscription
channel = supabase
  .channel("bookmarks-changes")
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "bookmarks",
    filter: `user_id=eq.${user.id}`, // Critical filter
  }, handleInsert)
  .subscribe();
```

**Result:** Real-time sync now works perfectly for both INSERT and DELETE operations.

---

### 3. Auth State Not Syncing Across Tabs 🔐

**Problem:** When users signed out in one tab, other tabs remained logged in, potentially exposing private data.

**Solution:** Created an `AuthSync` component that listens for auth state changes across all tabs using Supabase's `onAuthStateChange` listener:
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || !session) {
    router.push('/')
    router.refresh()
  }
})
```

**Result:** Signing out in any tab now automatically redirects all other tabs to the home page.

---

### 4. TypeScript Type Errors with Supabase Payload 🔤

**Problem:** TypeScript errors when accessing `payload.old.id` in DELETE handlers:
```
Property 'id' does not exist on type '{} | Partial<Bookmark>'
```

**Solution:** Explicitly cast the payload types:
```typescript
const deletedId = (payload.old as Bookmark).id;
// or
const deletedBookmark = payload.old as Bookmark;
```

**Result:** Type safety maintained while eliminating compilation errors.

---

### 5. Mobile Responsiveness Issues 📱

**Problem:** On small screens:
- Email addresses in header would overflow
- Bookmark cards had poor layout
- Buttons were too close together

**Solution:** 
- Added responsive Tailwind classes: `sm:`, `md:`, `lg:` breakpoints
- Implemented `truncate` and `max-w-[]` for text overflow
- Changed layout from horizontal to vertical on mobile using `flex-col sm:flex-row`
- Adjusted padding/spacing: `p-4 sm:p-5`, `gap-2 sm:gap-4`

**Result:** Fully responsive design that works seamlessly on all device sizes.

---

### 6. Environment Variable Configuration 🔧

**Problem:** Confusion about having different URLs for local development vs production (localhost vs Vercel URL).

**Solution:** Clarified that:
- `.env.local` (local) uses `http://localhost:3000`
- Vercel environment variables (production) use production URL
- This is standard practice and both are needed

**Result:** Proper environment separation between development and production.

---

### 7. Supabase Publications for Realtime 📡

**Problem:** Realtime wasn't working even with correct code because the `bookmarks` table wasn't added to the `supabase_realtime` publication.

**Solution:** 
1. Navigate to Database → Publications in Supabase Dashboard
2. Click on `supabase_realtime`
3. Manually add the `bookmarks` table
4. Alternatively, run SQL: `ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;`

**Result:** Realtime subscriptions started working immediately.

---

These challenges taught me the importance of:
- Reading documentation carefully (especially Supabase Realtime filters)
- Testing across different browser states (dark mode, multiple tabs)
- Proper TypeScript typing for third-party libraries
- Mobile-first responsive design
- Environment-specific configurations

## 🔒 Security Features

- ✅ Google OAuth 2.0 authentication
- ✅ Row Level Security (RLS) policies
- ✅ HTTPS enforced in production
- ✅ Secure session management
- ✅ CSRF protection via Supabase
- ✅ Environment variables for sensitive data

## 🧪 Testing

### Local Testing

1. **Authentication Flow:**
   - Sign in with Google
   - Verify redirect to dashboard
   - Sign out and verify redirect to home

2. **Real-time Sync:**
   - Open two tabs
   - Add bookmark in Tab 1 → Check Tab 2
   - Delete bookmark in Tab 2 → Check Tab 1

3. **Responsive Design:**
   - Open DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Test on mobile (375px), tablet (768px), desktop (1920px)

### Production Testing

After deployment, repeat all tests on your Vercel URL.

## 🐛 Troubleshooting

### "redirect_uri_mismatch" Error

**Solution:** Verify all redirect URIs are added to Google OAuth:
- Local: `http://localhost:3000/auth/callback`
- Supabase: `https://your-project.supabase.co/auth/v1/callback`
- Production: `https://your-app.vercel.app/auth/callback`

### Real-time Not Working

**Solution:**
1. Check that `bookmarks` table is in `supabase_realtime` publication
2. Verify user is authenticated
3. Check browser console for errors

### Dark Mode Input Text Invisible

**Solution:** Already fixed in `globals.css` with:
```css
input[type="text"],
input[type="url"] {
  color: rgb(17, 24, 39) !important;
}
```

## 📈 Future Enhancements

Potential features to add:

- [ ] Search and filter bookmarks
- [ ] Tags/categories for organization
- [ ] Edit bookmark functionality
- [ ] Bookmark folders
- [ ] Import/Export bookmarks
- [ ] Browser extension
- [ ] Public sharing links
- [ ] AI-powered auto-tagging
- [ ] Analytics dashboard
- [ ] Bulk actions (delete multiple)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**  # ← Replace with your actual name
- GitHub: (https://github.com/Dumb4Codes)  
- LinkedIn: (https://www.linkedin.com/in/youvraj-singh) 
- Portfolio: (https://youvraj-resume.netlify.app)  

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vercel](https://vercel.com/) - Deployment platform

---

**Built with ❤️ using Next.js and Supabase**