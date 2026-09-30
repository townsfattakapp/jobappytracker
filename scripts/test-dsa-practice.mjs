import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'

await build({
  entryPoints: { practice: 'src/lib/dsaPractice.ts', seed: 'src/data/javaDsaSeed.ts', route: 'src/app/api/leetcode/[username]/route.ts' },
  outdir: 'scratch/dsa-tests', bundle: true, platform: 'node', format: 'esm',
  outExtension: { '.js': '.mjs' }, external: ['next/*'],
  plugins: [{ name: 'next-node-resolution', setup(b) {
    b.onResolve({ filter: /^next\/server$/ }, () => ({ path: 'next/server.js', external: true }))
  } }],
})
const { mustDoSlugs, dsaStages, isDsaSolved, mergeLeetCodeAccepted, leetCodeProblemUrl } = await import('../scratch/dsa-tests/practice.mjs')
const { javaDsaSeed } = await import('../scratch/dsa-tests/seed.mjs')
const { GET } = await import('../scratch/dsa-tests/route.mjs')

test('roadmap has unique, available problems and covers every seed pattern', () => {
  assert.equal(dsaStages.length, 5)
  assert.equal(new Set(mustDoSlugs).size, mustDoSlugs.length)
  const selected = mustDoSlugs.map(slug => {
    const problem = javaDsaSeed.find(p => p.titleSlug === slug)
    assert.ok(problem, slug)
    assert.equal(leetCodeProblemUrl(problem), problem.url)
    return problem
  })
  assert.deepEqual(new Set(selected.map(p => p.pattern)), new Set(javaDsaSeed.map(p => p.pattern)))
})

test('sync preserves attempts, retains older matches, and clears another profile badges', () => {
  const source = javaDsaSeed.slice(0, 3).map(p => ({ ...p }))
  source[0].leetCodeStatus = 'Accepted'
  source[1].status = 'Solved'
  const synced = mergeLeetCodeAccepted(source, [source[2].titleSlug, 'unknown-problem'])
  assert.equal(synced.length, source.length)
  assert.equal(synced[0].leetCodeStatus, 'Accepted')
  assert.equal(synced[2].status, source[2].status)
  assert.ok(isDsaSolved(synced[2]))
  const switched = mergeLeetCodeAccepted(synced, [], true)
  assert.ok(switched.every(p => !p.leetCodeStatus))
  assert.equal(switched[1].status, 'Solved')
  assert.equal(source[2].leetCodeStatus, undefined)
})

test('invalid usernames, upstream errors, missing profiles, and success', async () => {
  const original = globalThis.fetch
  const call = username => GET(new Request('http://localhost/api/leetcode/test'), { params: Promise.resolve({ username }) })
  try {
    globalThis.fetch = async () => { throw new Error('Should not fetch') }
    assert.equal((await call('%bad')).status, 400)
    globalThis.fetch = async () => Response.json({ errors: [{ message: 'upstream error' }] })
    assert.equal((await call('test')).status, 502)
    globalThis.fetch = async () => Response.json({ data: { matchedUser: null } })
    assert.equal((await call('test')).status, 404)
    globalThis.fetch = async (_url, options) => {
      assert.equal(JSON.parse(options.body).variables.limit, 50)
      return Response.json({ data: { matchedUser: { username: 'test', submitStatsGlobal: { acSubmissionNum: [{ difficulty: 'All', count: 42 }] } }, recentAcSubmissionList: [{ id: '1', title: 'Two Sum', titleSlug: 'two-sum', timestamp: '1000', lang: 'java' }] } })
    }
    const response = await call('test')
    assert.equal(response.status, 200)
    const data = await response.json()
    assert.equal(data.totalSolved, 42)
    assert.equal(data.submissions[0].timestamp, 1000000)
  } finally { globalThis.fetch = original }
})
