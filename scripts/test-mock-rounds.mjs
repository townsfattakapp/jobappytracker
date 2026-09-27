// General mock-interview catalogue: curriculum rounds reach the interviewer
// prompt with their own brief (not the first built-in round), whole-area rounds
// exist for every learning-track family with a syllabus free of placeholder
// topics, the syllabus rotates its starting area between sessions, and the
// scorecard scores the round's own dimensions. Pure; no database, no network.
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'

await build({
  entryPoints: {
    config: 'src/lib/interview/config.ts',
    rounds: 'src/lib/interview/curriculumRounds.ts',
    registry: 'src/lib/curriculum/registry.ts',
    placeholders: 'src/lib/curriculum/placeholders.ts',
  },
  outdir: 'scratch/mock-round-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['react'],
  logLevel: 'silent',
})

const { ROUNDS, buildInterviewerMessages, buildScorecardMessages, syllabusLines, DURATIONS } = await import('../scratch/mock-round-tests/config.mjs')
const { buildCurriculumRounds, familyRoundId, familySyllabus } = await import('../scratch/mock-round-tests/rounds.mjs')
const { getCurriculum } = await import('../scratch/mock-round-tests/registry.mjs')
const { isPlaceholderTopic } = await import('../scratch/mock-round-tests/placeholders.mjs')

const cur = getCurriculum()
const rounds = buildCurriculumRounds(cur)
const system = (messages) => messages[0].content

test('a learning-track round is interviewed with its own brief, not the first built-in round', () => {
  const airflow = rounds.find((r) => r.id === 'track-airflow')
  assert.ok(airflow, 'Apache Airflow round exists')
  const setup = { roundId: airflow.id, level: 'Mid', minutes: 30, personaId: 'standard', voice: false }
  const prompt = system(buildInterviewerMessages(setup, [], 30, airflow))
  assert.match(prompt, /Apache Airflow mock interview round/)
  assert.match(prompt, /Run a technical interview on Apache Airflow/)
  assert.doesNotMatch(prompt, new RegExp(ROUNDS[0].brief.slice(0, 40).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  const score = system(buildScorecardMessages(setup, [], 0, 12, airflow))
  assert.match(score, /Round: Apache Airflow \(Curriculum\)/)
  assert.match(score, /Core concepts; Practical application/)
})

test('every learning-track family has a whole-area round whose syllabus holds only real topics', () => {
  const families = Array.from(new Set(cur.tracks.filter((t) => t.source !== 'personal').map((t) => t.family || 'Other tracks')))
  assert.ok(families.length >= 10, `families: ${families.length}`)
  for (const family of families) {
    const round = rounds.find((r) => r.id === familyRoundId(family))
    assert.ok(round, `whole-area round for ${family}`)
    assert.equal(round.family, family)
    assert.ok(round.syllabus.length >= 2, `${family} has at least two areas`)
    for (const area of round.syllabus) {
      assert.ok(area.topics.length >= 1 && area.topics.length <= 6, `${area.title}: ${area.topics.length} topics`)
      for (const topic of area.topics) {
        assert.ok(!isPlaceholderTopic(topic), `${family} / ${area.title}: placeholder "${topic}"`)
        assert.doesNotMatch(topic, /interview questions$/i)
      }
    }
  }
  const de = familySyllabus(cur, 'Data Engineering')
  assert.ok(de.some((a) => /Airflow/.test(a.title)) && de.some((a) => /Kafka/.test(a.title)), 'Data Engineering lists Airflow and Kafka')
  assert.ok(!de.some((a) => a.title === 'Spark'), 'the placeholder-only Spark track is not an area')
})

test('the whole-area prompt carries the syllabus, rotates the starting area and asks for breadth', () => {
  const round = rounds.find((r) => r.id === familyRoundId('Data Engineering'))
  const base = { roundId: round.id, level: 'Senior', minutes: 60, personaId: 'bar-raiser', voice: true }
  const first = system(buildInterviewerMessages({ ...base, rotation: 0 }, [], 60, round))
  assert.match(first, /Syllabus for this round \(\d+ areas/)
  assert.match(first, /^\d+\. Apache Airflow: /m)
  assert.match(first, /starting with area 1\./)
  assert.match(first, /10 to 12 main questions, each from a different syllabus area/)
  const third = system(buildInterviewerMessages({ ...base, rotation: 2 }, [], 60, round))
  assert.match(third, /starting with area 3, continuing past the last area back to area 1/)
  const wrapped = syllabusLines(round, round.syllabus.length + 1)
  assert.match(wrapped[wrapped.length - 1], /starting with area 2,/)
  const score = system(buildScorecardMessages({ ...base, rotation: 0 }, [], 0, 55, round))
  assert.match(score, /whole-area round over these syllabus areas: /)
  assert.match(score, /Breadth across the area; Depth of understanding/)
  assert.ok(first.length < 12_000, `prompt stays compact (${first.length} chars)`)
})

test('built-in rounds are unchanged and the catalogue offers 20 to 60 minutes', () => {
  assert.deepEqual([...DURATIONS], [20, 30, 45, 60])
  const dsa = ROUNDS[0]
  const prompt = system(buildInterviewerMessages({ roundId: dsa.id, level: 'Mid', minutes: 30, personaId: 'standard', voice: false }, [], 30))
  assert.match(prompt, new RegExp(`${dsa.label} mock interview round`))
  assert.doesNotMatch(prompt, /Syllabus for this round/)
  assert.equal(rounds.filter((r) => r.group === 'Curriculum' && !r.syllabus).length, cur.tracks.filter((t) => !ROUNDS.some((r) => r.id === t.id || r.label === t.title)).length)
})
