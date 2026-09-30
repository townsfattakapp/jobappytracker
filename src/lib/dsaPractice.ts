import type { DsaProblem } from '../types'

// An editorial learning order, not a claim about company question frequency.
export const dsaStages = [
  { title: 'Build the foundations', focus: 'Hash lookups, pointer invariants, and searching sorted data.', slugs: ['two-sum', 'valid-anagram', 'group-anagrams', 'product-of-array-except-self', 'valid-palindrome', 'two-sum-ii-input-array-is-sorted', 'binary-search', 'search-in-rotated-sorted-array'] },
  { title: 'Recognize linear patterns', focus: 'Sliding windows, stacks, linked lists, and in-place updates.', slugs: ['best-time-to-buy-and-sell-stock', 'longest-substring-without-repeating-characters', '3sum', 'container-with-most-water', 'valid-parentheses', 'min-stack', 'daily-temperatures', 'reverse-linked-list', 'merge-two-sorted-lists', 'linked-list-cycle'] },
  { title: 'Traverse and explore', focus: 'Recursive state, BFS, DFS, backtracking, and dependency ordering.', slugs: ['maximum-depth-of-binary-tree', 'invert-binary-tree', 'binary-tree-level-order-traversal', 'validate-binary-search-tree', 'number-of-islands', 'clone-graph', 'course-schedule', 'subsets', 'combination-sum', 'implement-trie-prefix-tree'] },
  { title: 'Optimize your approach', focus: 'DP transitions, greedy choices, heaps, and disjoint sets.', slugs: ['climbing-stairs', 'house-robber', 'coin-change', 'unique-paths', 'longest-common-subsequence', 'maximum-subarray', 'merge-intervals', 'jump-game', 'kth-largest-element-in-an-array', 'redundant-connection', 'single-number'] },
  { title: 'Take the interview challenge', focus: 'Combine patterns and explain the tradeoffs under a time limit.', slugs: ['lru-cache', 'word-search', 'minimum-window-substring', 'trapping-rain-water', 'largest-rectangle-in-histogram', 'find-median-from-data-stream'] },
] as const

export const mustDoSlugs: readonly string[] = dsaStages.flatMap(stage => [...stage.slugs])
export const isDsaSolved = (problem: DsaProblem) => problem.status === 'Solved' || problem.leetCodeStatus === 'Accepted'
export const leetCodeProblemUrl = (problem: DsaProblem) => problem.titleSlug && /^[a-z0-9-]+$/.test(problem.titleSlug)
  ? `https://leetcode.com/problems/${problem.titleSlug}/`
  : undefined

export function mergeLeetCodeAccepted(problems: DsaProblem[], slugs: string[], resetProfile = false): DsaProblem[] {
  const accepted = new Set(slugs)
  return problems.map(problem => ({
    ...problem,
    leetCodeStatus: accepted.has(problem.titleSlug || '') ? 'Accepted' : resetProfile ? undefined : problem.leetCodeStatus,
  }))
}
