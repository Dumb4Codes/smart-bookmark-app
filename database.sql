-- =====================================================
-- Smart Bookmark App - Complete Database Setup
-- =====================================================
-- Run these scripts in order in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Create bookmarks table
-- =====================================================

CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: Create indexes for performance
-- =====================================================

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- =====================================================
-- STEP 3: Enable Row Level Security
-- =====================================================

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: Create RLS Policies
-- =====================================================

-- Policy: Users can only INSERT their own bookmarks
CREATE POLICY "Users can insert own bookmarks"
ON bookmarks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only SELECT (view) their own bookmarks
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

-- =====================================================
-- VERIFICATION QUERIES (optional)
-- =====================================================

-- Check if table was created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'bookmarks';

-- Check if indexes were created
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'bookmarks';

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'bookmarks';

-- Check policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'bookmarks';

-- =====================================================
-- REALTIME SETUP
-- =====================================================
-- Go to Database > Replication in Supabase Dashboard
-- Enable replication for the 'bookmarks' table
-- This cannot be done via SQL, must be done in UI
-- =====================================================

-- =====================================================
-- CLEANUP (if you need to start over)
-- =====================================================

-- Uncomment these lines to drop everything and start fresh
-- WARNING: This will delete all bookmarks data!

-- DROP POLICY IF EXISTS "Users can insert own bookmarks" ON bookmarks;
-- DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
-- DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;
-- DROP TABLE IF EXISTS bookmarks CASCADE;
