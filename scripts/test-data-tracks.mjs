// Automated end-to-end verification for Data Analyst, Data Scientist, and Data Engineer tracks.
// Run: node scripts/test-data-tracks.mjs

import { build } from 'esbuild';
import fs from 'node:fs';

const outdir = 'scratch/test-data-tracks-build';
fs.mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: {
    curriculum: 'src/data/curriculum/index.ts',
    careerPaths: 'src/data/careerPaths.ts',
    registry: 'src/lib/curriculum/registry.ts',
    roadmap: 'src/lib/roadmapGenerator.ts',
    explain: 'src/lib/explainPrompts.ts',
  },
  outdir,
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  logLevel: 'silent',
});

const { careerPathById } = await import(`../${outdir}/careerPaths.mjs`);
const { getCurriculum, ensureTracks } = await import(`../${outdir}/registry.mjs`);
const { generateRoadmap, summarizeRoadmap } = await import(`../${outdir}/roadmap.mjs`);
const { buildExplainPrompt } = await import(`../${outdir}/explain.mjs`);

const targetPaths = ['path-data-analyst', 'path-data-scientist', 'path-data-engineer'];

console.log('Testing 3 Data Career Paths End-to-End...\n');

for (const pathId of targetPaths) {
  const path = careerPathById(pathId);
  if (!path) throw new Error(`Missing career path: ${pathId}`);

  console.log(`=== ${path.title} (${path.id}) ===`);
  console.log(`Family: ${path.family} | Languages: ${path.languages.join(', ')}`);

  const trackIds = path.tracks.map((t) => t.trackId);
  await ensureTracks(trackIds);

  const curriculum = getCurriculum();
  for (const tid of trackIds) {
    const track = curriculum.trackById.get(tid);
    if (!track) throw new Error(`Track ${tid} failed to load!`);
    const topics = track.levels.flatMap(l => l.categories.flatMap(c => c.modules.flatMap(m => m.topics)));
    if (topics.length < 15) throw new Error(`Track ${tid} has suspiciously few topics (${topics.length})`);
    
    // Verify explain prompt generation
    const sample = topics[0];
    const prompt = buildExplainPrompt({
      mode: track.explainMode || 'concept',
      title: sample.title,
      trackTitle: track.title,
      parts: sample.subtopics?.map(s => s.title) || [],
      language: path.languages[0] || 'Python',
    });
    if (!prompt.system || !prompt.noteTitle) throw new Error(`Failed to generate prompt for ${sample.title}`);
  }

  // Generate roadmap
  const mockGoal = {
    id: `goal-${path.id}`,
    name: `${path.title} Plan`,
    targetRole: path.roles[0],
    outcome: 'career',
    careerPathId: path.id,
    experienceLevel: 'intermediate',
    languages: path.languages,
    startDate: '2026-10-01',
    durationDays: 60,
    hoursPerDay: 2,
    restDays: [0],
    status: 'Active',
    goalType: 'Fixed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    companyType: 'Product-Based',
    tracks: path.tracks.map((t, i) => ({ trackId: t.trackId, priority: t.priority, order: i })),
  };

  const days = generateRoadmap(mockGoal, curriculum.tracks);
  const summary = summarizeRoadmap(mockGoal, days, curriculum.tracks);

  console.log(`  Tracks: ${trackIds.length} loaded`);
  console.log(`  Roadmap: ${days.length} days, ${summary.studyDays} study days, ${summary.tasks} tasks`);
  console.log(`  Topics covered: ${summary.topicsCovered} / ${summary.topicsTotal}`);
  console.log(`  Status: PASS\n`);
}

console.log('ALL 3 DATA TRACKS VERIFIED END-TO-END SUCCESSFULLY!');
