-- Migrate Goals to New Structure
-- Phase 2.3: Migrate legacy goals to new goal_tracks junction table

-- First, mark all existing goals as legacy
UPDATE goals SET is_legacy = TRUE WHERE is_legacy IS NOT FALSE;

-- Migrate goals with legacy track references
WITH migrated_goals AS (
  UPDATE goals
  SET
    career_path_id = CASE
      WHEN role LIKE '%AI%' THEN 'path-ai-engineer'
      WHEN role LIKE '%Data Scientist%' THEN 'path-data-scientist'
      WHEN role LIKE '%Backend%' THEN 'path-java-backend'
      WHEN role LIKE '%Full-Stack%' THEN 'path-full-stack'
      WHEN role LIKE '%Frontend%' THEN 'path-frontend'
      WHEN role LIKE '%DevOps%' THEN 'path-devops-engineer'
      WHEN role LIKE '%Security%' THEN 'path-cybersecurity'
      WHEN role LIKE '%Java%' THEN 'path-java-backend'
      WHEN role LIKE '%Python%' THEN 'path-python-backend'
      WHEN role LIKE '%JavaScript%' THEN 'path-full-stack'
      ELSE NULL
    END,
    track_selections = tracks,
    custom_topics = '[]'::jsonb,
    updated_at = NOW()
  WHERE is_legacy = TRUE
  RETURNING id, user_id, tracks, career_path_id
)

-- Insert into goal_tracks junction table
INSERT INTO goal_tracks (goal_id, track_id, priority, order_index)
SELECT
  mg.id,
  ct.id,
  'Medium' as priority,
  0 as order_index
FROM migrated_goals mg
CROSS JOIN unnest(mg.tracks) as track_id
JOIN curriculum_tracks ct ON track_id = ct.id
ORDER BY mg.user_id, mg.id;

-- Create a backup of migrated data for verification
CREATE TABLE goals_migration_backup AS
SELECT
  g.id,
  g.user_id,
  g.role,
  g.company_type,
  g.start_date,
  g.duration_days,
  g.hours_per_day,
  g.tracks as legacy_tracks,
  gt.id as junction_id,
  gt.track_id,
  gt.priority,
  gt.order_index,
  g.career_path_id,
  g.is_legacy
FROM goals g
LEFT JOIN goal_tracks gt ON g.id = gt.goal_id
WHERE g.is_legacy = TRUE;

-- Log migration summary
INSERT INTO migration_log (migration_id, description, records_affected, status)
VALUES (
  '0003',
  'Migrate legacy goals to new goal_tracks junction table',
  (SELECT COUNT(*) FROM goals_migration_backup),
  'COMPLETED'
);

-- Clean up backup table
DROP TABLE IF EXISTS goals_migration_backup;