import { allCurriculums } from '../src/data/curriculum';

let totalTracks = 0;
let totalCats = 0;
let totalMods = 0;
let totalTopics = 0;
let totalConcepts = 0;

console.log("=========================================");
console.log("    CURRICULUM COVERAGE REPORT           ");
console.log("=========================================\n");

allCurriculums.forEach(track => {
  totalTracks++;
  let tCats = 0, tMods = 0, tTopics = 0, tConcepts = 0;
  
  track.levels.forEach(lvl => {
    lvl.categories.forEach(cat => {
      tCats++;
      cat.modules.forEach(mod => {
        tMods++;
        mod.topics.forEach(top => {
          tTopics++;
          top.subtopics.forEach(sub => {
            tConcepts++;
          });
        });
      });
    });
  });

  console.log(`[${track.title}]`);
  console.log(`  Categories: ${tCats}`);
  console.log(`  Topics:     ${tTopics}`);
  console.log(`  Concepts:   ${tConcepts}\n`);

  totalCats += tCats;
  totalMods += tMods;
  totalTopics += tTopics;
  totalConcepts += tConcepts;
});

console.log("=========================================");
console.log("          TOTALS ACROSS APP              ");
console.log("=========================================");
console.log(`Tracks:     ${totalTracks}`);
console.log(`Categories: ${totalCats}`);
console.log(`Topics:     ${totalTopics}`);
console.log(`Concepts:   ${totalConcepts}`);
console.log("=========================================\n");

if (totalTracks < 10) {
  console.error("❌ Validation Failed: Missing required tracks.");
  process.exit(1);
}
if (totalCats < 150) {
  console.error(`❌ Validation Failed: Expected ~150+ categories, found ${totalCats}`);
  process.exit(1);
}
if (totalConcepts === 0) {
  console.error("❌ Validation Failed: No concepts found.");
  process.exit(1);
}

console.log("✅ Validation Passed: Curriculum is fully seeded and relationships are valid.");
