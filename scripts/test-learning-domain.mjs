import assert from "node:assert/strict";
import { build } from "esbuild";
await build({
  entryPoints: {
    learningPlan: "src/lib/learningPlan.ts",
    roadmapGenerator: "src/lib/roadmapGenerator.ts",
    types: "src/types.ts",
  },
  outdir: "scratch/learning-tests",
  bundle: true,
  platform: "node",
  format: "esm",
  outExtension: { ".js": ".mjs" },
});
const { makeDay, restDay, dayStatus, proposeDay, addDays, dateKey } =
  await import("../scratch/learning-tests/learningPlan.mjs");
const { generateRoadmap } =
  await import("../scratch/learning-tests/roadmapGenerator.mjs");
const goal = {
  id: "one",
  targetRole: "Engineer",
  startDate: "2026-09-22",
  durationDays: 121,
  hoursPerDay: 2,
  restDays: [],
  tracks: [{ trackId: "track-dsa", priority: "High" }],
};
const empty = makeDay(goal, "2026-09-27");
assert.equal(restDay(goal, empty), false);
assert.equal(dayStatus(goal, empty), "Empty");
assert.equal(restDay({ ...goal, restDays: [0] }, empty), true);
assert.equal(
  restDay({ ...goal, restDays: [0] }, { ...empty, isRestDay: false }),
  false,
);
assert.notEqual(
  makeDay(goal, "2026-09-22").id,
  makeDay({ ...goal, id: "two" }, "2026-09-22").id,
);
for (const tz of ["Asia/Calcutta", "America/Los_Angeles", "Pacific/Auckland"]) {
  process.env.TZ = tz;
  assert.equal(addDays("2026-03-08", 1), "2026-03-09");
  assert.equal(addDays("2026-11-01", 1), "2026-11-02");
}
const plan = proposeDay(goal, empty, [], []);
assert.ok(plan.length);
assert.ok(plan.every((t) => t.topicId && t.trackId));
assert.ok(plan.reduce((s, t) => s + t.estDurationMinutes, 0) <= 120);
const full = { ...empty, tasks: [{ ...plan[0], estDurationMinutes: 130 }] };
assert.equal(proposeDay(goal, full, [], []).length, 0);
const some = { ...empty, tasks: [plan[0]] };
assert.ok(
  proposeDay(goal, some, [some], []).every(
    (t) => t.topicId !== plan[0].topicId,
  ),
);
assert.equal(some.tasks.length, 1);
assert.equal(
  dayStatus(goal, { ...empty, date: addDays(dateKey(), -1), tasks: plan }),
  "Overdue",
);
assert.equal(
  dayStatus(goal, {
    ...empty,
    tasks: plan.map((t) => ({ ...t, status: "Completed" })),
  }),
  "Completed",
);
assert.equal(proposeDay({ ...goal, tracks: [] }, empty, [], []).length, 0);
const days = generateRoadmap(goal, []);
assert.equal(days.length, 121);
assert.ok(
  days.every(
    (d) => d.goalId === goal.id && d.tasks.every((t) => t.dayId === d.id),
  ),
);
assert.equal(new Set(days.map((d) => d.id)).size, 121);
console.log(
  "PASS: timezone/DST dates, explicit rest overrides, unique goal/day IDs, workload limits, non-destructive generation, overdue/completed states, no tracks, variable duration",
);

const { loadStorage } = await import("../scratch/learning-tests/types.mjs");
const legacy = {
  applications: [],
  goals: [{ ...goal, tracks: ["track-dsa"] }],
  roadmap: [{ ...empty, goalId: "old-preview-id", tasks: plan }],
  knowledgeWorkspaces: [
    {
      topicId: "topic-dsa-two-pointers",
      notes: [{ id: "legacy-note", content: "keep me" }],
    },
  ],
  dsaAttemptSummaries: [{ id: "old-attempt" }],
};
globalThis.localStorage = { getItem: () => JSON.stringify(legacy) };
const restored = loadStorage();
assert.equal(restored.roadmap[0].goalId, goal.id);
assert.equal(restored.roadmap[0].tasks.length, plan.length);
assert.equal(restored.knowledgeWorkspaces[0].notes[0].content, "keep me");
assert.equal(restored.dsaAttemptSummaries[0].id, "old-attempt");
assert.equal(restored.goals[0].tracks[0].trackId, "track-dsa");
console.log(
  "PASS: legacy orphan goal IDs recovered without losing tasks, notes, attempts or track selections",
);

const limited = proposeDay({ ...goal, hoursPerDay: 0.5 }, empty, [], []);
assert.ok(!limited.some((t) => t.topicId === "topic-dsa-two-pointers"));
const revisionPlan = proposeDay(
  goal,
  empty,
  [],
  [],
  [
    {
      id: "revision",
      entityId: "dsa-two-sum-ii",
      entityType: "DSA",
      dueDate: "2026-01-01",
      interval: 1,
      easeFactor: 2.5,
      topic: "Two Sum II",
    },
  ],
);
assert.equal(revisionPlan[0].linkedActivityId, "dsa-two-sum-ii");
console.log("PASS: topic prerequisites and due revision requirements");
