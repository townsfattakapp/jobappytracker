-- Add New Tables for Extensible Career System
-- Phase 1.1: Career Paths Table

CREATE TABLE IF NOT EXISTS career_paths (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  family TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  languages TEXT[],
  roles TEXT[],
  tracks JSONB, -- {trackId, priority, note?}[],
  source TEXT DEFAULT 'builtin',
  status TEXT DEFAULT 'published',
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for career paths
CREATE INDEX IF NOT EXISTS idx_career_paths_family ON career_paths(family);
CREATE INDEX IF NOT EXISTS idx_career_paths_status ON career_paths(status);
CREATE INDEX IF NOT EXISTS idx_career_paths_owner ON career_paths(owner_id);

-- Phase 1.1: Goal Tracks Junction Table
CREATE TABLE IF NOT EXISTS goal_tracks (
  goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL REFERENCES curriculum_tracks(id) ON DELETE CASCADE,
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')) NOT NULL,
  topic_ids TEXT[], -- Specific topics included
  excluded_topic_ids TEXT[], -- Topics excluded
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (goal_id, track_id)
);

-- Create indexes for goal tracks
CREATE INDEX IF NOT EXISTS idx_goal_tracks_goal ON goal_tracks(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_tracks_track ON goal_tracks(track_id);
CREATE INDEX IF NOT EXISTS idx_goal_tracks_priority ON goal_tracks(priority);

-- Phase 1.1: Goal Custom Topics Table
CREATE TABLE IF NOT EXISTS goal_custom_topics (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL REFERENCES curriculum_tracks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  concepts TEXT[],
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for goal custom topics
CREATE INDEX IF NOT EXISTS idx_goal_custom_topics_goal ON goal_custom_topics(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_custom_topics_track ON goal_custom_topics(track_id);

-- Phase 1.2: Extend Existing Goals Table
-- Note: Drizzle-managed schemas typically handle these via migrations
-- For PostgreSQL direct modifications, use:

ALTER TABLE goals ADD COLUMN IF NOT EXISTS career_path_id TEXT REFERENCES career_paths(id);
ALTER TABLE goals ADD COLUMN IF NOT EXISTS track_selections JSONB;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS custom_topics JSONB;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS is_legacy BOOLEAN DEFAULT FALSE;

-- Create indexes for extended goals
CREATE INDEX IF NOT EXISTS idx_goals_career_path ON goals(career_path_id);
CREATE INDEX IF NOT EXISTS idx_goals_is_legacy ON goals(is_legacy);

-- Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER trigger_update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_career_paths_updated_at
    BEFORE UPDATE ON career_paths
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_goal_tracks_updated_at
    BEFORE UPDATE ON goal_tracks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_goal_custom_topics_updated_at
    BEFORE UPDATE ON goal_custom_topics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for backward compatibility - legacy goals
CREATE OR REPLACE VIEW legacy_goals AS
SELECT
  g.id,
  g.user_id,
  g.role,
  g.company_type,
  g.start_date,
  g.duration_days,
  g.hours_per_day,
  g.tracks,
  g.status,
  g.goal_type,
  g.created_at,
  g.updated_at,
  NULL as career_path_id,
  NULL as track_selections,
  NULL as custom_topics,
  TRUE as is_legacy
FROM goals g
WHERE g.is_legacy IS NOT FALSE;

-- Create view for new goals
CREATE OR REPLACE VIEW new_goals AS
SELECT
  g.id,
  g.user_id,
  g.role,
  g.company_type,
  g.start_date,
  g.duration_days,
  g.hours_per_day,
  COALESCE(g.tracks, '[]'::jsonb) as tracks,
  g.status,
  g.goal_type,
  g.created_at,
  g.updated_at,
  g.career_path_id,
  g.track_selections,
  g.custom_topics,
  FALSE as is_legacy
FROM goals g
WHERE g.is_legacy IS FALSE;