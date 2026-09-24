# JobAppy Database Migration Plan

## Overview
Migrates from the legacy 10-fixed-track system to the extensible multi-career, multi-language platform while preserving all existing user data and maintaining backward compatibility.

## Phase 1: Schema Extensions (Backward Compatible)

### 1.1 Add Career Paths Table
```sql
CREATE TABLE career_paths (
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
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 1.2 Add Goal Tracks Junction Table
```sql
CREATE TABLE goal_tracks (
  goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL REFERENCES curriculum_tracks(id),
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')) NOT NULL,
  topic_ids TEXT[], -- Specific topics included
  excluded_topic_ids TEXT[], -- Topics excluded
  order_index INTEGER NOT NULL,
  PRIMARY KEY (goal_id, track_id)
);
```

### 1.3 Add Goal Custom Topics Table
```sql
CREATE TABLE goal_custom_topics (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL REFERENCES curriculum_tracks(id),
  title TEXT NOT NULL,
  description TEXT,
  concepts TEXT[],
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 1.4 Add Goal Track Selection Preferences
```sql
ALTER TABLE goals ADD COLUMN career_path_id TEXT REFERENCES career_paths(id);
ALTER TABLE goals ADD COLUMN track_selections JSONB; -- Legacy tracks array
ALTER TABLE goals ADD COLUMN custom_topics JSONB; -- User-created content
```

## Phase 2: Data Migration Scripts

### 2.1 Migration Scripts Directory
```
migrations/
├── 0001_legacy_analysis.sql
├── 0002_add_new_tables.sql
├── 0003_migrate_goals_to_new_structure.sql
├── 0004_populate_career_paths.sql
├── 0005_backfill_user_progress.sql
└── 0006_create_views_and_indexes.sql
```

### 2.2 Legacy Analysis (Pre-Migration Audit)
```sql
-- Count existing users and their goal configurations
SELECT 
  user_id,
  COUNT(*) as goal_count,
  array_agg(DISTINCT unnest(tracks)) as legacy_track_ids,
  COUNT(DISTINCT unnest(tracks)) as unique_legacy_tracks
FROM goals 
GROUP BY user_id;

-- Check what tracks actually exist in curriculum_tracks vs legacy
SELECT 
  g.user_id,
  COUNT(*) as goal_count,
  COUNT(DISTINCT unnest(g.tracks)) as legacy_track_refs,
  COUNT(DISTINCT ct.id) as valid_curriculum_track_refs
FROM goals g
LEFT JOIN unnest(g.tracks) as track_id ON true
LEFT JOIN curriculum_tracks ct ON track_id = ct.id
GROUP BY g.user_id;
```

### 2.3 New Tables Creation
```sql
-- Career paths from data/careerPaths.ts
INSERT INTO career_paths (id, title, family, icon, description, languages, roles, tracks, source, status, version)
SELECT id, title, family, icon, description, languages, roles, 
       tracks::jsonb, 'builtin', 'published', 1
FROM jsonb_to_career_paths('src/data/careerPaths.ts');

-- Migrate legacy goals to new structure
WITH migrated_goals AS (
  UPDATE goals 
  SET 
    career_path_id = CASE 
      WHEN role LIKE '%AI%' THEN 'path-ai-engineer'
      WHEN role LIKE '%Data Scientist%' THEN 'path-data-scientist'
      WHEN role LIKE '%Backend%' THEN 'path-java-backend'
      ELSE NULL
    END,
    track_selections = tracks,
    updated_at = NOW()
  WHERE tracks IS NOT NULL AND tracks != '[]'::jsonb
  RETURNING id, user_id, tracks, career_path_id
)
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
```

## Phase 3: Application Logic Updates

### 3.1 Update Goal Creation Flow
**File: `src/GoalManager.tsx`**

#### Step 1: Import New Career Paths API
```tsx
import { careerPaths } from '../data/careerPaths';
import { loadCareerPaths, saveCareerPath } from '../lib/careerPaths';
```

#### Step 2: Replace Template Selection
```tsx
// Replace careerPaths with dynamic loading
const [availablePaths, setAvailablePaths] = useState<CareerPath[]>([]);

useEffect(() => {
  loadCareerPaths().then(setAvailablePaths);
}, []);
```

#### Step 3: Update Goal Saving
```tsx
const saveGoal = async (goal: Goal, roadmap: RoadmapDay[], next: GoalCreateNext) => {
  // Convert new structure to legacy for backward compatibility
  const legacyTracks = selectedTracks.map(st => {
    const track = curriculum.trackById.get(st.trackId);
    return track?.id || st.trackId;
  });
  
  const legacyGoal: LegacyGoal = {
    ...goal,
    tracks: legacyTracks,
    // Preserve new data in additional fields
    career_path_id: goal.careerPathId,
    track_selections: JSON.stringify(goal.tracks),
    custom_topics: JSON.stringify(goal.customTopics || [])
  };
  
  // Save to both systems
  await saveLegacyGoal(legacyGoal);
  await saveNewGoal(goal);
  
  onSaveGoal(goal, roadmap, next);
};
```

### 3.2 Update Curriculum Builder
**File: `src/components/CurriculumBuilder.tsx`**

#### Step 1: Replace Track Selection
```tsx
const [showCareerPaths, setShowCareerPaths] = useState(false);
const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);

useEffect(() => {
  loadCareerPaths().then(setCareerPaths);
}, []);
```

#### Step 2: Career Path Template Application
```tsx
const applyCareerPath = (pathId: string) => {
  const path = careerPaths.find(p => p.id === pathId);
  if (!path) return;
  
  // Convert career path tracks to new GoalTrack format
  const goalTracks: GoalTrack[] = path.tracks
    .filter(t => curriculum.trackById.has(t.trackId))
    .map((t, index) => ({
      trackId: t.trackId,
      priority: t.priority,
      order: index,
      topicIds: undefined, // Include all topics initially
      excludedTopicIds: undefined
    }));
  
  setSelectedTracks(goalTracks);
  if (!targetRole) setTargetRole(path.roles?.[0] || path.title);
  if (!name) setName(`${path.title} plan`);
  if (path.languages && !languages.length) setLanguages(path.languages);
};
```

### 3.3 Update AI Goal Builder
**File: `src/components/AiGoalBuilder.tsx`**

#### Step 1: Use New AI API
```tsx
const suggestCurriculum = async (input: GoalBuilderInput): Promise<GoalSuggestion> => {
  // Call new API that works with curriculum_tracks table
  const response = await fetch('/api/ai/goal-suggestion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  
  if (!response.ok) {
    throw new Error('AI goal suggestion failed');
  }
  
  return response.json();
};
```

#### Step 2: Convert AI Suggestions
```tsx
const convertSuggestionToGoal = (suggestion: GoalSuggestion): Partial<Goal> => {
  return {
    name: suggestion.name,
    description: suggestion.description,
    targetRole: suggestion.targetRole,
    outcome: suggestion.outcome,
    careerPathId: findMatchingCareerPath(suggestion),
    experienceLevel: suggestion.experienceLevel,
    languages: suggestion.languages,
    tracks: suggestion.tracks.map((st, index) => ({
      trackId: st.trackId,
      priority: st.priority,
      order: index,
      topicIds: st.categoryIds, // Convert category IDs to topic IDs
      excludedTopicIds: st.knownCategoryIds // Convert known categories to excluded topics
    }))
  };
};
```

## Phase 4: API Updates

### 4.1 Career Paths API
**File: `src/app/api/curriculum/career-paths/route.ts`**
```typescript
export async function GET() {
  const paths = await db.select().from(careerPaths)
    .where(eq(careerPaths.status, 'published'))
    .orderBy(careerPaths.title);
  
  return NextResponse.json(paths);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id, title, family, description } = await req.json();
  
  const [path] = await db.insert(careerPaths).values({
    id,
    ownerId: session.user.id,
    title,
    family,
    icon: getDefaultIcon(family),
    description: description || '',
    languages: [],
    roles: [],
    tracks: [],
    status: 'draft',
    version: 1
  }).returning();
  
  return NextResponse.json(path);
}
```

### 4.2 Enhanced Curriculum API
**File: `src/app/api/curriculum/route.ts`**
```typescript
export async function GET() {
  const tracks = await db.select().from(curriculumTracks)
    .where(eq(curriculumTracks.status, 'published'))
    .orderBy(curriculumTracks.family, curriculumTracks.title);
  
  // Include career paths in the response for the builder
  const careerPaths = await db.select().from(careerPaths)
    .where(eq(careerPaths.status, 'published'));
    
  return NextResponse.json({
    tracks,
    careerPaths
  });
}
```

## Phase 5: Migration Verification

### 5.1 Data Validation
```sql
-- Verify all legacy goals have corresponding entries in new structure
SELECT 
  g.id as goal_id,
  g.user_id,
  COUNT(gt.id) as junction_entries,
  COUNT(gct.id) as custom_topic_entries
FROM goals g
LEFT JOIN goal_tracks gt ON g.id = gt.goal_id
LEFT JOIN goal_custom_topics gct ON g.id = gct.goal_id
GROUP BY g.id, g.user_id
HAVING COUNT(gt.id) = 0 AND COUNT(gct.id) = 0;
```

### 5.2 User Experience Testing
1. **Existing User Login**: Verify all 10 legacy tracks still load
2. **Create New Goal**: Test career path templates
3. **Add Custom Topics**: Verify new track creation works
4. **Generate Roadmap**: Test mixed legacy/new curriculum
5. **Progress Persistence**: Ensure all data survives migration

## Phase 6: Production Deployment

### 6.1 Gradual Rollout
1. **Canary Deployment**: 5% of users get new schema
2. **Feature Flags**: Toggle between old/new goal creation
3. **Gradual Migration**: Migrate users over time based on activity

### 6.2 Rollback Plan
```sql
-- Emergency rollback - preserve data integrity
BEGIN TRANSACTION;

-- Backup current state
CREATE TABLE goals_backup AS SELECT * FROM goals;
CREATE TABLE goal_tracks_backup AS SELECT * FROM goal_tracks;
CREATE TABLE goal_custom_topics_backup AS SELECT * FROM goal_custom_topics;

-- Restore if needed
ROLLBACK;
```

## Rollout Timeline

**Week 1**: Schema extensions + migration scripts ready
**Week 2**: Application updates (goal manager, builder, AI)
**Week 3**: API endpoints + verification testing
**Week 4**: Production deployment + monitoring

This comprehensive migration preserves all existing user data while enabling the new extensible curriculum system with career paths, custom tracks, and AI-powered goal building.