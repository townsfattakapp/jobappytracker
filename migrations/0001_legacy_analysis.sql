-- Legacy Analysis - Pre-Migration Audit
-- Run this to understand the current state before migration

-- 1. Count existing users and their goal configurations
SELECT
  user_id,
  COUNT(*) as goal_count,
  array_agg(DISTINCT unnest(tracks)) as legacy_track_ids,
  COUNT(DISTINCT unnest(tracks)) as unique_legacy_tracks
FROM goals
GROUP BY user_id
ORDER BY goal_count DESC;

-- 2. Check what tracks actually exist in curriculum_tracks vs legacy
SELECT
  g.user_id,
  COUNT(*) as goal_count,
  COUNT(DISTINCT unnest(g.tracks)) as legacy_track_refs,
  COUNT(DISTINCT ct.id) as valid_curriculum_track_refs,
  COUNT(DISTINCT CASE WHEN ct.id IS NULL THEN unnest(g.tracks) END) as orphan_track_refs
FROM goals g
LEFT JOIN unnest(g.tracks) as track_id ON true
LEFT JOIN curriculum_tracks ct ON track_id = ct.id
GROUP BY g.user_id
ORDER BY g.user_id;

-- 3. Analyze goal types and usage patterns
SELECT
  goal_type,
  COUNT(*) as goal_count,
  AVG(duration_days) as avg_duration,
  AVG(hours_per_day) as avg_hours_per_day
FROM goals
GROUP BY goal_type;

-- 4. Check for duplicate or problematic data
SELECT
  user_id,
  id,
  tracks,
  CASE
    WHEN tracks IS NULL OR tracks = '[]'::jsonb THEN 'EMPTY_OR_NULL'
    WHEN tracks = '[]'::jsonb THEN 'NULL_EMPTY'
    WHEN tracks IS NULL THEN 'NULL'
    ELSE 'HAS_DATA'
  END as track_status,
  created_at,
  updated_at
FROM goals
WHERE tracks IS NULL OR tracks = '[]'::jsonb
ORDER BY user_id, created_at;

-- 5. Identify users with the most complex track configurations
SELECT
  user_id,
  COUNT(*) as goal_count,
  COUNT(DISTINCT unnest(tracks)) as unique_track_refs,
  array_agg(DISTINCT unnest(tracks)) as all_track_refs,
  STRING_AGG(DISTINCT unnest(tracks)::text, ', ') as track_list
FROM goals
GROUP BY user_id
HAVING COUNT(DISTINCT unnest(tracks)) > 3
ORDER BY unique_track_refs DESC;

-- 6. Check for any existing custom or shared curriculum
SELECT
  ct.id,
  ct.title,
  ct.family,
  ct.owner_id,
  ct.status,
  COUNT(*) OVER (PARTITION BY ct.owner_id) as owner_count
FROM curriculum_tracks ct
WHERE ct.owner_id IS NOT NULL
ORDER BY ct.family, ct.title;