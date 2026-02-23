-- Supabase SQL Schema for Math Worksheet Generator
-- Run this in the Supabase SQL Editor

-- Kids table: each parent can register multiple kids
CREATE TABLE IF NOT EXISTS kids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- History table: records of each practice session
CREATE TABLE IF NOT EXISTS history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  grade TEXT NOT NULL,
  type_id TEXT NOT NULL,
  type_name TEXT NOT NULL,
  difficulty INT NOT NULL,
  duration_seconds INT NOT NULL DEFAULT 0,
  correct INT NOT NULL DEFAULT 0,
  incorrect INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  accuracy INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own data
CREATE POLICY "Users can view own kids"
  ON kids FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Users can insert own kids"
  ON kids FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Users can delete own kids"
  ON kids FOR DELETE
  USING (auth.uid() = parent_id);

CREATE POLICY "Users can view own history"
  ON history FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Users can insert own history"
  ON history FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kids_parent_id ON kids(parent_id);
CREATE INDEX IF NOT EXISTS idx_history_kid_id ON history(kid_id);
CREATE INDEX IF NOT EXISTS idx_history_parent_id ON history(parent_id);
