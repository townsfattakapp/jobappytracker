import { normalizeMarkdownTables, renderMarkdown, renderMarkdownRich } from '../src/lib/markdown.ts'

console.log('Testing markdown table rendering and normalization...')

// Test 1: Standard GFM table
const standardMd = '| Col A | Col B |\n|---|---|\n| 123 | 456 |'
const out1 = renderMarkdown(standardMd)
if (!out1.includes('class="tableWrapper"') || !out1.includes('<td>123</td>')) {
  console.error('Failed Test 1:', out1)
  process.exit(1)
}
console.log('Test 1 PASS: Standard GFM table wrapped in tableWrapper')

// Test 2: Auto-normalization when AI forgets delimiter row
const nonDelimMd = '| Date | UserID | SizeKB |\n| 2024-01-01 | U001 | 120 |'
const out2 = renderMarkdown(nonDelimMd)
if (!out2.includes('<th>Date</th>') || !out2.includes('<td>U001</td>') || !out2.includes('class="tableWrapper"')) {
  console.error('Failed Test 2:', out2)
  process.exit(1)
}
console.log('Test 2 PASS: Auto-normalized table converted to <table> with th and td')

// Test 3: renderMarkdownRich with responsive data-labels and md-table wrapper
const richOut = renderMarkdownRich(standardMd)
if (!richOut.includes('class="md-table"') || !richOut.includes('data-label="Col A"')) {
  console.error('Failed Test 3:', richOut)
  process.exit(1)
}
console.log('Test 3 PASS: renderMarkdownRich wraps in md-table with data-label')

console.log('ALL TABLE TESTS PASSED 100%!')
