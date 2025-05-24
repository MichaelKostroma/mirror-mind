-- Create the decisions table
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  situation TEXT NOT NULL,
  decision TEXT NOT NULL,
  reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analysis_status TEXT NOT NULL DEFAULT 'pending',
  analysis_category TEXT,
  cognitive_biases TEXT[],
  missed_alternatives TEXT[],
  analysis_summary TEXT
);

-- Create an index on user_id for faster queries
CREATE INDEX decisions_user_id_idx ON decisions(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to only see their own decisions
CREATE POLICY "Users can only view their own decisions"
  ON decisions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create a policy that allows users to only insert their own decisions
CREATE POLICY "Users can only insert their own decisions"
  ON decisions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to only update their own decisions
CREATE POLICY "Users can only update their own decisions"
  ON decisions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create a policy that allows users to only delete their own decisions
CREATE POLICY "Users can only delete their own decisions"
  ON decisions
  FOR DELETE
  USING (auth.uid() = user_id);
