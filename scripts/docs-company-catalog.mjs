// Regenerates docs/company-source-catalog.md from src/data/companyCatalog.ts.
//   node scripts/docs-company-catalog.mjs
import { build } from 'esbuild'
import fs from 'node:fs'

await build({ entryPoints: { data: 'src/data/companyCatalog.ts' }, outdir: 'scratch/catalog-docs', bundle: true, platform: 'node', format: 'esm', outExtension: { '.js': '.mjs' }, logLevel: 'silent' })
const { COMPANY_CATALOG } = await import('../scratch/catalog-docs/data.mjs')

const SITE = new Set(['amazon', 'eightfold', 'workday', 'oraclecloud', 'atlassian'])
const today = new Date().toISOString().slice(0, 10)
const feeds = COMPANY_CATALOG.filter((c) => c.feed)
const boards = feeds.filter((c) => !SITE.has(c.feed.provider))
const sites = feeds.filter((c) => SITE.has(c.feed.provider))
const portals = COMPANY_CATALOG.filter((c) => !c.feed)
const dates = Array.from(new Set(feeds.map((c) => c.feed.verifiedAt))).sort()

const source = (c) => {
  if (!c.feed) return `[careers page](${c.careersUrl})`
  const kind = SITE.has(c.feed.provider) ? `${c.feed.provider} site JSON (unofficial)` : `${c.feed.provider} board`
  return `${kind} \`${c.feed.token}\` (verified ${c.feed.verifiedAt}, ${c.feed.jobsAtVerification} listings)`
}
const status = (c) => (c.feed ? 'Configured (verified feed)' : 'Not configured (no public feed)')
const row = (c) => `| ${c.name} | ${c.headquarters} | ${c.indiaRelevance} | ${c.roleFamilies.length} families | ${source(c)} | ${status(c)}${c.notes ? ` · ${c.notes}` : ''} |`

const md = `# Company source catalog

Generated from \`src/data/companyCatalog.ts\` on ${today} by \`scripts/docs-company-catalog.mjs\`. ${COMPANY_CATALOG.length} companies: ${boards.length} with a public, documented job-board feed (Greenhouse, Lever, Ashby, SmartRecruiters), ${sites.length} read through the JSON endpoint their own careers site calls (Amazon Jobs, Eightfold, Workday, Oracle Cloud HCM, Atlassian), ${portals.length} with an official careers portal only (stored as **Not configured / Unsupported**, careers link kept). Read-only identity probes ran on ${dates.join(', ')}.

Rules: documented board APIs and the careers sites' own JSON endpoints are read the way a browser would, with their page sizes, a cap per run and retries on rate limits; no HTML scraping, no anti-bot bypass, no LinkedIn or Google Jobs, no third-party copies, no fabricated openings. The site endpoints (Amazon, Eightfold, Workday) are unofficial and undocumented: a change on their side shows up as a failed run on /admin/catalog, never as invented data. Google, Meta and Apple offer neither a feed nor a readable endpoint and stay careers-link only. Ingestion keeps only listings that normalise to a supported JobAppy role family; HR, sales, legal, warehouse and operations roles are dropped as irrelevant.

| Company | HQ / India presence | India relevance | Role families | Source | Status at catalog time |
|---|---|---|---|---|---|
${COMPANY_CATALOG.map(row).join('\n')}
`
fs.writeFileSync('docs/company-source-catalog.md', md)
console.log(`docs/company-source-catalog.md: ${COMPANY_CATALOG.length} companies, ${boards.length} board feeds, ${sites.length} site endpoints, ${portals.length} careers-link only`)
