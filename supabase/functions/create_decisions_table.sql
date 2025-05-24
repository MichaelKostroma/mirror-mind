-- This is a stored procedure that will be used to create the decisions table
-- You'll need to run this in the Supabase SQL Editor first
CREATE OR REPLACE FUNCTION create_decisions_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the decisions table if it doesn't exist
  CREATE TABLE IF NOT EXISTS decisions (
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
  CREATE INDEX IF NOT EXISTS decisions_user_id_idx ON decisions(user_id);
  
  -- Set up Row Level Security (RLS)
  ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
  
  -- Create policies if they don't exist
  -- Check if the policy exists first to avoid errors
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'decisions' AND policyname = 'Users can only view their own decisions'
  ) THEN
    CREATE POLICY "Users can only view their own decisions"
      ON decisions
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'decisions' AND policyname = 'Users can only insert their own decisions'
  ) THEN
    CREATE POLICY "Users can only insert their own decisions"
      ON decisions
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'decisions' AND policyname = 'Users can only update their own decisions'
  ) THEN
    CREATE POLICY "Users can only update their own decisions"
      ON decisions
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'decisions' AND policyname = 'Users can only delete their own decisions'
  ) THEN
    CREATE POLICY "Users can only delete their own decisions"
      ON decisions
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END;
$$;

-- Helper function to execute arbitrary SQL
-- This is used as a fallback if the create_decisions_table function doesn't exist
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;
