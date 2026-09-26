import type { DsaProblem } from '../types'

export const javaDsaSeed: DsaProblem[] = [
  {
    "id": "dsa-two-sum",
    "title": "Two Sum",
    "titleSlug": "two-sum",
    "url": "https://leetcode.com/problems/two-sum/",
    "difficulty": "Easy",
    "pattern": "Arrays & Hashing",
    "tags": [
      "Arrays",
      "HashMap"
    ],
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Microsoft"
    ],
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    "examples": [
      {
        "input": "nums = [2,7,11,15], target = 9",
        "output": "[0,1]",
        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        "input": "nums = [3,2,4], target = 6",
        "output": "[1,2]"
      },
      {
        "input": "nums = [3,3], target = 6",
        "output": "[0,1]"
      }
    ],
    "constraints": [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[0];\n    }\n}",
      "Python": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass",
      "TypeScript": "function twoSum(nums: number[], target: number): number[] {\n    return [];\n}",
      "C++": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};",
      "Go": "func twoSum(nums []int, target int) []int {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Brute Force vs Hash Lookup",
        "content": "A brute force checks every pair (i, j) taking O(N^2). Can we remember previously visited numbers to find the complement in O(1)?"
      },
      {
        "level": 2,
        "title": "Using a Hash Map",
        "content": "As you iterate through nums, check if (target - currentNum) exists in a hash map. If yes, you found the two indices."
      },
      {
        "level": 3,
        "title": "Single Pass Invariant",
        "content": "Insert the current number and its index into the map AFTER checking for the complement so you do not use the same element twice."
      }
    ],
    "solution": {
      "intuition": "Store each number mapped to its index in a hash map. For each number x, check if (target - x) is already in the map.",
      "approach": "Iterate through the array once. For each element, compute complement = target - nums[i]. If complement is present in map, return [map.get(complement), i]. Otherwise, put nums[i] into the map.",
      "timeComplexity": "O(N) - single pass over N elements with O(1) average lookup in hash map.",
      "spaceComplexity": "O(N) - storing up to N elements in the map.",
      "keyTakeaway": "Trade space for time by using a hash map for instantaneous complement lookup.",
      "code": {
        "Java": "import java.util.HashMap;\nimport java.util.Map;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}",
        "Python": "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            comp = target - num\n            if comp in seen:\n                return [seen[comp], i]\n            seen[num] = i\n        return []",
        "TypeScript": "function twoSum(nums: number[], target: number): number[] {\n    const map = new Map<number, number>();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement)!, i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Look for frequency counts, duplicates, lookup in O(1) time, or pre-computing prefixes/suffixes.",
      "coreTemplate": "const seen = new Map();\nfor (let i = 0; i < nums.length; i++) {\n  const complement = target - nums[i];\n  if (seen.has(complement)) return [seen.get(complement), i];\n  seen.set(nums[i], i);\n}",
      "pitfalls": "Watch out for integer overflow, mutating arrays while iterating, or neglecting duplicate elements."
    }
  },
  {
    "id": "dsa-valid-anagram",
    "title": "Valid Anagram",
    "titleSlug": "valid-anagram",
    "url": "https://leetcode.com/problems/valid-anagram/",
    "difficulty": "Easy",
    "pattern": "Arrays & Hashing",
    "tags": [
      "Strings",
      "HashMap",
      "Sorting"
    ],
    "companies": [
      "Uber",
      "Google",
      "Amazon",
      "Bloomberg"
    ],
    "description": "Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    "examples": [
      {
        "input": "s = \"anagram\", t = \"nagaram\"",
        "output": "true"
      },
      {
        "input": "s = \"rat\", t = \"car\"",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= s.length, t.length <= 5 * 10^4",
      "s and t consist of lowercase English letters."
    ],
    "starterCode": {
      "Java": "class Solution {\n    public boolean isAnagram(String s, String t) {\n        return false;\n    }\n}",
      "Python": "class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        pass",
      "TypeScript": "function isAnagram(s: string, t: string): boolean {\n    return false;\n}",
      "C++": "class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        return false;\n    }\n};",
      "Go": "func isAnagram(s string, t string) bool {\n    return false\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Length Check",
        "content": "If s and t have different lengths, can they ever be anagrams?"
      },
      {
        "level": 2,
        "title": "Character Counting",
        "content": "Count the frequency of each letter in s and decrement with each letter in t using a fixed-size integer array of size 26."
      },
      {
        "level": 3,
        "title": "Zero Balance Invariant",
        "content": "If all counts return to zero, the strings contain identical character distributions."
      }
    ],
    "solution": {
      "intuition": "Two strings are anagrams if and only if they possess identical character frequencies.",
      "approach": "First verify lengths match. Use an array of size 26 for English letters. Increment counts for characters in s and decrement for characters in t. If any count is non-zero, return false.",
      "timeComplexity": "O(N) where N is the length of strings.",
      "spaceComplexity": "O(1) because alphabet size is fixed at 26 characters.",
      "keyTakeaway": "Fixed-size frequency arrays outperform generic HashMaps when alphabet size is bounded.",
      "code": {
        "Java": "class Solution {\n    public boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] count = new int[26];\n        for (int i = 0; i < s.length(); i++) {\n            count[s.charAt(i) - 'a']++;\n            count[t.charAt(i) - 'a']--;\n        }\n        for (int c : count) {\n            if (c != 0) return false;\n        }\n        return true;\n    }\n}",
        "Python": "class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        if len(s) != len(t): return False\n        counts = [0] * 26\n        for c1, c2 in zip(s, t):\n            counts[ord(c1) - ord('a')] += 1\n            counts[ord(c2) - ord('a')] -= 1\n        return all(c == 0 for c in counts)",
        "TypeScript": "function isAnagram(s: string, t: string): boolean {\n    if (s.length !== t.length) return false;\n    const count = new Array(26).fill(0);\n    const codeA = 'a'.charCodeAt(0);\n    for (let i = 0; i < s.length; i++) {\n        count[s.charCodeAt(i) - codeA]++;\n        count[t.charCodeAt(i) - codeA]--;\n    }\n    return count.every(c => c === 0);\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Look for frequency counts, duplicates, lookup in O(1) time, or pre-computing prefixes/suffixes.",
      "coreTemplate": "const seen = new Map();\nfor (let i = 0; i < nums.length; i++) {\n  const complement = target - nums[i];\n  if (seen.has(complement)) return [seen.get(complement), i];\n  seen.set(nums[i], i);\n}",
      "pitfalls": "Watch out for integer overflow, mutating arrays while iterating, or neglecting duplicate elements."
    }
  },
  {
    "id": "dsa-group-anagrams",
    "title": "Group Anagrams",
    "titleSlug": "group-anagrams",
    "url": "https://leetcode.com/problems/group-anagrams/",
    "difficulty": "Medium",
    "pattern": "Arrays & Hashing",
    "tags": [
      "Arrays",
      "HashMap",
      "Strings"
    ],
    "companies": [
      "Amazon",
      "Microsoft",
      "Apple",
      "Meta"
    ],
    "description": "Given an array of strings strs, group the anagrams together. You can return the answer in any order.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    "examples": [
      {
        "input": "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]",
        "output": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]"
      },
      {
        "input": "strs = [\"\"]",
        "output": "[[\"\"]]"
      }
    ],
    "constraints": [
      "1 <= strs.length <= 10^4",
      "0 <= strs[i].length <= 100",
      "strs[i] consists of lowercase English letters."
    ],
    "starterCode": {
      "Java": "class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        return new ArrayList<>();\n    }\n}",
      "Python": "class Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        pass",
      "TypeScript": "function groupAnagrams(strs: string[]): string[][] {\n    return [];\n}",
      "C++": "class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        return {};\n    }\n};",
      "Go": "func groupAnagrams(strs []string) [][]string {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Canonical Representation",
        "content": "What property do all anagrams share? When sorted alphabetically, they produce identical strings."
      },
      {
        "level": 2,
        "title": "Categorization by Key",
        "content": "Use the sorted version of each string (or a 26-element tuple of counts) as the key in a HashMap."
      },
      {
        "level": 3,
        "title": "Collecting Buckets",
        "content": "Append each word to the list matching its canonical key, then return all values of the map."
      }
    ],
    "solution": {
      "intuition": "Sort each string to obtain its canonical anagram key. Group all words sharing the same key in a HashMap.",
      "approach": "Create a HashMap mapping canonical string keys to lists of original strings. For each word, sort its characters to form the key. Append the word to map.get(key). Finally return list of map values.",
      "timeComplexity": "O(N * K log K) where N is number of words and K is max word length.",
      "spaceComplexity": "O(N * K) to store the grouped strings.",
      "keyTakeaway": "Grouping equivalence classes in datasets is best done via canonical key hashing.",
      "code": {
        "Java": "import java.util.*;\nclass Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        Map<String, List<String>> map = new HashMap<>();\n        for (String s : strs) {\n            char[] ca = s.toCharArray();\n            Arrays.sort(ca);\n            String key = String.valueOf(ca);\n            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);\n        }\n        return new ArrayList<>(map.values());\n    }\n}",
        "Python": "from collections import defaultdict\nclass Solution:\n    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:\n        groups = defaultdict(list)\n        for s in strs:\n            key = \"\".join(sorted(s))\n            groups[key].append(s)\n        return list(groups.values())",
        "TypeScript": "function groupAnagrams(strs: string[]): string[][] {\n    const map = new Map<string, string[]>();\n    for (const s of strs) {\n        const key = s.split('').sort().join('');\n        if (!map.has(key)) map.set(key, []);\n        map.get(key)!.push(s);\n    }\n    return Array.from(map.values());\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Look for frequency counts, duplicates, lookup in O(1) time, or pre-computing prefixes/suffixes.",
      "coreTemplate": "const seen = new Map();\nfor (let i = 0; i < nums.length; i++) {\n  const complement = target - nums[i];\n  if (seen.has(complement)) return [seen.get(complement), i];\n  seen.set(nums[i], i);\n}",
      "pitfalls": "Watch out for integer overflow, mutating arrays while iterating, or neglecting duplicate elements."
    }
  },
  {
    "id": "dsa-top-k-frequent-elements",
    "title": "Top K Frequent Elements",
    "titleSlug": "top-k-frequent-elements",
    "url": "https://leetcode.com/problems/top-k-frequent-elements/",
    "difficulty": "Medium",
    "pattern": "Arrays & Hashing",
    "tags": [
      "Arrays",
      "HashMap",
      "Heap",
      "Bucket Sort"
    ],
    "companies": [
      "Meta",
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "description": "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.",
    "examples": [
      {
        "input": "nums = [1,1,1,2,2,3], k = 2",
        "output": "[1,2]"
      },
      {
        "input": "nums = [1], k = 1",
        "output": "[1]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4",
      "k is in range [1, unique elements]."
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        return new int[0];\n    }\n}",
      "Python": "class Solution:\n    def topKFrequent(self, nums: List[int], k: int) -> List[int]:\n        pass",
      "TypeScript": "function topKFrequent(nums: number[], k: number): number[] {\n    return [];\n}",
      "C++": "class Solution {\npublic:\n    vector<int> topKFrequent(vector<int>& nums, int k) {\n        return {};\n    }\n};",
      "Go": "func topKFrequent(nums []int, k int) []int {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Count Frequencies",
        "content": "Use a Hash Table to map each number to its count."
      },
      {
        "level": 2,
        "title": "Bucket Sort by Frequency",
        "content": "Create an array of lists where bucket[f] holds all numbers that appear with frequency f."
      },
      {
        "level": 3,
        "title": "Linear Output Collection",
        "content": "Iterate from bucket[nums.length] downward, taking elements until k are collected."
      }
    ],
    "solution": {
      "intuition": "Bucket sort achieves O(N) linear time because the maximum possible frequency of any element cannot exceed N.",
      "approach": "Build frequency map. Create buckets where index is frequency. Place each number into bucket corresponding to its count. Traverse buckets from right to left and collect k numbers.",
      "timeComplexity": "O(N) - linear frequency counting and bucket scan.",
      "spaceComplexity": "O(N) - storing elements in map and buckets.",
      "keyTakeaway": "When values or counts are bounded by array length, Bucket Sort beats O(N log K) heap-based approaches.",
      "code": {
        "Java": "import java.util.*;\nclass Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        Map<Integer, Integer> count = new HashMap<>();\n        for (int n : nums) count.put(n, count.getOrDefault(n, 0) + 1);\n        List<Integer>[] bucket = new List[nums.length + 1];\n        for (int key : count.keySet()) {\n            int freq = count.get(key);\n            if (bucket[freq] == null) bucket[freq] = new ArrayList<>();\n            bucket[freq].add(key);\n        }\n        int[] res = new int[k];\n        int idx = 0;\n        for (int i = bucket.length - 1; i >= 0 && idx < k; i--) {\n            if (bucket[i] != null) {\n                for (int n : bucket[i]) {\n                    res[idx++] = n;\n                    if (idx == k) break;\n                }\n            }\n        }\n        return res;\n    }\n}",
        "Python": "from collections import Counter\nclass Solution:\n    def topKFrequent(self, nums: list[int], k: int) -> list[int]:\n        count = Counter(nums)\n        buckets = [[] for _ in range(len(nums) + 1)]\n        for num, freq in count.items():\n            buckets[freq].append(num)\n        res = []\n        for i in range(len(buckets) - 1, 0, -1):\n            for num in buckets[i]:\n                res.append(num)\n                if len(res) == k: return res\n        return res",
        "TypeScript": "function topKFrequent(nums: number[], k: number): number[] {\n    const count = new Map<number, number>();\n    for (const n of nums) count.set(n, (count.get(n) || 0) + 1);\n    const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => []);\n    for (const [num, freq] of count.entries()) {\n        buckets[freq].push(num);\n    }\n    const res: number[] = [];\n    for (let i = buckets.length - 1; i > 0 && res.length < k; i--) {\n        for (const num of buckets[i]) {\n            res.push(num);\n            if (res.length === k) return res;\n        }\n    }\n    return res;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Look for frequency counts, duplicates, lookup in O(1) time, or pre-computing prefixes/suffixes.",
      "coreTemplate": "const seen = new Map();\nfor (let i = 0; i < nums.length; i++) {\n  const complement = target - nums[i];\n  if (seen.has(complement)) return [seen.get(complement), i];\n  seen.set(nums[i], i);\n}",
      "pitfalls": "Watch out for integer overflow, mutating arrays while iterating, or neglecting duplicate elements."
    }
  },
  {
    "id": "dsa-product-of-array-except-self",
    "title": "Product of Array Except Self",
    "titleSlug": "product-of-array-except-self",
    "url": "https://leetcode.com/problems/product-of-array-except-self/",
    "difficulty": "Medium",
    "pattern": "Arrays & Hashing",
    "tags": [
      "Arrays",
      "Prefix Sum"
    ],
    "companies": [
      "Amazon",
      "Apple",
      "Meta",
      "Microsoft",
      "Google"
    ],
    "description": "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].\n\nYou must write an algorithm that runs in O(n) time and without using the division operation.",
    "examples": [
      {
        "input": "nums = [1,2,3,4]",
        "output": "[24,12,8,6]"
      },
      {
        "input": "nums = [-1,1,0,-3,3]",
        "output": "[0,0,9,0,0]"
      }
    ],
    "constraints": [
      "2 <= nums.length <= 10^5",
      "-30 <= nums[i] <= 30"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        return new int[0];\n    }\n}",
      "Python": "class Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        pass",
      "TypeScript": "function productExceptSelf(nums: number[]): number[] {\n    return [];\n}",
      "C++": "class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        return {};\n    }\n};",
      "Go": "func productExceptSelf(nums []int) []int {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Prefix and Suffix Decomposition",
        "content": "For any index i, the product except self is equal to (product of elements before i) * (product of elements after i)."
      },
      {
        "level": 2,
        "title": "Prefix Array",
        "content": "Build a prefix product array where prefix[i] stores the product of all elements to the left of i."
      },
      {
        "level": 3,
        "title": "O(1) Extra Space Trick",
        "content": "Use the output array to store prefix products, then iterate backward maintaining a running suffix variable."
      }
    ],
    "solution": {
      "intuition": "Every answer[i] is the product of elements to its left multiplied by elements to its right. We compute left products first, then multiply by running right products.",
      "approach": "1. Initialize result array with res[0] = 1.\n2. In a left-to-right pass, compute res[i] = res[i-1] * nums[i-1].\n3. In a right-to-left pass, keep a running variable `suffix = 1`. Multiply res[i] *= suffix and update suffix *= nums[i].",
      "timeComplexity": "O(N) - two linear passes.",
      "spaceComplexity": "O(1) auxiliary space (output array does not count toward space complexity).",
      "keyTakeaway": "Combining forward and backward accumulators solves \"all except current\" problems without division.",
      "code": {
        "Java": "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        int n = nums.length;\n        int[] res = new int[n];\n        res[0] = 1;\n        for (int i = 1; i < n; i++) res[i] = res[i - 1] * nums[i - 1];\n        int suffix = 1;\n        for (int i = n - 1; i >= 0; i--) {\n            res[i] *= suffix;\n            suffix *= nums[i];\n        }\n        return res;\n    }\n}",
        "Python": "class Solution:\n    def productExceptSelf(self, nums: list[int]) -> list[int]:\n        n = len(nums)\n        res = [1] * n\n        for i in range(1, n): res[i] = res[i - 1] * nums[i - 1]\n        suffix = 1\n        for i in range(n - 1, -1, -1):\n            res[i] *= suffix\n            suffix *= nums[i]\n        return res",
        "TypeScript": "function productExceptSelf(nums: number[]): number[] {\n    const n = nums.length;\n    const res = new Array(n).fill(1);\n    for (let i = 1; i < n; i++) res[i] = res[i - 1] * nums[i - 1];\n    let suffix = 1;\n    for (let i = n - 1; i >= 0; i--) {\n        res[i] *= suffix;\n        suffix *= nums[i];\n    }\n    return res;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Look for frequency counts, duplicates, lookup in O(1) time, or pre-computing prefixes/suffixes.",
      "coreTemplate": "const seen = new Map();\nfor (let i = 0; i < nums.length; i++) {\n  const complement = target - nums[i];\n  if (seen.has(complement)) return [seen.get(complement), i];\n  seen.set(nums[i], i);\n}",
      "pitfalls": "Watch out for integer overflow, mutating arrays while iterating, or neglecting duplicate elements."
    }
  },
  {
    "id": "dsa-longest-consecutive-sequence",
    "title": "Longest Consecutive Sequence",
    "titleSlug": "longest-consecutive-sequence",
    "url": "https://leetcode.com/problems/longest-consecutive-sequence/",
    "difficulty": "Medium",
    "pattern": "Arrays & Hashing",
    "tags": [
      "Arrays",
      "HashSet"
    ],
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Spotify"
    ],
    "description": "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.\n\nYou must write an algorithm that runs in O(n) time.",
    "examples": [
      {
        "input": "nums = [100,4,200,1,3,2]",
        "output": "4",
        "explanation": "The longest consecutive elements sequence is [1, 2, 3, 4]."
      },
      {
        "input": "nums = [0,3,7,2,5,8,4,6,0,1]",
        "output": "9"
      }
    ],
    "constraints": [
      "0 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int longestConsecutive(int[] nums) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def longestConsecutive(self, nums: List[int]) -> int:\n        pass",
      "TypeScript": "function longestConsecutive(nums: number[]): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int longestConsecutive(vector<int>& nums) {\n        return 0;\n    }\n};",
      "Go": "func longestConsecutive(nums []int) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "HashSet O(1) Membership",
        "content": "Put all numbers into a HashSet to allow O(1) existence checks."
      },
      {
        "level": 2,
        "title": "Detecting Sequence Starts",
        "content": "A number num is the start of a sequence only if num - 1 is NOT present in the set."
      },
      {
        "level": 3,
        "title": "Counting Forward",
        "content": "If num is a sequence start, count forward num + 1, num + 2... until missing. Because each number is visited at most twice, this is overall O(N)."
      }
    ],
    "solution": {
      "intuition": "Only start counting sequences at numbers that do not have a predecessor (num - 1). This ensures every element is part of at most one forward search.",
      "approach": "1. Store all numbers in a HashSet.\n2. Loop through the set. If num - 1 is not in the set, num is the beginning of a streak.\n3. Increment streak while set contains currentNum + 1.\n4. Track and return the maximum streak observed.",
      "timeComplexity": "O(N) - each number is checked at most twice.",
      "spaceComplexity": "O(N) - storage for the HashSet.",
      "keyTakeaway": "Avoid redundant work by identifying unique entry points (starts of sequences) before traversing.",
      "code": {
        "Java": "import java.util.*;\nclass Solution {\n    public int longestConsecutive(int[] nums) {\n        Set<Integer> set = new HashSet<>();\n        for (int n : nums) set.add(n);\n        int longest = 0;\n        for (int n : set) {\n            if (!set.contains(n - 1)) {\n                int current = n, streak = 1;\n                while (set.contains(current + 1)) {\n                    current++;\n                    streak++;\n                }\n                longest = Math.max(longest, streak);\n            }\n        }\n        return longest;\n    }\n}",
        "Python": "class Solution:\n    def longestConsecutive(self, nums: list[int]) -> int:\n        num_set = set(nums)\n        longest = 0\n        for n in num_set:\n            if n - 1 not in num_set:\n                curr = n\n                streak = 1\n                while curr + 1 in num_set:\n                    curr += 1\n                    streak += 1\n                longest = max(longest, streak)\n        return longest",
        "TypeScript": "function longestConsecutive(nums: number[]): number {\n    const set = new Set(nums);\n    let longest = 0;\n    for (const n of set) {\n        if (!set.has(n - 1)) {\n            let current = n, streak = 1;\n            while (set.has(current + 1)) {\n                current++;\n                streak++;\n            }\n            longest = Math.max(longest, streak);\n        }\n    }\n    return longest;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Look for frequency counts, duplicates, lookup in O(1) time, or pre-computing prefixes/suffixes.",
      "coreTemplate": "const seen = new Map();\nfor (let i = 0; i < nums.length; i++) {\n  const complement = target - nums[i];\n  if (seen.has(complement)) return [seen.get(complement), i];\n  seen.set(nums[i], i);\n}",
      "pitfalls": "Watch out for integer overflow, mutating arrays while iterating, or neglecting duplicate elements."
    }
  },
  {
    "id": "dsa-valid-palindrome",
    "title": "Valid Palindrome",
    "titleSlug": "valid-palindrome",
    "url": "https://leetcode.com/problems/valid-palindrome/",
    "difficulty": "Easy",
    "pattern": "Two Pointers",
    "tags": [
      "Strings",
      "Two Pointers"
    ],
    "companies": [
      "Meta",
      "Microsoft",
      "Amazon",
      "Apple"
    ],
    "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.",
    "examples": [
      {
        "input": "s = \"A man, a plan, a canal: Panama\"",
        "output": "true"
      },
      {
        "input": "s = \"race a car\"",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= s.length <= 2 * 10^5"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public boolean isPalindrome(String s) {\n        return false;\n    }\n}",
      "Python": "class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        pass",
      "TypeScript": "function isPalindrome(s: string): boolean {\n    return false;\n}",
      "C++": "class Solution {\npublic:\n    bool isPalindrome(string s) {\n        return false;\n    }\n};",
      "Go": "func isPalindrome(s string) bool {\n    return false\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Two Pointers Setup",
        "content": "Place one pointer at index 0 and another pointer at index s.length - 1."
      },
      {
        "level": 2,
        "title": "Skipping Non-Alphanumeric",
        "content": "Advance left pointer if character is not letter or digit. Decrement right pointer if not letter or digit."
      },
      {
        "level": 3,
        "title": "Comparison",
        "content": "Compare lowercased characters at both pointers. If they differ, return false."
      }
    ],
    "solution": {
      "intuition": "Compare outer characters working inward, skipping any non-alphanumeric symbols in place without extra string allocations.",
      "approach": "Initialize left = 0, right = s.length - 1. While left < right, skip non-alphanumeric characters. Compare lowercased values. If mismatch, return false; otherwise left++, right--. Return true when pointers cross.",
      "timeComplexity": "O(N) - each character is visited at most twice.",
      "spaceComplexity": "O(1) - in-place pointer scanning without allocating new strings.",
      "keyTakeaway": "Two pointers converging from ends is the canonical pattern for palindrome validation.",
      "code": {
        "Java": "class Solution {\n    public boolean isPalindrome(String s) {\n        int l = 0, r = s.length() - 1;\n        while (l < r) {\n            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;\n            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;\n            if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;\n            l++; r--;\n        }\n        return true;\n    }\n}",
        "Python": "class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        l, r = 0, len(s) - 1\n        while l < r:\n            while l < r and not s[l].isalnum(): l += 1\n            while l < r and not s[r].isalnum(): r -= 1\n            if s[l].lower() != s[r].lower(): return False\n            l += 1; r -= 1\n        return True",
        "TypeScript": "function isPalindrome(s: string): boolean {\n    let l = 0, r = s.length - 1;\n    const isAlnum = (c: string) => /[a-z0-9]/i.test(c);\n    while (l < r) {\n        while (l < r && !isAlnum(s[l])) l++;\n        while (l < r && !isAlnum(s[r])) r--;\n        if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;\n        l++; r--;\n    }\n    return true;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Applicable on sorted arrays or palindromic strings where two indices converge or move in tandem to search a pair in O(N) instead of O(N^2).",
      "coreTemplate": "let left = 0, right = arr.length - 1;\nwhile (left < right) {\n  const sum = arr[left] + arr[right];\n  if (sum === target) return [left, right];\n  else if (sum < target) left++;\n  else right--;\n}",
      "pitfalls": "Be mindful of off-by-one errors in loop conditions (left < right vs left <= right) and skipping duplicate elements properly."
    }
  },
  {
    "id": "dsa-two-sum-ii",
    "title": "Two Sum II",
    "titleSlug": "two-sum-ii-input-array-is-sorted",
    "url": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
    "difficulty": "Medium",
    "pattern": "Two Pointers",
    "tags": [
      "Arrays",
      "Two Pointers",
      "Binary Search"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "description": "Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.\n\nReturn [index1, index2] of length 2 where 1 <= index1 < index2 <= numbers.length.",
    "examples": [
      {
        "input": "numbers = [2,7,11,15], target = 9",
        "output": "[1,2]"
      },
      {
        "input": "numbers = [2,3,4], target = 6",
        "output": "[1,3]"
      }
    ],
    "constraints": [
      "2 <= numbers.length <= 3 * 10^4",
      "numbers is sorted in non-decreasing order."
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        return new int[0];\n    }\n}",
      "Python": "class Solution:\n    def twoSum(self, numbers: List[int], target: int) -> List[int]:\n        pass",
      "TypeScript": "function twoSum(numbers: number[], target: number): number[] {\n    return [];\n}",
      "C++": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& numbers, int target) {\n        return {};\n    }\n};",
      "Go": "func twoSum(numbers []int, target int) []int {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Exploit Sortedness",
        "content": "Because the array is sorted, the sum of outer elements indicates which pointer to advance."
      },
      {
        "level": 2,
        "title": "Inward Movement",
        "content": "If sum > target, right pointer must decrease. If sum < target, left pointer must increase."
      },
      {
        "level": 3,
        "title": "1-Based Indexing",
        "content": "Add 1 to indices upon returning."
      }
    ],
    "solution": {
      "intuition": "Sorted property enables two converging pointers to eliminate half the search space on each comparison in O(1) space.",
      "approach": "Set left = 0, right = numbers.length - 1. Calculate sum = numbers[left] + numbers[right]. If sum === target, return [left + 1, right + 1]. If sum < target, left++. If sum > target, right--.",
      "timeComplexity": "O(N) - each step moves one pointer closer.",
      "spaceComplexity": "O(1) - strictly constant memory.",
      "keyTakeaway": "Sorted input arrays should immediately bring two pointers or binary search to mind.",
      "code": {
        "Java": "class Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        int l = 0, r = numbers.length - 1;\n        while (l < r) {\n            int sum = numbers[l] + numbers[r];\n            if (sum == target) return new int[]{ l + 1, r + 1 };\n            else if (sum < target) l++;\n            else r--;\n        }\n        return new int[0];\n    }\n}",
        "Python": "class Solution:\n    def twoSum(self, numbers: list[int], target: int) -> list[int]:\n        l, r = 0, len(numbers) - 1\n        while l < r:\n            s = numbers[l] + numbers[r]\n            if s == target: return [l + 1, r + 1]\n            elif s < target: l += 1\n            else: r -= 1\n        return []",
        "TypeScript": "function twoSum(numbers: number[], target: number): number[] {\n    let l = 0, r = numbers.length - 1;\n    while (l < r) {\n        const sum = numbers[l] + numbers[r];\n        if (sum === target) return [l + 1, r + 1];\n        else if (sum < target) l++;\n        else r--;\n    }\n    return [];\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Applicable on sorted arrays or palindromic strings where two indices converge or move in tandem to search a pair in O(N) instead of O(N^2).",
      "coreTemplate": "let left = 0, right = arr.length - 1;\nwhile (left < right) {\n  const sum = arr[left] + arr[right];\n  if (sum === target) return [left, right];\n  else if (sum < target) left++;\n  else right--;\n}",
      "pitfalls": "Be mindful of off-by-one errors in loop conditions (left < right vs left <= right) and skipping duplicate elements properly."
    }
  },
  {
    "id": "dsa-3sum",
    "title": "3Sum",
    "titleSlug": "3sum",
    "url": "https://leetcode.com/problems/3sum/",
    "difficulty": "Medium",
    "pattern": "Two Pointers",
    "tags": [
      "Arrays",
      "Two Pointers",
      "Sorting"
    ],
    "companies": [
      "Meta",
      "Amazon",
      "Apple",
      "Google"
    ],
    "description": "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nNotice that the solution set must not contain duplicate triplets.",
    "examples": [
      {
        "input": "nums = [-1,0,1,2,-1,-4]",
        "output": "[[-1,-1,2],[-1,0,1]]"
      },
      {
        "input": "nums = [0,1,1]",
        "output": "[]"
      }
    ],
    "constraints": [
      "3 <= nums.length <= 3000",
      "-10^5 <= nums[i] <= 10^5"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        return new ArrayList<>();\n    }\n}",
      "Python": "class Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        pass",
      "TypeScript": "function threeSum(nums: number[]): number[][] {\n    return [];\n}",
      "C++": "class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        return {};\n    }\n};",
      "Go": "func threeSum(nums []int) [][]int {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Sort First",
        "content": "Sort the array so we can fix one element and use Two Sum II on the remaining subarray."
      },
      {
        "level": 2,
        "title": "Fixing nums[i]",
        "content": "For each i, search for pairs (left, right) such that nums[left] + nums[right] == -nums[i]."
      },
      {
        "level": 3,
        "title": "Skipping Duplicates",
        "content": "Skip identical adjacent values for both i, left, and right to avoid duplicate triplets in the result."
      }
    ],
    "solution": {
      "intuition": "Sort the array. Fix each element nums[i] as a target for a two-pointer subproblem on indices i+1 to end.",
      "approach": "Sort nums. Iterate i from 0 to n-3. If i > 0 and nums[i] === nums[i-1], continue to skip duplicates. For each i, run two pointers l = i+1, r = n-1. If sum is 0, add triplet to result and advance l and r skipping identical elements. If sum < 0, l++; if sum > 0, r--.",
      "timeComplexity": "O(N^2) - sorting takes O(N log N), followed by N two-pointer scans taking O(N) each.",
      "spaceComplexity": "O(log N) to O(N) depending on language sorting implementation.",
      "keyTakeaway": "Reduce K-Sum problems to (K-1)-Sum until reaching the standard Two-Pointer base case.",
      "code": {
        "Java": "import java.util.*;\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        Arrays.sort(nums);\n        List<List<Integer>> res = new ArrayList<>();\n        for (int i = 0; i < nums.length - 2; i++) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n            int l = i + 1, r = nums.length - 1;\n            while (l < r) {\n                int sum = nums[i] + nums[l] + nums[r];\n                if (sum == 0) {\n                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));\n                    while (l < r && nums[l] == nums[l + 1]) l++;\n                    while (l < r && nums[r] == nums[r - 1]) r--;\n                    l++; r--;\n                } else if (sum < 0) l++;\n                else r--;\n            }\n        }\n        return res;\n    }\n}",
        "Python": "class Solution:\n    def threeSum(self, nums: list[int]) -> list[list[int]]:\n        nums.sort()\n        res = []\n        for i in range(len(nums) - 2):\n            if i > 0 and nums[i] == nums[i - 1]: continue\n            l, r = i + 1, len(nums) - 1\n            while l < r:\n                s = nums[i] + nums[l] + nums[r]\n                if s == 0:\n                    res.append([nums[i], nums[l], nums[r]])\n                    while l < r and nums[l] == nums[l + 1]: l += 1\n                    while l < r and nums[r] == nums[r - 1]: r -= 1\n                    l += 1; r -= 1\n                elif s < 0: l += 1\n                else: r -= 1\n        return res",
        "TypeScript": "function threeSum(nums: number[]): number[][] {\n    nums.sort((a, b) => a - b);\n    const res: number[][] = [];\n    for (let i = 0; i < nums.length - 2; i++) {\n        if (i > 0 && nums[i] === nums[i - 1]) continue;\n        let l = i + 1, r = nums.length - 1;\n        while (l < r) {\n            const sum = nums[i] + nums[l] + nums[r];\n            if (sum === 0) {\n                res.push([nums[i], nums[l], nums[r]]);\n                while (l < r && nums[l] === nums[l + 1]) l++;\n                while (l < r && nums[r] === nums[r - 1]) r--;\n                l++; r--;\n            } else if (sum < 0) l++;\n            else r--;\n        }\n    }\n    return res;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Applicable on sorted arrays or palindromic strings where two indices converge or move in tandem to search a pair in O(N) instead of O(N^2).",
      "coreTemplate": "let left = 0, right = arr.length - 1;\nwhile (left < right) {\n  const sum = arr[left] + arr[right];\n  if (sum === target) return [left, right];\n  else if (sum < target) left++;\n  else right--;\n}",
      "pitfalls": "Be mindful of off-by-one errors in loop conditions (left < right vs left <= right) and skipping duplicate elements properly."
    }
  },
  {
    "id": "dsa-container-with-most-water",
    "title": "Container With Most Water",
    "titleSlug": "container-with-most-water",
    "url": "https://leetcode.com/problems/container-with-most-water/",
    "difficulty": "Medium",
    "pattern": "Two Pointers",
    "tags": [
      "Arrays",
      "Two Pointers",
      "Greedy"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Adobe"
    ],
    "description": "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.",
    "examples": [
      {
        "input": "height = [1,8,6,2,5,4,8,3,7]",
        "output": "49"
      },
      {
        "input": "height = [1,1]",
        "output": "1"
      }
    ],
    "constraints": [
      "2 <= n <= 10^5",
      "0 <= height[i] <= 10^4"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int maxArea(int[] height) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def maxArea(self, height: List[int]) -> int:\n        pass",
      "TypeScript": "function maxArea(height: number[]): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        return 0;\n    }\n};",
      "Go": "func maxArea(height []int) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Area Formula",
        "content": "Area = min(height[left], height[right]) * (right - left)."
      },
      {
        "level": 2,
        "title": "Greedy Movement",
        "content": "Starting at widest width (left = 0, right = n - 1), which pointer should we move inward to have any hope of finding a larger area?"
      },
      {
        "level": 3,
        "title": "Move the Shorter Line",
        "content": "The area is bounded by the shorter line. Moving the taller line inward only reduces width without increasing height. Moving the shorter line is the only way to find a taller boundary."
      }
    ],
    "solution": {
      "intuition": "Maximize width first, then greedily advance the pointer with the smaller height in hopes of discovering a taller wall.",
      "approach": "Set left = 0, right = height.length - 1. Calculate area = min(height[left], height[right]) * (right - left) and update maxArea. Advance the pointer with the smaller height. Repeat until pointers meet.",
      "timeComplexity": "O(N) - each step moves one pointer inward.",
      "spaceComplexity": "O(1) - constant auxiliary variables.",
      "keyTakeaway": "The bottleneck of a container is its shorter boundary. Shifting the taller one can never increase area.",
      "code": {
        "Java": "class Solution {\n    public int maxArea(int[] height) {\n        int l = 0, r = height.length - 1, max = 0;\n        while (l < r) {\n            int h = Math.min(height[l], height[r]);\n            max = Math.max(max, h * (r - l));\n            if (height[l] < height[r]) l++;\n            else r--;\n        }\n        return max;\n    }\n}",
        "Python": "class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        l, r = 0, len(height) - 1\n        max_water = 0\n        while l < r:\n            h = min(height[l], height[r])\n            max_water = max(max_water, h * (r - l))\n            if height[l] < height[r]: l += 1\n            else: r -= 1\n        return max_water",
        "TypeScript": "function maxArea(height: number[]): number {\n    let l = 0, r = height.length - 1, max = 0;\n    while (l < r) {\n        const h = Math.min(height[l], height[r]);\n        max = Math.max(max, h * (r - l));\n        if (height[l] < height[r]) l++;\n        else r--;\n    }\n    return max;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Applicable on sorted arrays or palindromic strings where two indices converge or move in tandem to search a pair in O(N) instead of O(N^2).",
      "coreTemplate": "let left = 0, right = arr.length - 1;\nwhile (left < right) {\n  const sum = arr[left] + arr[right];\n  if (sum === target) return [left, right];\n  else if (sum < target) left++;\n  else right--;\n}",
      "pitfalls": "Be mindful of off-by-one errors in loop conditions (left < right vs left <= right) and skipping duplicate elements properly."
    }
  },
  {
    "id": "dsa-trapping-rain-water",
    "title": "Trapping Rain Water",
    "titleSlug": "trapping-rain-water",
    "url": "https://leetcode.com/problems/trapping-rain-water/",
    "difficulty": "Hard",
    "pattern": "Two Pointers",
    "tags": [
      "Arrays",
      "Two Pointers",
      "Dynamic Programming",
      "Monotonic Stack"
    ],
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Goldman Sachs"
    ],
    "description": "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    "examples": [
      {
        "input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        "output": "6"
      },
      {
        "input": "height = [4,2,0,3,2,5]",
        "output": "9"
      }
    ],
    "constraints": [
      "n == height.length",
      "1 <= n <= 2 * 10^4",
      "0 <= height[i] <= 10^5"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int trap(int[] height) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def trap(self, height: List[int]) -> int:\n        pass",
      "TypeScript": "function trap(height: number[]): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int trap(vector<int>& height) {\n        return 0;\n    }\n};",
      "Go": "func trap(height []int) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Water per Column",
        "content": "Water trapped above column i is determined by min(maxLeft, maxRight) - height[i]."
      },
      {
        "level": 2,
        "title": "Two Pointers Optimization",
        "content": "Instead of precomputing arrays for maxLeft and maxRight, maintain running leftMax and rightMax with two pointers."
      },
      {
        "level": 3,
        "title": "Advancing the Lower Max",
        "content": "If leftMax < rightMax, the bottleneck at left is leftMax regardless of unseen heights to its right. We can safely process left and increment."
      }
    ],
    "solution": {
      "intuition": "The amount of water above any column is governed by the minimum of the highest wall to its left and right.",
      "approach": "Maintain two pointers l = 0, r = n - 1 and leftMax, rightMax. If leftMax < rightMax, water above l is leftMax - height[l], then advance l. Otherwise water above r is rightMax - height[r], then advance r.",
      "timeComplexity": "O(N) - single pass over the elevation array.",
      "spaceComplexity": "O(1) - two pointers and two max trackers.",
      "keyTakeaway": "When the bottleneck is on one side, you can compute water locally without knowing the exact peak on the other side.",
      "code": {
        "Java": "class Solution {\n    public int trap(int[] height) {\n        int l = 0, r = height.length - 1;\n        int leftMax = 0, rightMax = 0, water = 0;\n        while (l < r) {\n            if (height[l] < height[r]) {\n                if (height[l] >= leftMax) leftMax = height[l];\n                else water += leftMax - height[l];\n                l++;\n            } else {\n                if (height[r] >= rightMax) rightMax = height[r];\n                else water += rightMax - height[r];\n                r--;\n            }\n        }\n        return water;\n    }\n}",
        "Python": "class Solution:\n    def trap(self, height: list[int]) -> int:\n        l, r = 0, len(height) - 1\n        l_max, r_max = 0, 0\n        water = 0\n        while l < r:\n            if height[l] < height[r]:\n                if height[l] >= l_max: l_max = height[l]\n                else: water += l_max - height[l]\n                l += 1\n            else:\n                if height[r] >= r_max: r_max = height[r]\n                else: water += r_max - height[r]\n                r -= 1\n        return water",
        "TypeScript": "function trap(height: number[]): number {\n    let l = 0, r = height.length - 1;\n    let lMax = 0, rMax = 0, water = 0;\n    while (l < r) {\n        if (height[l] < height[r]) {\n            if (height[l] >= lMax) lMax = height[l];\n            else water += lMax - height[l];\n            l++;\n        } else {\n            if (height[r] >= rMax) rMax = height[r];\n            else water += rMax - height[r];\n            r--;\n        }\n    }\n    return water;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Applicable on sorted arrays or palindromic strings where two indices converge or move in tandem to search a pair in O(N) instead of O(N^2).",
      "coreTemplate": "let left = 0, right = arr.length - 1;\nwhile (left < right) {\n  const sum = arr[left] + arr[right];\n  if (sum === target) return [left, right];\n  else if (sum < target) left++;\n  else right--;\n}",
      "pitfalls": "Be mindful of off-by-one errors in loop conditions (left < right vs left <= right) and skipping duplicate elements properly."
    }
  },
  {
    "id": "dsa-best-time-to-buy-and-sell-stock",
    "title": "Best Time to Buy and Sell Stock",
    "titleSlug": "best-time-to-buy-and-sell-stock",
    "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "difficulty": "Easy",
    "pattern": "Sliding Window",
    "tags": [
      "Arrays",
      "Sliding Window",
      "Dynamic Programming"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Apple"
    ],
    "description": "You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    "examples": [
      {
        "input": "prices = [7,1,5,3,6,4]",
        "output": "5"
      },
      {
        "input": "prices = [7,6,4,3,1]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int maxProfit(int[] prices) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        pass",
      "TypeScript": "function maxProfit(prices: number[]): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        return 0;\n    }\n};",
      "Go": "func maxProfit(prices []int) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Single Pass Observation",
        "content": "To maximize profit, you want to sell at price P after having bought at the lowest price seen so far."
      },
      {
        "level": 2,
        "title": "Maintain Running Minimum",
        "content": "Track minPrice seen up to day i. Potential profit today is prices[i] - minPrice."
      },
      {
        "level": 3,
        "title": "Update Best Profit",
        "content": "If prices[i] < minPrice, update minPrice. Otherwise update maxProfit = max(maxProfit, prices[i] - minPrice)."
      }
    ],
    "solution": {
      "intuition": "As we scan forward in time, keep track of the cheapest price seen so far to compute the optimal profit if we sold today.",
      "approach": "Initialize minPrice = Infinity and maxProfit = 0. For each price in prices, if price < minPrice update minPrice = price; else maxProfit = max(maxProfit, price - minPrice).",
      "timeComplexity": "O(N) - single pass through prices.",
      "spaceComplexity": "O(1) - two variables.",
      "keyTakeaway": "The sliding window collapses to maintaining a running minimum boundary.",
      "code": {
        "Java": "class Solution {\n    public int maxProfit(int[] prices) {\n        int min = Integer.MAX_VALUE, maxProfit = 0;\n        for (int p : prices) {\n            if (p < min) min = p;\n            else if (p - min > maxProfit) maxProfit = p - min;\n        }\n        return maxProfit;\n    }\n}",
        "Python": "class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        min_price = float('inf')\n        max_profit = 0\n        for p in prices:\n            if p < min_price: min_price = p\n            else: max_profit = max(max_profit, p - min_price)\n        return max_profit",
        "TypeScript": "function maxProfit(prices: number[]): number {\n    let minPrice = Infinity, maxProfit = 0;\n    for (const p of prices) {\n        if (p < minPrice) minPrice = p;\n        else if (p - minPrice > maxProfit) maxProfit = p - minPrice;\n    }\n    return maxProfit;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Targeting contiguous subarrays or substrings satisfying a condition (e.g. longest substring without repeating characters, min window containing chars).",
      "coreTemplate": "let left = 0, best = 0;\nconst count = new Map();\nfor (let right = 0; right < s.length; right++) {\n  count.set(s[right], (count.get(s[right]) || 0) + 1);\n  while (!isValid(count)) {\n    count.set(s[left], count.get(s[left]) - 1);\n    left++;\n  }\n  best = Math.max(best, right - left + 1);\n}",
      "pitfalls": "Forgetting to decrement counts when moving left pointer, or maintaining state efficiently inside the window."
    }
  },
  {
    "id": "dsa-longest-substring-without-repeating-characters",
    "title": "Longest Substring Without Repeating Characters",
    "titleSlug": "longest-substring-without-repeating-characters",
    "url": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    "difficulty": "Medium",
    "pattern": "Sliding Window",
    "tags": [
      "Strings",
      "Sliding Window",
      "HashMap"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Bloomberg"
    ],
    "description": "Given a string s, find the length of the longest substring without repeating characters.",
    "examples": [
      {
        "input": "s = \"abcabcbb\"",
        "output": "3"
      },
      {
        "input": "s = \"bbbbb\"",
        "output": "1"
      }
    ],
    "constraints": [
      "0 <= s.length <= 5 * 10^4"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        pass",
      "TypeScript": "function lengthOfLongestSubstring(s: string): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n};",
      "Go": "func lengthOfLongestSubstring(s string) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Expand with Right Pointer",
        "content": "Expand the window [left, right] character by character."
      },
      {
        "level": 2,
        "title": "Detecting Repeats",
        "content": "Use a Set or Map storing character to its latest index. If character at right is already in the window, shrink from left."
      },
      {
        "level": 3,
        "title": "Instant Jump Optimization",
        "content": "If you store each character mapped to its last seen index, you can jump left = max(left, map.get(char) + 1) in O(1)."
      }
    ],
    "solution": {
      "intuition": "Maintain a window of unique characters. When a repeat is encountered, advance left past the previous occurrence of that character.",
      "approach": "Use a Map<char, index>. Iterate right from 0 to n-1. If s[right] exists in map with index >= left, update left = map.get(s[right]) + 1. Store map.set(s[right], right). Update maxLength = max(maxLength, right - left + 1).",
      "timeComplexity": "O(N) - right scans once, left only jumps forward.",
      "spaceComplexity": "O(min(M, N)) where M is alphabet size.",
      "keyTakeaway": "Mapping characters to their last seen index allows the left window pointer to jump instead of stepping one by one.",
      "code": {
        "Java": "import java.util.*;\nclass Solution {\n    public int lengthOfLongestSubstring(String s) {\n        Map<Character, Integer> map = new HashMap<>();\n        int max = 0, l = 0;\n        for (int r = 0; r < s.length(); r++) {\n            char c = s.charAt(r);\n            if (map.containsKey(c)) l = Math.max(l, map.get(c) + 1);\n            map.put(c, r);\n            max = Math.max(max, r - l + 1);\n        }\n        return max;\n    }\n}",
        "Python": "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        seen = {}\n        l = 0\n        max_len = 0\n        for r, c in enumerate(s):\n            if c in seen and seen[c] >= l: l = seen[c] + 1\n            seen[c] = r\n            max_len = max(max_len, r - l + 1)\n        return max_len",
        "TypeScript": "function lengthOfLongestSubstring(s: string): number {\n    const map = new Map<string, number>();\n    let maxLen = 0, l = 0;\n    for (let r = 0; r < s.length; r++) {\n        const c = s[r];\n        if (map.has(c) && map.get(c)! >= l) l = map.get(c)! + 1;\n        map.set(c, r);\n        maxLen = Math.max(maxLen, r - l + 1);\n    }\n    return maxLen;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Targeting contiguous subarrays or substrings satisfying a condition (e.g. longest substring without repeating characters, min window containing chars).",
      "coreTemplate": "let left = 0, best = 0;\nconst count = new Map();\nfor (let right = 0; right < s.length; right++) {\n  count.set(s[right], (count.get(s[right]) || 0) + 1);\n  while (!isValid(count)) {\n    count.set(s[left], count.get(s[left]) - 1);\n    left++;\n  }\n  best = Math.max(best, right - left + 1);\n}",
      "pitfalls": "Forgetting to decrement counts when moving left pointer, or maintaining state efficiently inside the window."
    }
  },
  {
    "id": "dsa-longest-repeating-character-replacement",
    "title": "Longest Repeating Character Replacement",
    "titleSlug": "longest-repeating-character-replacement",
    "url": "https://leetcode.com/problems/longest-repeating-character-replacement/",
    "difficulty": "Medium",
    "pattern": "Sliding Window",
    "tags": [
      "Strings",
      "Sliding Window",
      "HashMap"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Uber"
    ],
    "description": "You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times.\n\nReturn the length of the longest substring containing the same letter you can get after performing the above operations.",
    "examples": [
      {
        "input": "s = \"ABAB\", k = 2",
        "output": "4"
      },
      {
        "input": "s = \"AABABBA\", k = 1",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= s.length <= 10^5",
      "0 <= k <= s.length"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int characterReplacement(String s, int k) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def characterReplacement(self, s: str, k: int) -> int:\n        pass",
      "TypeScript": "function characterReplacement(s: string, k: number): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int characterReplacement(string s, int k) {\n        return 0;\n    }\n};",
      "Go": "func characterReplacement(s string, k int) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Window Invariant",
        "content": "In any window of size (right - left + 1), the number of characters we need to replace is windowLength - maxFrequencyInWindow."
      },
      {
        "level": 2,
        "title": "Valid Condition",
        "content": "A window is valid if (right - left + 1) - maxFrequency <= k."
      },
      {
        "level": 3,
        "title": "Shrinking the Window",
        "content": "If invalid, increment left and decrement count[s[left]]. We never need to decrement maxFrequency because a smaller maxFrequency cannot produce a longer valid window."
      }
    ],
    "solution": {
      "intuition": "The best character to keep is the most frequent character in the current window. All other characters must be converted using up to k swaps.",
      "approach": "Track count of each letter in window with count[26] and maxCount seen. For each right pointer, update count[s[right]] and maxCount = max(maxCount, count[s[right]]). If (right - left + 1) - maxCount > k, decrement count[s[left]] and left++. Return right - left + 1.",
      "timeComplexity": "O(N) - single pass with 26-element array.",
      "spaceComplexity": "O(1) - fixed alphabet size 26.",
      "keyTakeaway": "The window does not need to shrink strictly to valid state; maintaining maximum valid window size is sufficient.",
      "code": {
        "Java": "class Solution {\n    public int characterReplacement(String s, int k) {\n        int[] count = new int[26];\n        int maxCount = 0, l = 0, maxLen = 0;\n        for (int r = 0; r < s.length(); r++) {\n            maxCount = Math.max(maxCount, ++count[s.charAt(r) - 'A']);\n            while ((r - l + 1) - maxCount > k) {\n                count[s.charAt(l) - 'A']--;\n                l++;\n            }\n            maxLen = Math.max(maxLen, r - l + 1);\n        }\n        return maxLen;\n    }\n}",
        "Python": "class Solution:\n    def characterReplacement(self, s: str, k: int) -> int:\n        counts = [0] * 26\n        l, max_count, max_len = 0, 0, 0\n        for r, c in enumerate(s):\n            idx = ord(c) - ord('A')\n            counts[idx] += 1\n            max_count = max(max_count, counts[idx])\n            while (r - l + 1) - max_count > k:\n                counts[ord(s[l]) - ord('A')] -= 1\n                l += 1\n            max_len = max(max_len, r - l + 1)\n        return max_len",
        "TypeScript": "function characterReplacement(s: string, k: number): number {\n    const count = new Array(26).fill(0);\n    let maxCount = 0, l = 0, maxLen = 0;\n    const codeA = 'A'.charCodeAt(0);\n    for (let r = 0; r < s.length; r++) {\n        const idx = s.charCodeAt(r) - codeA;\n        count[idx]++;\n        maxCount = Math.max(maxCount, count[idx]);\n        while ((r - l + 1) - maxCount > k) {\n            count[s.charCodeAt(l) - codeA]--;\n            l++;\n        }\n        maxLen = Math.max(maxLen, r - l + 1);\n    }\n    return maxLen;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Targeting contiguous subarrays or substrings satisfying a condition (e.g. longest substring without repeating characters, min window containing chars).",
      "coreTemplate": "let left = 0, best = 0;\nconst count = new Map();\nfor (let right = 0; right < s.length; right++) {\n  count.set(s[right], (count.get(s[right]) || 0) + 1);\n  while (!isValid(count)) {\n    count.set(s[left], count.get(s[left]) - 1);\n    left++;\n  }\n  best = Math.max(best, right - left + 1);\n}",
      "pitfalls": "Forgetting to decrement counts when moving left pointer, or maintaining state efficiently inside the window."
    }
  },
  {
    "id": "dsa-minimum-window-substring",
    "title": "Minimum Window Substring",
    "titleSlug": "minimum-window-substring",
    "url": "https://leetcode.com/problems/minimum-window-substring/",
    "difficulty": "Hard",
    "pattern": "Sliding Window",
    "tags": [
      "Strings",
      "Sliding Window",
      "HashMap"
    ],
    "companies": [
      "Meta",
      "Amazon",
      "Google",
      "LinkedIn"
    ],
    "description": "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string \"\".",
    "examples": [
      {
        "input": "s = \"ADOBECODEBANC\", t = \"ABC\"",
        "output": "\"BANC\""
      }
    ],
    "constraints": [
      "1 <= s.length, t.length <= 10^5"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public String minWindow(String s, String t) {\n        return \"\";\n    }\n}",
      "Python": "class Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        pass",
      "TypeScript": "function minWindow(s: string, t: string): string {\n    return \"\";\n}",
      "C++": "class Solution {\npublic:\n    string minWindow(string s, string t) {\n        return \"\";\n    }\n};",
      "Go": "func minWindow(s string, t string) string {\n    return \"\"\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Frequency Map of Target",
        "content": "Count required character frequencies of t in a Map or array."
      },
      {
        "level": 2,
        "title": "Matched Characters Tracker",
        "content": "Keep a variable `matched` indicating how many unique characters in t have reached their required count in the current window."
      },
      {
        "level": 3,
        "title": "Shrink Phase",
        "content": "Once all characters are satisfied, advance left to find the minimal valid window, updating the minimum length and start index."
      }
    ],
    "solution": {
      "intuition": "Expand right until the window contains all characters of t, then contract left as much as possible while maintaining all characters.",
      "approach": "1. Build target frequency map `targetMap` and count unique required characters `required`.\n2. Expand right pointer. When window frequency of s[right] matches targetMap, increment `formed`.\n3. While `formed === required`, compare window length with minLen, then shrink left pointer. When s[left] frequency falls below targetMap, decrement `formed`.\n4. Return the minimum substring recorded.",
      "timeComplexity": "O(M + N) - each character of s is visited at most twice.",
      "spaceComplexity": "O(M + N) - frequency maps.",
      "keyTakeaway": "The two-phase expand-then-contract sliding window pattern is the gold standard for minimal/maximal substring problems.",
      "code": {
        "Java": "class Solution {\n    public String minWindow(String s, String t) {\n        if (s.length() == 0 || t.length() == 0) return \"\";\n        int[] target = new int[128];\n        for (char c : t.toCharArray()) target[c]++;\n        int count = t.length(), l = 0, minLen = Integer.MAX_VALUE, start = 0;\n        for (int r = 0; r < s.length(); r++) {\n            if (target[s.charAt(r)]-- > 0) count--;\n            while (count == 0) {\n                if (r - l + 1 < minLen) {\n                    minLen = r - l + 1;\n                    start = l;\n                }\n                if (++target[s.charAt(l++)] > 0) count++;\n            }\n        }\n        return minLen == Integer.MAX_VALUE ? \"\" : s.substring(start, start + minLen);\n    }\n}",
        "Python": "from collections import Counter\nclass Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        if not s or not t: return \"\"\n        target = Counter(t)\n        required = len(target)\n        formed = 0\n        window = {}\n        min_len, ans, l = float('inf'), (0, 0), 0\n        for r, c in enumerate(s):\n            window[c] = window.get(c, 0) + 1\n            if c in target and window[c] == target[c]: formed += 1\n            while l <= r and formed == required:\n                if r - l + 1 < min_len:\n                    min_len = r - l + 1\n                    ans = (l, r + 1)\n                char_l = s[l]\n                window[char_l] -= 1\n                if char_l in target and window[char_l] < target[char_l]: formed -= 1\n                l += 1\n        return s[ans[0]:ans[1]] if min_len != float('inf') else \"\"",
        "TypeScript": "function minWindow(s: string, t: string): string {\n    const target = new Map<string, number>();\n    for (const c of t) target.set(c, (target.get(c) || 0) + 1);\n    let required = target.size, formed = 0;\n    const window = new Map<string, number>();\n    let minLen = Infinity, start = 0, l = 0;\n    for (let r = 0; r < s.length; r++) {\n        const c = s[r];\n        window.set(c, (window.get(c) || 0) + 1);\n        if (target.has(c) && window.get(c) === target.get(c)) formed++;\n        while (l <= r && formed === required) {\n            if (r - l + 1 < minLen) {\n                minLen = r - l + 1;\n                start = l;\n            }\n            const lc = s[l];\n            window.set(lc, window.get(lc)! - 1);\n            if (target.has(lc) && window.get(lc)! < target.get(lc)!) formed--;\n            l++;\n        }\n    }\n    return minLen === Infinity ? \"\" : s.substring(start, start + minLen);\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Targeting contiguous subarrays or substrings satisfying a condition (e.g. longest substring without repeating characters, min window containing chars).",
      "coreTemplate": "let left = 0, best = 0;\nconst count = new Map();\nfor (let right = 0; right < s.length; right++) {\n  count.set(s[right], (count.get(s[right]) || 0) + 1);\n  while (!isValid(count)) {\n    count.set(s[left], count.get(s[left]) - 1);\n    left++;\n  }\n  best = Math.max(best, right - left + 1);\n}",
      "pitfalls": "Forgetting to decrement counts when moving left pointer, or maintaining state efficiently inside the window."
    }
  },
  {
    "id": "dsa-linked-list-cycle",
    "title": "Linked List Cycle",
    "titleSlug": "linked-list-cycle",
    "url": "https://leetcode.com/problems/linked-list-cycle/",
    "difficulty": "Easy",
    "pattern": "Fast & Slow Pointers",
    "tags": [
      "Linked List",
      "Two Pointers"
    ],
    "companies": [
      "Amazon",
      "Microsoft",
      "Apple",
      "Meta"
    ],
    "description": "Given head, the head of a linked list, determine if the linked list has a cycle in it.\n\nThere is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer. Return true if there is a cycle, or false otherwise.",
    "examples": [
      {
        "input": "head = [3,2,0,-4], pos = 1",
        "output": "true"
      },
      {
        "input": "head = [1,2], pos = 0",
        "output": "true"
      }
    ],
    "constraints": [
      "Number of nodes is [0, 10^4].",
      "-10^5 <= Node.val <= 10^5"
    ],
    "starterCode": {
      "Java": "public class Solution {\n    public boolean hasCycle(ListNode head) {\n        return false;\n    }\n}",
      "Python": "class Solution:\n    def hasCycle(self, head: Optional[ListNode]) -> bool:\n        pass",
      "TypeScript": "function hasCycle(head: ListNode | null): boolean {\n    return false;\n}",
      "C++": "class Solution {\npublic:\n    bool hasCycle(ListNode *head) {\n        return false;\n    }\n};",
      "Go": "func hasCycle(head *ListNode) bool {\n    return false\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Two Speeds",
        "content": "Advance one pointer by 1 step (slow) and another by 2 steps (fast)."
      },
      {
        "level": 2,
        "title": "Loop Meeting Point",
        "content": "If a cycle exists, the fast pointer will eventually lap the slow pointer and they will point to the same node."
      },
      {
        "level": 3,
        "title": "Termination Condition",
        "content": "If fast reaches null or fast.next is null, the list terminates with no cycle."
      }
    ],
    "solution": {
      "intuition": "Floyd's Tortoise and Hare algorithm: if two runners race on a circular track at different speeds, the faster runner must eventually catch the slower runner from behind.",
      "approach": "Initialize slow = head, fast = head. While fast != null && fast.next != null, slow moves 1 step (slow = slow.next) and fast moves 2 steps (fast = fast.next.next). If slow == fast, return true. If loop exits, return false.",
      "timeComplexity": "O(N) - slow visits at most N nodes before cycle is confirmed.",
      "spaceComplexity": "O(1) - two pointer references.",
      "keyTakeaway": "Fast and slow pointers detect cycles without modifying the list or storing seen nodes.",
      "code": {
        "Java": "public class Solution {\n    public boolean hasCycle(ListNode head) {\n        ListNode slow = head, fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n            if (slow == fast) return true;\n        }\n        return false;\n    }\n}",
        "Python": "class Solution:\n    def hasCycle(self, head: Optional[ListNode]) -> bool:\n        slow = fast = head\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n            if slow == fast: return True\n        return False",
        "TypeScript": "function hasCycle(head: ListNode | null): boolean {\n    let slow = head, fast = head;\n    while (fast !== null && fast.next !== null) {\n        slow = slow.next!;\n        fast = fast.next.next;\n        if (slow === fast) return true;\n    }\n    return false;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Cycle detection in linked lists or state spaces (Floyd’s Tortoise and Hare), finding the middle of a list, or detecting repeating sequences.",
      "coreTemplate": "let slow = head, fast = head;\nwhile (fast !== null && fast.next !== null) {\n  slow = slow.next;\n  fast = fast.next.next;\n  if (slow === fast) return true; // Cycle detected\n}",
      "pitfalls": "Always check both fast !== null && fast.next !== null before advancing fast.next.next to avoid null pointer exceptions."
    }
  },
  {
    "id": "dsa-find-the-duplicate-number",
    "title": "Find the Duplicate Number",
    "titleSlug": "find-the-duplicate-number",
    "url": "https://leetcode.com/problems/find-the-duplicate-number/",
    "difficulty": "Medium",
    "pattern": "Fast & Slow Pointers",
    "tags": [
      "Arrays",
      "Two Pointers",
      "Binary Search"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Microsoft",
      "Meta"
    ],
    "description": "Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive.\n\nThere is only one repeated number in nums, return this repeated number.\n\nYou must solve the problem without modifying the array nums and uses only constant extra space.",
    "examples": [
      {
        "input": "nums = [1,3,4,2,2]",
        "output": "2"
      },
      {
        "input": "nums = [3,1,3,4,2]",
        "output": "3"
      }
    ],
    "constraints": [
      "1 <= n <= 10^5",
      "nums.length == n + 1",
      "1 <= nums[i] <= n"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int findDuplicate(int[] nums) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def findDuplicate(self, nums: List[int]) -> int:\n        pass",
      "TypeScript": "function findDuplicate(nums: number[]): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int findDuplicate(vector<int>& nums) {\n        return 0;\n    }\n};",
      "Go": "func findDuplicate(nums []int) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Array as Linked List",
        "content": "Each value nums[i] can be viewed as a pointer to index nums[i]. Because values are between 1 and n, index 0 is guaranteed to never be visited from within the cycle."
      },
      {
        "level": 2,
        "title": "Phase 1: Find Intersection",
        "content": "Run slow = nums[slow] and fast = nums[nums[fast]] until they collide."
      },
      {
        "level": 3,
        "title": "Phase 2: Find Cycle Entrance",
        "content": "Reset slow to nums[0] or 0 and advance both slow and fast by 1 step. The node where they meet is the start of the cycle, which is the duplicate number."
      }
    ],
    "solution": {
      "intuition": "Because each number is between 1 and n, viewing index -> nums[index] forms a linked list where a duplicate value creates two nodes pointing to the same target, forming a cycle.",
      "approach": "1. Phase 1: slow = nums[0], fast = nums[0]. Do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow != fast).\n2. Phase 2: slow = nums[0]. While (slow != fast) { slow = nums[slow]; fast = nums[fast]; }\n3. Return slow.",
      "timeComplexity": "O(N) - linear traversal.",
      "spaceComplexity": "O(1) - no extra memory.",
      "keyTakeaway": "Cycle detection algorithms can be applied to arrays by viewing values as next-pointer indices.",
      "code": {
        "Java": "class Solution {\n    public int findDuplicate(int[] nums) {\n        int slow = nums[0], fast = nums[0];\n        do {\n            slow = nums[slow];\n            fast = nums[nums[fast]];\n        } while (slow != fast);\n        slow = nums[0];\n        while (slow != fast) {\n            slow = nums[slow];\n            fast = nums[fast];\n        }\n        return slow;\n    }\n}",
        "Python": "class Solution:\n    def findDuplicate(self, nums: list[int]) -> int:\n        slow = fast = nums[0]\n        while True:\n            slow = nums[slow]\n            fast = nums[nums[fast]]\n            if slow == fast: break\n        slow = nums[0]\n        while slow != fast:\n            slow = nums[slow]\n            fast = nums[fast]\n        return slow",
        "TypeScript": "function findDuplicate(nums: number[]): number {\n    let slow = nums[0], fast = nums[0];\n    do {\n        slow = nums[slow];\n        fast = nums[nums[fast]];\n    } while (slow !== fast);\n    slow = nums[0];\n    while (slow !== fast) {\n        slow = nums[slow];\n        fast = nums[fast];\n    }\n    return slow;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Cycle detection in linked lists or state spaces (Floyd’s Tortoise and Hare), finding the middle of a list, or detecting repeating sequences.",
      "coreTemplate": "let slow = head, fast = head;\nwhile (fast !== null && fast.next !== null) {\n  slow = slow.next;\n  fast = fast.next.next;\n  if (slow === fast) return true; // Cycle detected\n}",
      "pitfalls": "Always check both fast !== null && fast.next !== null before advancing fast.next.next to avoid null pointer exceptions."
    }
  },
  {
    "id": "dsa-binary-search",
    "title": "Binary Search",
    "titleSlug": "binary-search",
    "url": "https://leetcode.com/problems/binary-search/",
    "difficulty": "Easy",
    "pattern": "Binary Search",
    "tags": [
      "Arrays",
      "Binary Search"
    ],
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple"
    ],
    "description": "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    "examples": [
      {
        "input": "nums = [-1,0,3,5,9,12], target = 9",
        "output": "4"
      },
      {
        "input": "nums = [-1,0,3,5,9,12], target = 2",
        "output": "-1"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^4",
      "-10^4 < nums[i], target < 10^4",
      "All elements unique."
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}",
      "Python": "class Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        pass",
      "TypeScript": "function search(nums: number[], target: number): number {\n    return -1;\n}",
      "C++": "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};",
      "Go": "func search(nums []int, target int) int {\n    return -1\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Boundaries",
        "content": "Initialize low = 0 and high = nums.length - 1."
      },
      {
        "level": 2,
        "title": "Midpoint Calculation",
        "content": "Calculate mid = low + (high - low) / 2 to prevent integer overflow."
      },
      {
        "level": 3,
        "title": "Half Elimination",
        "content": "If nums[mid] == target, return mid. If nums[mid] < target, search right half (low = mid + 1). Else search left half (high = mid - 1)."
      }
    ],
    "solution": {
      "intuition": "Halve the search space on every step by comparing the middle element with the target value.",
      "approach": "Set low = 0, high = nums.length - 1. While low <= high, compute mid = low + Math.floor((high - low) / 2). If nums[mid] == target, return mid. If nums[mid] < target, low = mid + 1. Otherwise high = mid - 1. Return -1 if not found.",
      "timeComplexity": "O(log N) - dividing search space by 2 on each iteration.",
      "spaceComplexity": "O(1) - pointers only.",
      "keyTakeaway": "The loop condition `low <= high` with `low = mid + 1` and `high = mid - 1` is the safest formulation.",
      "code": {
        "Java": "class Solution {\n    public int search(int[] nums, int target) {\n        int l = 0, h = nums.length - 1;\n        while (l <= h) {\n            int mid = l + (h - l) / 2;\n            if (nums[mid] == target) return mid;\n            else if (nums[mid] < target) l = mid + 1;\n            else h = mid - 1;\n        }\n        return -1;\n    }\n}",
        "Python": "class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        l, h = 0, len(nums) - 1\n        while l <= h:\n            mid = (l + h) // 2\n            if nums[mid] == target: return mid\n            elif nums[mid] < target: l = mid + 1\n            else: h = mid - 1\n        return -1",
        "TypeScript": "function search(nums: number[], target: number): number {\n    let l = 0, h = nums.length - 1;\n    while (l <= h) {\n        const mid = l + Math.floor((h - l) / 2);\n        if (nums[mid] === target) return mid;\n        else if (nums[mid] < target) l = mid + 1;\n        else h = mid - 1;\n    }\n    return -1;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Monotonic search spaces (sorted array, or predicate function P(x) where false switches to true once). Reduces search from O(N) to O(log N).",
      "coreTemplate": "let low = 0, high = n - 1;\nwhile (low <= high) {\n  const mid = low + Math.floor((high - low) / 2);\n  if (nums[mid] === target) return mid;\n  if (nums[mid] < target) low = mid + 1;\n  else high = mid - 1;\n}",
      "pitfalls": "Avoid integer overflow when calculating midpoint (low + (high - low) / 2). Beware of infinite loops when low = mid without correct boundary math."
    }
  },
  {
    "id": "dsa-search-in-rotated-sorted-array",
    "title": "Search in Rotated Sorted Array",
    "titleSlug": "search-in-rotated-sorted-array",
    "url": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    "difficulty": "Medium",
    "pattern": "Binary Search",
    "tags": [
      "Arrays",
      "Binary Search"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Bloomberg"
    ],
    "description": "There is an integer array nums sorted in ascending order (with distinct values).\n\nPrior to being passed to your function, nums is possibly rotated at an unknown pivot index k.\n\nGiven nums and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.",
    "examples": [
      {
        "input": "nums = [4,5,6,7,0,1,2], target = 0",
        "output": "4"
      },
      {
        "input": "nums = [4,5,6,7,0,1,2], target = 3",
        "output": "-1"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 5000",
      "All values are unique."
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}",
      "Python": "class Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        pass",
      "TypeScript": "function search(nums: number[], target: number): number {\n    return -1;\n}",
      "C++": "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};",
      "Go": "func search(nums []int, target int) int {\n    return -1\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "One Half is Always Sorted",
        "content": "Notice that if you cut a rotated sorted array in half, at least one of the two halves [low..mid] or [mid..high] is guaranteed to be normally sorted."
      },
      {
        "level": 2,
        "title": "Check if Left is Sorted",
        "content": "If nums[low] <= nums[mid], the left half is sorted. Check if target lies within [nums[low], nums[mid]]. If yes, search left; else search right."
      },
      {
        "level": 3,
        "title": "Check if Right is Sorted",
        "content": "Otherwise the right half is sorted. Check if target lies within [nums[mid], nums[high]]. If yes, search right; else search left."
      }
    ],
    "solution": {
      "intuition": "At any midpoint, at least one half of the array is monotonically sorted. We can test if the target falls within that sorted half to know where to branch.",
      "approach": "Set low = 0, high = n - 1. In while (low <= high), compute mid. If nums[mid] === target, return mid. If nums[low] <= nums[mid] (left half sorted), if nums[low] <= target && target < nums[mid], high = mid - 1, else low = mid + 1. Otherwise (right half sorted), if nums[mid] < target && target <= nums[high], low = mid + 1, else high = mid - 1.",
      "timeComplexity": "O(log N) - binary search.",
      "spaceComplexity": "O(1) - constant memory.",
      "keyTakeaway": "Rotated sorted arrays preserve the property that at least one half is strictly sorted.",
      "code": {
        "Java": "class Solution {\n    public int search(int[] nums, int target) {\n        int l = 0, h = nums.length - 1;\n        while (l <= h) {\n            int mid = l + (h - l) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[l] <= nums[mid]) {\n                if (nums[l] <= target && target < nums[mid]) h = mid - 1;\n                else l = mid + 1;\n            } else {\n                if (nums[mid] < target && target <= nums[h]) l = mid + 1;\n                else h = mid - 1;\n            }\n        }\n        return -1;\n    }\n}",
        "Python": "class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        l, h = 0, len(nums) - 1\n        while l <= h:\n            mid = (l + h) // 2\n            if nums[mid] == target: return mid\n            if nums[l] <= nums[mid]:\n                if nums[l] <= target < nums[mid]: h = mid - 1\n                else: l = mid + 1\n            else:\n                if nums[mid] < target <= nums[h]: l = mid + 1\n                else: h = mid - 1\n        return -1",
        "TypeScript": "function search(nums: number[], target: number): number {\n    let l = 0, h = nums.length - 1;\n    while (l <= h) {\n        const mid = l + Math.floor((h - l) / 2);\n        if (nums[mid] === target) return mid;\n        if (nums[l] <= nums[mid]) {\n            if (nums[l] <= target && target < nums[mid]) h = mid - 1;\n            else l = mid + 1;\n        } else {\n            if (nums[mid] < target && target <= nums[h]) l = mid + 1;\n            else h = mid - 1;\n        }\n    }\n    return -1;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Monotonic search spaces (sorted array, or predicate function P(x) where false switches to true once). Reduces search from O(N) to O(log N).",
      "coreTemplate": "let low = 0, high = n - 1;\nwhile (low <= high) {\n  const mid = low + Math.floor((high - low) / 2);\n  if (nums[mid] === target) return mid;\n  if (nums[mid] < target) low = mid + 1;\n  else high = mid - 1;\n}",
      "pitfalls": "Avoid integer overflow when calculating midpoint (low + (high - low) / 2). Beware of infinite loops when low = mid without correct boundary math."
    }
  },
  {
    "id": "dsa-find-minimum-in-rotated-sorted-array",
    "title": "Find Minimum in Rotated Sorted Array",
    "titleSlug": "find-minimum-in-rotated-sorted-array",
    "url": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    "difficulty": "Medium",
    "pattern": "Binary Search",
    "tags": [
      "Arrays",
      "Binary Search"
    ],
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Meta"
    ],
    "description": "Suppose an array of length n sorted in ascending order is rotated between 1 and n times.\n\nGiven the sorted rotated array nums of unique elements, return the minimum element of this array.\n\nYou must write an algorithm that runs in O(log n) time.",
    "examples": [
      {
        "input": "nums = [3,4,5,1,2]",
        "output": "1"
      },
      {
        "input": "nums = [4,5,6,7,0,1,2]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= n <= 5000",
      "All integers of nums are unique."
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int findMin(int[] nums) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def findMin(self, nums: List[int]) -> int:\n        pass",
      "TypeScript": "function findMin(nums: number[]): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int findMin(vector<int>& nums) {\n        return 0;\n    }\n};",
      "Go": "func findMin(nums []int) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Compare Mid with High",
        "content": "Compare nums[mid] with nums[high]. In a normally sorted segment, the right element is always greater than the left."
      },
      {
        "level": 2,
        "title": "Right Invariant",
        "content": "If nums[mid] > nums[high], the pivot/inflection point (minimum element) must be strictly to the right of mid (low = mid + 1)."
      },
      {
        "level": 3,
        "title": "Left Invariant",
        "content": "If nums[mid] <= nums[high], mid could be the minimum itself, so high = mid."
      }
    ],
    "solution": {
      "intuition": "Comparing with the rightmost boundary nums[high] directly identifies which half contains the inflection point (drop from maximum to minimum).",
      "approach": "Set low = 0, high = nums.length - 1. While low < high: compute mid = low + (high - low) / 2. If nums[mid] > nums[high], low = mid + 1. Else high = mid. When low == high, return nums[low].",
      "timeComplexity": "O(log N) - binary search eliminates half per step.",
      "spaceComplexity": "O(1) - constant memory.",
      "keyTakeaway": "When looking for an inflection point, comparing mid against the boundary element (high) is cleaner than comparing mid with low.",
      "code": {
        "Java": "class Solution {\n    public int findMin(int[] nums) {\n        int l = 0, h = nums.length - 1;\n        while (l < h) {\n            int mid = l + (h - l) / 2;\n            if (nums[mid] > nums[h]) l = mid + 1;\n            else h = mid;\n        }\n        return nums[l];\n    }\n}",
        "Python": "class Solution:\n    def findMin(self, nums: list[int]) -> int:\n        l, h = 0, len(nums) - 1\n        while l < h:\n            mid = (l + h) // 2\n            if nums[mid] > nums[h]: l = mid + 1\n            else: h = mid\n        return nums[l]",
        "TypeScript": "function findMin(nums: number[]): number {\n    let l = 0, h = nums.length - 1;\n    while (l < h) {\n        const mid = l + Math.floor((h - l) / 2);\n        if (nums[mid] > nums[h]) l = mid + 1;\n        else h = mid;\n    }\n    return nums[l];\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Monotonic search spaces (sorted array, or predicate function P(x) where false switches to true once). Reduces search from O(N) to O(log N).",
      "coreTemplate": "let low = 0, high = n - 1;\nwhile (low <= high) {\n  const mid = low + Math.floor((high - low) / 2);\n  if (nums[mid] === target) return mid;\n  if (nums[mid] < target) low = mid + 1;\n  else high = mid - 1;\n}",
      "pitfalls": "Avoid integer overflow when calculating midpoint (low + (high - low) / 2). Beware of infinite loops when low = mid without correct boundary math."
    }
  },
  {
    "id": "dsa-valid-parentheses",
    "title": "Valid Parentheses",
    "titleSlug": "valid-parentheses",
    "url": "https://leetcode.com/problems/valid-parentheses/",
    "difficulty": "Easy",
    "pattern": "Stack & Monotonic Stack",
    "tags": [
      "Strings",
      "Stack"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Bloomberg"
    ],
    "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets in the correct order.",
    "examples": [
      {
        "input": "s = \"()\"",
        "output": "true"
      },
      {
        "input": "s = \"()[]{}\"",
        "output": "true"
      },
      {
        "input": "s = \"(]\"",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    "starterCode": {
      "Java": "class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}",
      "Python": "class Solution:\n    def isValid(self, s: str) -> bool:\n        pass",
      "TypeScript": "function isValid(s: string): boolean {\n    return false;\n}",
      "C++": "class Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};",
      "Go": "func isValid(s string) bool {\n    return false\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "LIFO Structure",
        "content": "Parentheses matching follows Last-In-First-Out behavior. A stack is naturally suited."
      },
      {
        "level": 2,
        "title": "Pushing Complements",
        "content": "When encountering an opening bracket, push its expected closing bracket onto the stack."
      },
      {
        "level": 3,
        "title": "Empty Stack Check",
        "content": "When reading a closing bracket, it must match stack.pop(). At the end of the string, stack must be completely empty."
      }
    ],
    "solution": {
      "intuition": "Each closing bracket must match the most recently opened unmatched bracket.",
      "approach": "Create a stack. Iterate characters in s. For '(', push ')'; for '{', push '}'; for '[', push ']'. For any other character, if stack is empty or popped character does not match, return false. Finally check stack.isEmpty().",
      "timeComplexity": "O(N) - single pass over string.",
      "spaceComplexity": "O(N) - stack holds at most N elements.",
      "keyTakeaway": "Pushing the expected matching closing bracket onto the stack simplifies comparison to a single equality check on pop.",
      "code": {
        "Java": "import java.util.*;\nclass Solution {\n    public boolean isValid(String s) {\n        Deque<Character> stack = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}",
        "Python": "class Solution:\n    def isValid(self, s: str) -> bool:\n        stack = []\n        mapping = {')': '(', '}': '{', ']': '['}\n        for c in s:\n            if c in mapping:\n                top = stack.pop() if stack else '#'\n                if mapping[c] != top: return False\n            else: stack.append(c)\n        return not stack",
        "TypeScript": "function isValid(s: string): boolean {\n    const stack: string[] = [];\n    for (const c of s) {\n        if (c === '(') stack.push(')');\n        else if (c === '{') stack.push('}');\n        else if (c === '[') stack.push(']');\n        else if (stack.length === 0 || stack.pop() !== c) return false;\n    }\n    return stack.length === 0;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Nested structure matching (parentheses, tags) or finding the \"next greater element\" / \"previous smaller element\" in O(N) total time.",
      "coreTemplate": "const stack = [];\nfor (let i = 0; i < nums.length; i++) {\n  while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {\n    const prevIdx = stack.pop();\n    result[prevIdx] = nums[i];\n  }\n  stack.push(i);\n}",
      "pitfalls": "Store indices instead of values when distance between elements is required for calculations (like Daily Temperatures or Histogram)."
    }
  },
  {
    "id": "dsa-daily-temperatures",
    "title": "Daily Temperatures",
    "titleSlug": "daily-temperatures",
    "url": "https://leetcode.com/problems/daily-temperatures/",
    "difficulty": "Medium",
    "pattern": "Stack & Monotonic Stack",
    "tags": [
      "Arrays",
      "Stack",
      "Monotonic Stack"
    ],
    "companies": [
      "Meta",
      "Amazon",
      "Google",
      "Apple"
    ],
    "description": "Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day for which this is possible, keep answer[i] == 0 instead.",
    "examples": [
      {
        "input": "temperatures = [73,74,75,71,69,72,76,73]",
        "output": "[1,1,4,2,1,1,0,0]"
      },
      {
        "input": "temperatures = [30,40,50,60]",
        "output": "[1,1,1,0]"
      }
    ],
    "constraints": [
      "1 <= temperatures.length <= 10^5"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n        return new int[0];\n    }\n}",
      "Python": "class Solution:\n    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:\n        pass",
      "TypeScript": "function dailyTemperatures(temperatures: number[]): number[] {\n    return [];\n}",
      "C++": "class Solution {\npublic:\n    vector<int> dailyTemperatures(vector<int>& temperatures) {\n        return {};\n    }\n};",
      "Go": "func dailyTemperatures(temperatures []int) []int {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Next Greater Element Pattern",
        "content": "This is the canonical \"Next Greater Element\" problem solvable with a Monotonic Decreasing Stack."
      },
      {
        "level": 2,
        "title": "Store Indices",
        "content": "Push indices onto the stack rather than temperatures so you can calculate day distance (currentIndex - prevIndex)."
      },
      {
        "level": 3,
        "title": "Pop Condition",
        "content": "While stack is non-empty and temperatures[i] > temperatures[stack.peek()], pop prevIndex and set result[prevIndex] = i - prevIndex."
      }
    ],
    "solution": {
      "intuition": "Maintain a monotonically decreasing stack of indices. Any incoming temperature higher than the stack top resolves the waiting period for that day.",
      "approach": "Initialize res array of size N with 0s. Use a stack storing indices. For each index i from 0 to N-1: while stack is not empty and temperatures[i] > temperatures[stack.peek()], pop prevIdx = stack.pop() and set res[prevIdx] = i - prevIdx. Push i to stack.",
      "timeComplexity": "O(N) - each index is pushed and popped at most once.",
      "spaceComplexity": "O(N) - stack storage.",
      "keyTakeaway": "Monotonic stacks solve all variations of \"next greater element in O(N) time\".",
      "code": {
        "Java": "import java.util.*;\nclass Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n        int n = temperatures.length;\n        int[] res = new int[n];\n        Deque<Integer> stack = new ArrayDeque<>();\n        for (int i = 0; i < n; i++) {\n            while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) {\n                int prev = stack.pop();\n                res[prev] = i - prev;\n            }\n            stack.push(i);\n        }\n        return res;\n    }\n}",
        "Python": "class Solution:\n    def dailyTemperatures(self, temperatures: list[int]) -> list[int]:\n        n = len(temperatures)\n        res = [0] * n\n        stack = []\n        for i, t in enumerate(temperatures):\n            while stack and t > temperatures[stack[-1]]:\n                prev = stack.pop()\n                res[prev] = i - prev\n            stack.append(i)\n        return res",
        "TypeScript": "function dailyTemperatures(temperatures: number[]): number[] {\n    const n = temperatures.length;\n    const res = new Array(n).fill(0);\n    const stack: number[] = [];\n    for (let i = 0; i < n; i++) {\n        while (stack.length > 0 && temperatures[i] > temperatures[stack[stack.length - 1]]) {\n            const prev = stack.pop()!;\n            res[prev] = i - prev;\n        }\n        stack.push(i);\n    }\n    return res;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Nested structure matching (parentheses, tags) or finding the \"next greater element\" / \"previous smaller element\" in O(N) total time.",
      "coreTemplate": "const stack = [];\nfor (let i = 0; i < nums.length; i++) {\n  while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {\n    const prevIdx = stack.pop();\n    result[prevIdx] = nums[i];\n  }\n  stack.push(i);\n}",
      "pitfalls": "Store indices instead of values when distance between elements is required for calculations (like Daily Temperatures or Histogram)."
    }
  },
  {
    "id": "dsa-reverse-linked-list",
    "title": "Reverse Linked List",
    "titleSlug": "reverse-linked-list",
    "url": "https://leetcode.com/problems/reverse-linked-list/",
    "difficulty": "Easy",
    "pattern": "Linked List",
    "tags": [
      "Linked List",
      "Recursion"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Apple",
      "Meta",
      "Microsoft"
    ],
    "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    "examples": [
      {
        "input": "head = [1,2,3,4,5]",
        "output": "[5,4,3,2,1]"
      },
      {
        "input": "head = [1,2]",
        "output": "[2,1]"
      }
    ],
    "constraints": [
      "Number of nodes is [0, 5000].",
      "-5000 <= Node.val <= 5000"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public ListNode reverseList(ListNode head) {\n        return null;\n    }\n}",
      "Python": "class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        pass",
      "TypeScript": "function reverseList(head: ListNode | null): ListNode | null {\n    return null;\n}",
      "C++": "class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        return nullptr;\n    }\n};",
      "Go": "func reverseList(head *ListNode) *ListNode {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Three Pointer Technique",
        "content": "Track prev, curr, and next pointers."
      },
      {
        "level": 2,
        "title": "Pointer Inversion",
        "content": "Save next = curr.next before breaking the link with curr.next = prev."
      },
      {
        "level": 3,
        "title": "Advance Pointers",
        "content": "Move prev = curr and curr = next. When curr is null, prev is the new head."
      }
    ],
    "solution": {
      "intuition": "Iterate through the list reversing the directional pointer of each node toward the previous node.",
      "approach": "Initialize prev = null, curr = head. While curr != null: save next = curr.next, reverse link curr.next = prev, advance prev = curr and curr = next. Return prev.",
      "timeComplexity": "O(N) - single traversal of list.",
      "spaceComplexity": "O(1) - in-place pointer reversal.",
      "keyTakeaway": "Always cache `curr.next` before modifying it to prevent losing the remainder of the list.",
      "code": {
        "Java": "class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null, curr = head;\n        while (curr != null) {\n            ListNode next = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = next;\n        }\n        return prev;\n    }\n}",
        "Python": "class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        prev, curr = None, head\n        while curr:\n            nxt = curr.next\n            curr.next = prev\n            prev = curr\n            curr = nxt\n        return prev",
        "TypeScript": "function reverseList(head: ListNode | null): ListNode | null {\n    let prev: ListNode | null = null, curr = head;\n    while (curr !== null) {\n        const next = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = next;\n    }\n    return prev;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "In-place pointer manipulation, reversal, dummy head technique to simplify edge cases at head or tail.",
      "coreTemplate": "const dummy = new ListNode(0);\ndummy.next = head;\nlet prev = null, curr = head;\nwhile (curr !== null) {\n  const next = curr.next;\n  curr.next = prev;\n  prev = curr;\n  curr = next;\n}",
      "pitfalls": "Always use a dummy node for inserts/deletes to avoid null checks on head. Save curr.next before overwriting pointer."
    }
  },
  {
    "id": "dsa-merge-two-sorted-lists",
    "title": "Merge Two Sorted Lists",
    "titleSlug": "merge-two-sorted-lists",
    "url": "https://leetcode.com/problems/merge-two-sorted-lists/",
    "difficulty": "Easy",
    "pattern": "Linked List",
    "tags": [
      "Linked List",
      "Recursion"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Apple",
      "Meta"
    ],
    "description": "You are given the heads of two sorted linked lists list1 and list2.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.",
    "examples": [
      {
        "input": "list1 = [1,2,4], list2 = [1,3,4]",
        "output": "[1,1,2,3,4,4]"
      }
    ],
    "constraints": [
      "Number of nodes in both lists is [0, 50].",
      "Both lists sorted in non-decreasing order."
    ],
    "starterCode": {
      "Java": "class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        return null;\n    }\n}",
      "Python": "class Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        pass",
      "TypeScript": "function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {\n    return null;\n}",
      "C++": "class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        return nullptr;\n    }\n};",
      "Go": "func mergeTwoLists(list1 *ListNode, list2 *ListNode) *ListNode {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Dummy Head Node",
        "content": "Create a dummy head node to avoid null checks for the head of the merged list."
      },
      {
        "level": 2,
        "title": "Compare Tails",
        "content": "Compare list1.val and list2.val. Attach the smaller node to tail.next and advance that list."
      },
      {
        "level": 3,
        "title": "Attach Remaining Nodes",
        "content": "When one list becomes null, attach the non-null list directly to tail.next."
      }
    ],
    "solution": {
      "intuition": "Splice existing nodes together by repeatedly choosing the smaller head among the two lists.",
      "approach": "Create a dummy node `dummy = new ListNode(0)` and `tail = dummy`. While list1 != null && list2 != null, attach whichever node has smaller value and advance its pointer. Afterwards, attach whichever list is non-empty. Return dummy.next.",
      "timeComplexity": "O(N + M) where N and M are the lengths of the two lists.",
      "spaceComplexity": "O(1) - in-place pointer adjustments.",
      "keyTakeaway": "Dummy nodes eliminate edge cases when constructing new linked lists.",
      "code": {
        "Java": "class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        ListNode dummy = new ListNode(0), tail = dummy;\n        while (list1 != null && list2 != null) {\n            if (list1.val <= list2.val) {\n                tail.next = list1; list1 = list1.next;\n            } else {\n                tail.next = list2; list2 = list2.next;\n            }\n            tail = tail.next;\n        }\n        tail.next = list1 != null ? list1 : list2;\n        return dummy.next;\n    }\n}",
        "Python": "class Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        dummy = tail = ListNode(0)\n        while list1 and list2:\n            if list1.val <= list2.val:\n                tail.next = list1; list1 = list1.next\n            else:\n                tail.next = list2; list2 = list2.next\n            tail = tail.next\n        tail.next = list1 or list2\n        return dummy.next",
        "TypeScript": "function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {\n    const dummy = new ListNode(0);\n    let tail = dummy;\n    while (list1 !== null && list2 !== null) {\n        if (list1.val <= list2.val) {\n            tail.next = list1; list1 = list1.next;\n        } else {\n            tail.next = list2; list2 = list2.next;\n        }\n        tail = tail.next;\n    }\n    tail.next = list1 !== null ? list1 : list2;\n    return dummy.next;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "In-place pointer manipulation, reversal, dummy head technique to simplify edge cases at head or tail.",
      "coreTemplate": "const dummy = new ListNode(0);\ndummy.next = head;\nlet prev = null, curr = head;\nwhile (curr !== null) {\n  const next = curr.next;\n  curr.next = prev;\n  prev = curr;\n  curr = next;\n}",
      "pitfalls": "Always use a dummy node for inserts/deletes to avoid null checks on head. Save curr.next before overwriting pointer."
    }
  },
  {
    "id": "dsa-invert-binary-tree",
    "title": "Invert Binary Tree",
    "titleSlug": "invert-binary-tree",
    "url": "https://leetcode.com/problems/invert-binary-tree/",
    "difficulty": "Easy",
    "pattern": "Trees (BFS & DFS)",
    "tags": [
      "Trees",
      "DFS",
      "BFS"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Meta",
      "Microsoft"
    ],
    "description": "Given the root of a binary tree, invert the tree, and return its root.",
    "examples": [
      {
        "input": "root = [4,2,7,1,3,6,9]",
        "output": "[4,7,2,9,6,3,1]"
      },
      {
        "input": "root = [2,1,3]",
        "output": "[2,3,1]"
      }
    ],
    "constraints": [
      "Number of nodes is [0, 100]."
    ],
    "starterCode": {
      "Java": "class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        return null;\n    }\n}",
      "Python": "class Solution:\n    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        pass",
      "TypeScript": "function invertTree(root: TreeNode | null): TreeNode | null {\n    return null;\n}",
      "C++": "class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        return nullptr;\n    }\n};",
      "Go": "func invertTree(root *TreeNode) *TreeNode {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Base Case",
        "content": "If root is null, return null."
      },
      {
        "level": 2,
        "title": "Swap Children",
        "content": "Swap root.left and root.right."
      },
      {
        "level": 3,
        "title": "Recursive Descent",
        "content": "Recursively invert root.left and root.right."
      }
    ],
    "solution": {
      "intuition": "Inverting a binary tree requires swapping the left and right subtrees of every node recursively.",
      "approach": "Base case: if root is null, return null. Swap root.left with root.right. Recursively call invertTree(root.left) and invertTree(root.right). Return root.",
      "timeComplexity": "O(N) - visits every node once.",
      "spaceComplexity": "O(H) where H is tree height for recursion stack.",
      "keyTakeaway": "Tree recursion works bottom-up or top-down by performing an operation at the current node and delegating to children.",
      "code": {
        "Java": "class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        if (root == null) return null;\n        TreeNode temp = root.left;\n        root.left = invertTree(root.right);\n        root.right = invertTree(temp);\n        return root;\n    }\n}",
        "Python": "class Solution:\n    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        if not root: return None\n        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)\n        return root",
        "TypeScript": "function invertTree(root: TreeNode | null): TreeNode | null {\n    if (!root) return null;\n    const temp = root.left;\n    root.left = invertTree(root.right);\n    root.right = invertTree(temp);\n    return root;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Hierarchical traversals, subtree aggregation, diameter, path sums, level-by-level processing.",
      "coreTemplate": "function dfs(node) {\n  if (!node) return 0;\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n  return 1 + Math.max(left, right);\n}",
      "pitfalls": "Global vs local maximums (e.g. tree diameter vs node depth). Remember base case if (!node) return ..."
    }
  },
  {
    "id": "dsa-maximum-depth-of-binary-tree",
    "title": "Maximum Depth of Binary Tree",
    "titleSlug": "maximum-depth-of-binary-tree",
    "url": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    "difficulty": "Easy",
    "pattern": "Trees (BFS & DFS)",
    "tags": [
      "Trees",
      "DFS",
      "BFS"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Apple"
    ],
    "description": "Given the root of a binary tree, return its maximum depth.\n\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    "examples": [
      {
        "input": "root = [3,9,20,null,null,15,7]",
        "output": "3"
      },
      {
        "input": "root = [1,null,2]",
        "output": "2"
      }
    ],
    "constraints": [
      "Number of nodes is [0, 10^4]."
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int maxDepth(TreeNode root) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        pass",
      "TypeScript": "function maxDepth(root: TreeNode | null): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        return 0;\n    }\n};",
      "Go": "func maxDepth(root *TreeNode) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Base Case",
        "content": "An empty tree has depth 0."
      },
      {
        "level": 2,
        "title": "Subtree Depths",
        "content": "Depth of current node is 1 + max(depth(left), depth(right))."
      },
      {
        "level": 3,
        "title": "BFS Alternative",
        "content": "Can also be solved iteratively level-by-level with a Queue (BFS)."
      }
    ],
    "solution": {
      "intuition": "Depth is 1 plus the maximum depth between left and right subtrees.",
      "approach": "Base case: if root == null return 0. Otherwise return 1 + Math.max(maxDepth(root.left), maxDepth(root.right)).",
      "timeComplexity": "O(N) - visits every node.",
      "spaceComplexity": "O(H) - call stack proportional to height.",
      "keyTakeaway": "The depth of a tree is a prototypical divide-and-conquer recursion.",
      "code": {
        "Java": "class Solution {\n    public int maxDepth(TreeNode root) {\n        if (root == null) return 0;\n        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n    }\n}",
        "Python": "class Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        if not root: return 0\n        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))",
        "TypeScript": "function maxDepth(root: TreeNode | null): number {\n    if (!root) return 0;\n    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Hierarchical traversals, subtree aggregation, diameter, path sums, level-by-level processing.",
      "coreTemplate": "function dfs(node) {\n  if (!node) return 0;\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n  return 1 + Math.max(left, right);\n}",
      "pitfalls": "Global vs local maximums (e.g. tree diameter vs node depth). Remember base case if (!node) return ..."
    }
  },
  {
    "id": "dsa-diameter-of-binary-tree",
    "title": "Diameter of Binary Tree",
    "titleSlug": "diameter-of-binary-tree",
    "url": "https://leetcode.com/problems/diameter-of-binary-tree/",
    "difficulty": "Easy",
    "pattern": "Trees (BFS & DFS)",
    "tags": [
      "Trees",
      "DFS"
    ],
    "companies": [
      "Meta",
      "Amazon",
      "Google",
      "Bloomberg"
    ],
    "description": "Given the root of a binary tree, return the length of the diameter of the tree.\n\nThe diameter of a binary tree is the length of the longest path between any two nodes in a tree. This path may or may not pass through the root.",
    "examples": [
      {
        "input": "root = [1,2,3,4,5]",
        "output": "3"
      },
      {
        "input": "root = [1,2]",
        "output": "1"
      }
    ],
    "constraints": [
      "Number of nodes is [1, 10^4]."
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int diameterOfBinaryTree(TreeNode root) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:\n        pass",
      "TypeScript": "function diameterOfBinaryTree(root: TreeNode | null): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int diameterOfBinaryTree(TreeNode* root) {\n        return 0;\n    }\n};",
      "Go": "func diameterOfBinaryTree(root *TreeNode) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Path at Each Node",
        "content": "Longest path passing through node N is leftHeight + rightHeight."
      },
      {
        "level": 2,
        "title": "Global Maximum",
        "content": "Maintain a global maxDiameter and update it at each node: maxDiameter = max(maxDiameter, left + right)."
      },
      {
        "level": 3,
        "title": "Return Height to Parent",
        "content": "The helper function must return height (1 + max(left, right)) to its parent."
      }
    ],
    "solution": {
      "intuition": "At any node, the longest path that uses this node as the curve apex is leftDepth + rightDepth.",
      "approach": "Run DFS returning the height of each subtree. At each node, compute local diameter left + right and update global max. Return 1 + max(left, right) to caller.",
      "timeComplexity": "O(N) - each node visited once.",
      "spaceComplexity": "O(H) - recursion stack.",
      "keyTakeaway": "Distinguish what a recursive helper returns to its caller (height) versus what it updates globally (diameter).",
      "code": {
        "Java": "class Solution {\n    int max = 0;\n    public int diameterOfBinaryTree(TreeNode root) {\n        height(root);\n        return max;\n    }\n    private int height(TreeNode node) {\n        if (node == null) return 0;\n        int l = height(node.left);\n        int r = height(node.right);\n        max = Math.max(max, l + r);\n        return 1 + Math.max(l, r);\n    }\n}",
        "Python": "class Solution:\n    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:\n        self.max_d = 0\n        def dfs(node):\n            if not node: return 0\n            l, r = dfs(node.left), dfs(node.right)\n            self.max_d = max(self.max_d, l + r)\n            return 1 + max(l, r)\n        dfs(root)\n        return self.max_d",
        "TypeScript": "function diameterOfBinaryTree(root: TreeNode | null): number {\n    let maxDiameter = 0;\n    function dfs(node: TreeNode | null): number {\n        if (!node) return 0;\n        const l = dfs(node.left), r = dfs(node.right);\n        maxDiameter = Math.max(maxDiameter, l + r);\n        return 1 + Math.max(l, r);\n    }\n    dfs(root);\n    return maxDiameter;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Hierarchical traversals, subtree aggregation, diameter, path sums, level-by-level processing.",
      "coreTemplate": "function dfs(node) {\n  if (!node) return 0;\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n  return 1 + Math.max(left, right);\n}",
      "pitfalls": "Global vs local maximums (e.g. tree diameter vs node depth). Remember base case if (!node) return ..."
    }
  },
  {
    "id": "dsa-validate-binary-search-tree",
    "title": "Validate Binary Search Tree",
    "titleSlug": "validate-binary-search-tree",
    "url": "https://leetcode.com/problems/validate-binary-search-tree/",
    "difficulty": "Medium",
    "pattern": "Binary Search Tree",
    "tags": [
      "Trees",
      "DFS",
      "BST"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Bloomberg"
    ],
    "description": "Given the root of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST is defined as follows:\n- The left subtree of a node contains only nodes with keys strictly less than the node's key.\n- The right subtree contains only nodes with keys strictly greater.\n- Both subtrees must also be binary search trees.",
    "examples": [
      {
        "input": "root = [2,1,3]",
        "output": "true"
      },
      {
        "input": "root = [5,1,4,null,null,3,6]",
        "output": "false"
      }
    ],
    "constraints": [
      "Number of nodes is [1, 10^4].",
      "-2^31 <= Node.val <= 2^31 - 1"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public boolean isValidBST(TreeNode root) {\n        return false;\n    }\n}",
      "Python": "class Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        pass",
      "TypeScript": "function isValidBST(root: TreeNode | null): boolean {\n    return false;\n}",
      "C++": "class Solution {\npublic:\n    bool isValidBST(TreeNode* root) {\n        return false;\n    }\n};",
      "Go": "func isValidBST(root *TreeNode) bool {\n    return false\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Whole Subtree Invariant",
        "content": "It is not enough that left child < root < right child. EVERY node in the left subtree must be < root."
      },
      {
        "level": 2,
        "title": "Passing Valid Range",
        "content": "Pass down min and max boundaries: isValid(node, min, max). When moving left: max becomes node.val. When moving right: min becomes node.val."
      },
      {
        "level": 3,
        "title": "Use Long or Null for Inf",
        "content": "Node values can be Integer.MIN_VALUE or MAX_VALUE, so use Long or null objects for open boundaries."
      }
    ],
    "solution": {
      "intuition": "Each node must satisfy a valid range (low, high) strictly bounded by all its ancestors.",
      "approach": "Define helper isValid(node, minVal, maxVal). If node is null, return true. If node.val <= minVal || node.val >= maxVal return false. Recursively check isValid(node.left, minVal, node.val) && isValid(node.right, node.val, maxVal).",
      "timeComplexity": "O(N) - visits every node.",
      "spaceComplexity": "O(H) - call stack.",
      "keyTakeaway": "Carry inherited constraints downward rather than aggregating upward for validation problems.",
      "code": {
        "Java": "class Solution {\n    public boolean isValidBST(TreeNode root) {\n        return validate(root, null, null);\n    }\n    private boolean validate(TreeNode node, Integer min, Integer max) {\n        if (node == null) return true;\n        if ((min != null && node.val <= min) || (max != null && node.val >= max)) return false;\n        return validate(node.left, min, node.val) && validate(node.right, node.val, max);\n    }\n}",
        "Python": "class Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        def validate(node, low, high):\n            if not node: return True\n            if (low is not None and node.val <= low) or (high is not None and node.val >= high):\n                return False\n            return validate(node.left, low, node.val) and validate(node.right, node.val, high)\n        return validate(root, None, None)",
        "TypeScript": "function isValidBST(root: TreeNode | null): boolean {\n    function validate(node: TreeNode | null, min: number | null, max: number | null): boolean {\n        if (!node) return true;\n        if ((min !== null && node.val <= min) || (max !== null && node.val >= max)) return false;\n        return validate(node.left, min, node.val) && validate(node.right, node.val, max);\n    }\n    return validate(root, null, null);\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Inorder traversal yields sorted order. Finding Kth smallest, validating BST invariant (low < val < high).",
      "coreTemplate": "function isValid(node, minVal, maxVal) {\n  if (!node) return true;\n  if (node.val <= minVal || node.val >= maxVal) return false;\n  return isValid(node.left, minVal, node.val) && isValid(node.right, node.val, maxVal);\n}",
      "pitfalls": "Remember that all left subtree nodes must be less than root, not just the immediate left child."
    }
  },
  {
    "id": "dsa-number-of-islands",
    "title": "Number of Islands",
    "titleSlug": "number-of-islands",
    "url": "https://leetcode.com/problems/number-of-islands/",
    "difficulty": "Medium",
    "pattern": "Graphs (BFS & DFS)",
    "tags": [
      "Graphs",
      "BFS",
      "DFS",
      "Matrix"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Bloomberg"
    ],
    "description": "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
    "examples": [
      {
        "input": "grid = [\n  [\"1\",\"1\",\"1\",\"1\",\"0\"],\n  [\"1\",\"1\",\"0\",\"1\",\"0\"],\n  [\"1\",\"1\",\"0\",\"0\",\"0\"],\n  [\"0\",\"0\",\"0\",\"0\",\"0\"]\n]",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'."
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int numIslands(char[][] grid) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        pass",
      "TypeScript": "function numIslands(grid: string[][]): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        return 0;\n    }\n};",
      "Go": "func numIslands(grid [][]byte) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Scan and Sink",
        "content": "Iterate through every cell. Whenever you encounter a '1', you have found a new island."
      },
      {
        "level": 2,
        "title": "Flood Fill DFS/BFS",
        "content": "Perform a DFS or BFS from that cell in all 4 directions, sinking all connected land by marking them '0' (visited)."
      },
      {
        "level": 3,
        "title": "Increment Count",
        "content": "Increment the island counter for each flood-fill initiated from an unvisited '1'."
      }
    ],
    "solution": {
      "intuition": "Each unvisited '1' initiates a flood fill that explores and sinks the entire connected landmass.",
      "approach": "Iterate r from 0 to m-1 and c from 0 to n-1. If grid[r][c] == '1', increment island count and call dfs(r, c). In dfs, mark cell '0', and recursively visit all 4 orthogonal in-bounds neighbors if they are '1'.",
      "timeComplexity": "O(M * N) - every cell is visited at most twice.",
      "spaceComplexity": "O(M * N) - worst-case call stack for grid full of land.",
      "keyTakeaway": "Mutating the grid in-place (turning '1' to '0') avoids the space overhead of a visited matrix.",
      "code": {
        "Java": "class Solution {\n    public int numIslands(char[][] grid) {\n        int count = 0;\n        for (int r = 0; r < grid.length; r++) {\n            for (int c = 0; c < grid[0].length; c++) {\n                if (grid[r][c] == '1') {\n                    count++;\n                    dfs(grid, r, c);\n                }\n            }\n        }\n        return count;\n    }\n    private void dfs(char[][] grid, int r, int c) {\n        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != '1') return;\n        grid[r][c] = '0';\n        dfs(grid, r + 1, c); dfs(grid, r - 1, c);\n        dfs(grid, r, c + 1); dfs(grid, r, c - 1);\n    }\n}",
        "Python": "class Solution:\n    def numIslands(self, grid: list[list[str]]) -> int:\n        if not grid: return 0\n        m, n, count = len(grid), len(grid[0]), 0\n        def dfs(r, c):\n            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != '1': return\n            grid[r][c] = '0'\n            dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)\n        for r in range(m):\n            for c in range(n):\n                if grid[r][c] == '1':\n                    count += 1\n                    dfs(r, c)\n        return count",
        "TypeScript": "function numIslands(grid: string[][]): number {\n    const m = grid.length, n = grid[0].length;\n    let count = 0;\n    function dfs(r: number, c: number) {\n        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== '1') return;\n        grid[r][c] = '0';\n        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);\n    }\n    for (let r = 0; r < m; r++) {\n        for (let c = 0; c < n; c++) {\n            if (grid[r][c] === '1') {\n                count++;\n                dfs(r, c);\n            }\n        }\n    }\n    return count;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Connected components, grid traversal, flood fill, shortest path in unweighted graphs (BFS).",
      "coreTemplate": "const visited = new Set();\nconst queue = [[startRow, startCol]];\nwhile (queue.length) {\n  const [r, c] = queue.shift();\n  for (const [dr, dc] of directions) {\n    const nr = r + dr, nc = c + dc;\n    if (inBounds(nr, nc) && !visited.has(`${nr},${nc}`)) {\n      visited.add(`${nr},${nc}`);\n      queue.push([nr, nc]);\n    }\n  }\n}",
      "pitfalls": "Mark nodes as visited at the moment they are pushed to the queue, not when popped, to avoid exponential duplicate pushes."
    }
  },
  {
    "id": "dsa-clone-graph",
    "title": "Clone Graph",
    "titleSlug": "clone-graph",
    "url": "https://leetcode.com/problems/clone-graph/",
    "difficulty": "Medium",
    "pattern": "Graphs (BFS & DFS)",
    "tags": [
      "Graphs",
      "DFS",
      "BFS",
      "HashMap"
    ],
    "companies": [
      "Meta",
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "description": "Given a reference of a node in a connected undirected graph. Return a deep copy (clone) of the graph.",
    "examples": [
      {
        "input": "adjList = [[2,4],[1,3],[2,4],[1,3]]",
        "output": "[[2,4],[1,3],[2,4],[1,3]]"
      }
    ],
    "constraints": [
      "Number of nodes is [0, 100]."
    ],
    "starterCode": {
      "Java": "class Solution {\n    public Node cloneGraph(Node node) {\n        return null;\n    }\n}",
      "Python": "class Solution:\n    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:\n        pass",
      "TypeScript": "function cloneGraph(node: _Node | null): _Node | null {\n    return null;\n}",
      "C++": "class Solution {\npublic:\n    Node* cloneGraph(Node* node) {\n        return nullptr;\n    }\n};",
      "Go": "func cloneGraph(node *Node) *Node {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Map Old to New",
        "content": "Use a HashMap mapping original nodes to cloned nodes to avoid infinite cycles in undirected graphs."
      },
      {
        "level": 2,
        "title": "Lookup Before Creation",
        "content": "If a node is already in the map, return its clone immediately."
      },
      {
        "level": 3,
        "title": "Clone Neighbors Recursively",
        "content": "For each neighbor, recursively clone it and append it to clone.neighbors."
      }
    ],
    "solution": {
      "intuition": "Deep copying a graph requires traversing all reachable nodes while keeping a dictionary of visited nodes mapped to their clones to handle cycles.",
      "approach": "Create a map visited<Node, Node>. In dfs(node): if node is null return null. If visited has node, return visited.get(node). Create clone = new Node(node.val), add to map. For each neighbor in node.neighbors, clone.neighbors.add(dfs(neighbor)). Return clone.",
      "timeComplexity": "O(V + E) - visits every vertex and edge once.",
      "spaceComplexity": "O(V) - storage for the map and recursion stack.",
      "keyTakeaway": "Cycle handling in graph cloning is cleanly resolved with an original-to-clone hash map.",
      "code": {
        "Java": "import java.util.*;\nclass Solution {\n    private Map<Node, Node> map = new HashMap<>();\n    public Node cloneGraph(Node node) {\n        if (node == null) return null;\n        if (map.containsKey(node)) return map.get(node);\n        Node clone = new Node(node.val);\n        map.put(node, clone);\n        for (Node neighbor : node.neighbors) {\n            clone.neighbors.add(cloneGraph(neighbor));\n        }\n        return clone;\n    }\n}",
        "Python": "class Solution:\n    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:\n        if not node: return None\n        cloned = {}\n        def dfs(curr):\n            if curr in cloned: return cloned[curr]\n            copy = Node(curr.val)\n            cloned[curr] = copy\n            for nei in curr.neighbors: copy.neighbors.append(dfs(nei))\n            return copy\n        return dfs(node)",
        "TypeScript": "function cloneGraph(node: _Node | null): _Node | null {\n    if (!node) return null;\n    const map = new Map<_Node, _Node>();\n    function dfs(curr: _Node): _Node {\n        if (map.has(curr)) return map.get(curr)!;\n        const copy = new _Node(curr.val);\n        map.set(curr, copy);\n        for (const nei of curr.neighbors) copy.neighbors.push(dfs(nei));\n        return copy;\n    }\n    return dfs(node);\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Connected components, grid traversal, flood fill, shortest path in unweighted graphs (BFS).",
      "coreTemplate": "const visited = new Set();\nconst queue = [[startRow, startCol]];\nwhile (queue.length) {\n  const [r, c] = queue.shift();\n  for (const [dr, dc] of directions) {\n    const nr = r + dr, nc = c + dc;\n    if (inBounds(nr, nc) && !visited.has(`${nr},${nc}`)) {\n      visited.add(`${nr},${nc}`);\n      queue.push([nr, nc]);\n    }\n  }\n}",
      "pitfalls": "Mark nodes as visited at the moment they are pushed to the queue, not when popped, to avoid exponential duplicate pushes."
    }
  },
  {
    "id": "dsa-course-schedule",
    "title": "Course Schedule",
    "titleSlug": "course-schedule",
    "url": "https://leetcode.com/problems/course-schedule/",
    "difficulty": "Medium",
    "pattern": "Topological Sort",
    "tags": [
      "Graphs",
      "Topological Sort",
      "BFS",
      "DFS"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "description": "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [a_i, b_i] indicates that you must take course b_i first if you want to take course a_i.\n\nReturn true if you can finish all courses. Otherwise, return false.",
    "examples": [
      {
        "input": "numCourses = 2, prerequisites = [[1,0]]",
        "output": "true"
      },
      {
        "input": "numCourses = 2, prerequisites = [[1,0],[0,1]]",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= numCourses <= 2000",
      "0 <= prerequisites.length <= 5000"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        return false;\n    }\n}",
      "Python": "class Solution:\n    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:\n        pass",
      "TypeScript": "function canFinish(numCourses: number, prerequisites: number[][]): boolean {\n    return false;\n}",
      "C++": "class Solution {\npublic:\n    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n        return false;\n    }\n};",
      "Go": "func canFinish(numCourses int, prerequisites [][]int) bool {\n    return false\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Cycle Detection in DAG",
        "content": "You can finish all courses if and only if the dependency graph contains NO directed cycles."
      },
      {
        "level": 2,
        "title": "Kahn's Algorithm (In-degree)",
        "content": "Count in-degrees for all nodes. Push all nodes with in-degree 0 into a queue."
      },
      {
        "level": 3,
        "title": "Processed Count",
        "content": "Pop a course, increment processed count, and decrement in-degree for its outgoing neighbors. If in-degree reaches 0, push to queue. If processed == numCourses, return true."
      }
    ],
    "solution": {
      "intuition": "A course can be completed if its dependencies form a Directed Acyclic Graph (DAG). Kahn's BFS algorithm detects cycles by peeling off 0-in-degree nodes.",
      "approach": "1. Build adjacency list and inDegree array.\n2. Add all courses with inDegree == 0 to a queue.\n3. While queue is not empty: pop course u, increment completedCount, and for each dependent v in adj[u], decrement inDegree[v]. If inDegree[v] == 0, push v to queue.\n4. Return completedCount == numCourses.",
      "timeComplexity": "O(V + E) - traverses vertices and edges.",
      "spaceComplexity": "O(V + E) - graph and queue.",
      "keyTakeaway": "Kahn's algorithm provides an intuitive, cycle-detecting BFS topological sort.",
      "code": {
        "Java": "import java.util.*;\nclass Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        List<Integer>[] adj = new List[numCourses];\n        for (int i = 0; i < numCourses; i++) adj[i] = new ArrayList<>();\n        int[] inDegree = new int[numCourses];\n        for (int[] p : prerequisites) {\n            adj[p[1]].add(p[0]);\n            inDegree[p[0]]++;\n        }\n        Queue<Integer> queue = new ArrayDeque<>();\n        for (int i = 0; i < numCourses; i++) if (inDegree[i] == 0) queue.add(i);\n        int count = 0;\n        while (!queue.isEmpty()) {\n            int curr = queue.poll();\n            count++;\n            for (int next : adj[curr]) if (--inDegree[next] == 0) queue.add(next);\n        }\n        return count == numCourses;\n    }\n}",
        "Python": "from collections import deque\nclass Solution:\n    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:\n        adj = [[] for _ in range(numCourses)]\n        in_degree = [0] * numCourses\n        for dest, src in prerequisites:\n            adj[src].append(dest)\n            in_degree[dest] += 1\n        q = deque([i for i in range(numCourses) if in_degree[i] == 0])\n        count = 0\n        while q:\n            curr = q.popleft()\n            count += 1\n            for nxt in adj[curr]:\n                in_degree[nxt] -= 1\n                if in_degree[nxt] == 0: q.append(nxt)\n        return count == numCourses",
        "TypeScript": "function canFinish(numCourses: number, prerequisites: number[][]): boolean {\n    const adj: number[][] = Array.from({ length: numCourses }, () => []);\n    const inDegree = new Array(numCourses).fill(0);\n    for (const [dest, src] of prerequisites) {\n        adj[src].push(dest);\n        inDegree[dest]++;\n    }\n    const queue: number[] = [];\n    for (let i = 0; i < numCourses; i++) if (inDegree[i] === 0) queue.push(i);\n    let count = 0;\n    while (queue.length > 0) {\n        const curr = queue.shift()!;\n        count++;\n        for (const next of adj[curr]) if (--inDegree[next] === 0) queue.push(next);\n    }\n    return count === numCourses;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Dependency resolution, course scheduling, build order in Directed Acyclic Graphs (DAGs). Kahn’s algorithm (in-degrees) or DFS post-order.",
      "coreTemplate": "const inDegree = new Array(numCourses).fill(0);\nconst queue = [];\nfor (let i = 0; i < numCourses; i++) if (inDegree[i] === 0) queue.push(i);\nlet count = 0;\nwhile (queue.length) {\n  const u = queue.shift();\n  count++;\n  for (const v of adj[u]) {\n    if (--inDegree[v] === 0) queue.push(v);\n  }\n}\nreturn count === numCourses;",
      "pitfalls": "Detecting cycles: if the processed count is less than total vertices, a cycle exists."
    }
  },
  {
    "id": "dsa-climbing-stairs",
    "title": "Climbing Stairs",
    "titleSlug": "climbing-stairs",
    "url": "https://leetcode.com/problems/climbing-stairs/",
    "difficulty": "Easy",
    "pattern": "1D Dynamic Programming",
    "tags": [
      "Dynamic Programming",
      "Math",
      "Memoization"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Apple",
      "Meta"
    ],
    "description": "You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    "examples": [
      {
        "input": "n = 2",
        "output": "2"
      },
      {
        "input": "n = 3",
        "output": "3"
      }
    ],
    "constraints": [
      "1 <= n <= 45"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def climbStairs(self, n: int) -> int:\n        pass",
      "TypeScript": "function climbStairs(n: number): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int climbStairs(int n) {\n        return 0;\n    }\n};",
      "Go": "func climbStairs(n int) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Subproblem Formulation",
        "content": "To reach step n, you can take a 1-step from (n-1) or a 2-step from (n-2)."
      },
      {
        "level": 2,
        "title": "Recurrence Relation",
        "content": "ways(n) = ways(n - 1) + ways(n - 2)."
      },
      {
        "level": 3,
        "title": "O(1) Space",
        "content": "Notice this is the Fibonacci sequence. You only need two variables instead of a full array."
      }
    ],
    "solution": {
      "intuition": "The number of ways to reach step n is the sum of ways to reach step n-1 and step n-2.",
      "approach": "Base cases: n=1 -> 1, n=2 -> 2. Maintain two variables a = 1, b = 2. For i from 3 to n: temp = a + b, a = b, b = temp. Return b.",
      "timeComplexity": "O(N) - single loop.",
      "spaceComplexity": "O(1) - two variables.",
      "keyTakeaway": "Recognizing overlapping subproblems and space-optimizing from O(N) array to O(1) state variables.",
      "code": {
        "Java": "class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; i++) {\n            int sum = a + b; a = b; b = sum;\n        }\n        return b;\n    }\n}",
        "Python": "class Solution:\n    def climbStairs(self, n: int) -> int:\n        if n <= 2: return n\n        a, b = 1, 2\n        for _ in range(3, n + 1): a, b = b, a + b\n        return b",
        "TypeScript": "function climbStairs(n: number): number {\n    if (n <= 2) return n;\n    let a = 1, b = 2;\n    for (let i = 3; i <= n; i++) {\n        const sum = a + b; a = b; b = sum;\n    }\n    return b;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Optimal substructure and overlapping subproblems where answer depends on previous 1 or 2 states (Fibonacci, House Robber, Coin Change).",
      "coreTemplate": "const dp = new Array(amount + 1).fill(Infinity);\ndp[0] = 0;\nfor (let i = 1; i <= amount; i++) {\n  for (const c of coins) {\n    if (i - c >= 0) dp[i] = Math.min(dp[i], 1 + dp[i - c]);\n  }\n}",
      "pitfalls": "Check base cases carefully. Often O(N) space can be optimized to O(1) space with two variables."
    }
  },
  {
    "id": "dsa-coin-change",
    "title": "Coin Change",
    "titleSlug": "coin-change",
    "url": "https://leetcode.com/problems/coin-change/",
    "difficulty": "Medium",
    "pattern": "1D Dynamic Programming",
    "tags": [
      "Dynamic Programming",
      "BFS"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Microsoft",
      "Bloomberg"
    ],
    "description": "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount cannot be made up, return -1.",
    "examples": [
      {
        "input": "coins = [1,2,5], amount = 11",
        "output": "3"
      },
      {
        "input": "coins = [2], amount = 3",
        "output": "-1"
      }
    ],
    "constraints": [
      "1 <= coins.length <= 12",
      "0 <= amount <= 10^4"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int coinChange(int[] coins, int amount) {\n        return -1;\n    }\n}",
      "Python": "class Solution:\n    def coinChange(self, coins: List[int], amount: int) -> int:\n        pass",
      "TypeScript": "function coinChange(coins: number[], amount: number): number {\n    return -1;\n}",
      "C++": "class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        return -1;\n    }\n};",
      "Go": "func coinChange(coins []int, amount int) int {\n    return -1\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "DP Array Definition",
        "content": "Let dp[i] represent the minimum coins required to make amount i."
      },
      {
        "level": 2,
        "title": "Transition",
        "content": "For every coin c, if i - c >= 0: dp[i] = min(dp[i], 1 + dp[i - c])."
      },
      {
        "level": 3,
        "title": "Base Case & Sentinel",
        "content": "Initialize dp[0] = 0 and all other dp[i] = amount + 1. If dp[amount] > amount, return -1."
      }
    ],
    "solution": {
      "intuition": "Bottom-up DP: computing the minimal coins to make each incremental amount from 1 up to target.",
      "approach": "Create dp array of size amount + 1 filled with amount + 1. Set dp[0] = 0. For i from 1 to amount, for each coin in coins: if i - coin >= 0, dp[i] = min(dp[i], 1 + dp[i - coin]). Return dp[amount] > amount ? -1 : dp[amount].",
      "timeComplexity": "O(amount * coins.length) - nested loops.",
      "spaceComplexity": "O(amount) - DP table.",
      "keyTakeaway": "Classic unbounded knapsack / change-making pattern solved iteratively in pseudo-polynomial time.",
      "code": {
        "Java": "import java.util.Arrays;\nclass Solution {\n    public int coinChange(int[] coins, int amount) {\n        int max = amount + 1;\n        int[] dp = new int[amount + 1];\n        Arrays.fill(dp, max);\n        dp[0] = 0;\n        for (int i = 1; i <= amount; i++) {\n            for (int c : coins) if (i >= c) dp[i] = Math.min(dp[i], 1 + dp[i - c]);\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n}",
        "Python": "class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:\n        dp = [float('inf')] * (amount + 1)\n        dp[0] = 0\n        for i in range(1, amount + 1):\n            for c in coins:\n                if i - c >= 0: dp[i] = min(dp[i], 1 + dp[i - c])\n        return dp[amount] if dp[amount] != float('inf') else -1",
        "TypeScript": "function coinChange(coins: number[], amount: number): number {\n    const dp = new Array(amount + 1).fill(amount + 1);\n    dp[0] = 0;\n    for (let i = 1; i <= amount; i++) {\n        for (const c of coins) if (i >= c) dp[i] = Math.min(dp[i], 1 + dp[i - c]);\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Optimal substructure and overlapping subproblems where answer depends on previous 1 or 2 states (Fibonacci, House Robber, Coin Change).",
      "coreTemplate": "const dp = new Array(amount + 1).fill(Infinity);\ndp[0] = 0;\nfor (let i = 1; i <= amount; i++) {\n  for (const c of coins) {\n    if (i - c >= 0) dp[i] = Math.min(dp[i], 1 + dp[i - c]);\n  }\n}",
      "pitfalls": "Check base cases carefully. Often O(N) space can be optimized to O(1) space with two variables."
    }
  },
  {
    "id": "dsa-unique-paths",
    "title": "Unique Paths",
    "titleSlug": "unique-paths",
    "url": "https://leetcode.com/problems/unique-paths/",
    "difficulty": "Medium",
    "pattern": "2D Dynamic Programming",
    "tags": [
      "Dynamic Programming",
      "Combinatorics",
      "Matrix"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "description": "There is a robot on an m x n grid located at top-left (0, 0). It tries to move to bottom-right (m - 1, n - 1) only moving either down or right at any point.\n\nReturn the number of possible unique paths.",
    "examples": [
      {
        "input": "m = 3, n = 7",
        "output": "28"
      },
      {
        "input": "m = 3, n = 2",
        "output": "3"
      }
    ],
    "constraints": [
      "1 <= m, n <= 100"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int uniquePaths(int m, int n) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        pass",
      "TypeScript": "function uniquePaths(m: number, n: number): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int uniquePaths(int m, int n) {\n        return 0;\n    }\n};",
      "Go": "func uniquePaths(m int, n int) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Grid Transition",
        "content": "To reach cell (r, c), you could only have arrived from the top (r-1, c) or from the left (r, c-1)."
      },
      {
        "level": 2,
        "title": "Base Cases",
        "content": "Any cell in the first row has only 1 way to be reached (moving right continuously). Same for the first column."
      },
      {
        "level": 3,
        "title": "Space Optimization",
        "content": "You only need the previous row to compute the current row: dp[c] = dp[c] + dp[c-1]."
      }
    ],
    "solution": {
      "intuition": "Each grid cell sums the unique paths from its top and left neighbors.",
      "approach": "Create a 1D row array of size n initialized to 1. For row from 1 to m-1: for col from 1 to n-1: row[col] += row[col - 1]. Return row[n - 1].",
      "timeComplexity": "O(M * N) - iterating over the grid.",
      "spaceComplexity": "O(N) - rolling 1D array.",
      "keyTakeaway": "2D grid DP where transitions only depend on the previous row can always be compressed to O(N) space.",
      "code": {
        "Java": "import java.util.Arrays;\nclass Solution {\n    public int uniquePaths(int m, int n) {\n        int[] row = new int[n];\n        Arrays.fill(row, 1);\n        for (int i = 1; i < m; i++) {\n            for (int j = 1; j < n; j++) row[j] += row[j - 1];\n        }\n        return row[n - 1];\n    }\n}",
        "Python": "class Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        row = [1] * n\n        for _ in range(1, m):\n            for j in range(1, n): row[j] += row[j - 1]\n        return row[-1]",
        "TypeScript": "function uniquePaths(m: number, n: number): number {\n    const row = new Array(n).fill(1);\n    for (let i = 1; i < m; i++) {\n        for (let j = 1; j < n; j++) row[j] += row[j - 1];\n    }\n    return row[n - 1];\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Two strings comparison (LCS, Edit Distance), grid paths (Unique Paths), or 0/1 Knapsack.",
      "coreTemplate": "const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\nfor (let i = 1; i <= m; i++) {\n  for (let j = 1; j <= n; j++) {\n    if (s1[i - 1] === s2[j - 1]) dp[i][j] = 1 + dp[i - 1][j - 1];\n    else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n  }\n}",
      "pitfalls": "Make sure indices between DP table (1-indexed) and strings (0-indexed) are aligned."
    }
  },
  {
    "id": "dsa-longest-common-subsequence",
    "title": "Longest Common Subsequence",
    "titleSlug": "longest-common-subsequence",
    "url": "https://leetcode.com/problems/longest-common-subsequence/",
    "difficulty": "Medium",
    "pattern": "2D Dynamic Programming",
    "tags": [
      "Dynamic Programming",
      "Strings"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Microsoft",
      "Meta"
    ],
    "description": "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
    "examples": [
      {
        "input": "text1 = \"abcde\", text2 = \"ace\"",
        "output": "3"
      }
    ],
    "constraints": [
      "1 <= text1.length, text2.length <= 1000"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:\n        pass",
      "TypeScript": "function longestCommonSubsequence(text1: string, text2: string): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int longestCommonSubsequence(string text1, string text2) {\n        return 0;\n    }\n};",
      "Go": "func longestCommonSubsequence(text1 string, text2 string) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "2D Matrix Definition",
        "content": "Let dp[i][j] be the LCS of text1[0..i-1] and text2[0..j-1]."
      },
      {
        "level": 2,
        "title": "Matching Characters",
        "content": "If text1[i-1] == text2[j-1], then dp[i][j] = 1 + dp[i-1][j-1]."
      },
      {
        "level": 3,
        "title": "Non-Matching Characters",
        "content": "Otherwise, dp[i][j] = max(dp[i-1][j], dp[i][j-1])."
      }
    ],
    "solution": {
      "intuition": "When characters match, extend the diagonal subproblem; otherwise inherit the maximum from deleting one character from either string.",
      "approach": "Create a 2D array dp of size (m+1) x (n+1) with 0s. Loop i from 1 to m, j from 1 to n: if text1[i-1] == text2[j-1], dp[i][j] = 1 + dp[i-1][j-1]; else dp[i][j] = max(dp[i-1][j], dp[i][j-1]). Return dp[m][n].",
      "timeComplexity": "O(M * N) - filling 2D table.",
      "spaceComplexity": "O(M * N) or O(min(M, N)) with space optimization.",
      "keyTakeaway": "The canonical 2D string comparison dynamic programming paradigm.",
      "code": {
        "Java": "class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        int m = text1.length(), n = text2.length();\n        int[][] dp = new int[m + 1][n + 1];\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (text1.charAt(i - 1) == text2.charAt(j - 1)) dp[i][j] = 1 + dp[i - 1][j - 1];\n                else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n            }\n        }\n        return dp[m][n];\n    }\n}",
        "Python": "class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:\n        m, n = len(text1), len(text2)\n        dp = [[0] * (n + 1) for _ in range(m + 1)]\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if text1[i - 1] == text2[j - 1]: dp[i][j] = 1 + dp[i - 1][j - 1]\n                else: dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\n        return dp[m][n]",
        "TypeScript": "function longestCommonSubsequence(text1: string, text2: string): number {\n    const m = text1.length, n = text2.length;\n    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\n    for (let i = 1; i <= m; i++) {\n        for (let j = 1; j <= n; j++) {\n            if (text1[i - 1] === text2[j - 1]) dp[i][j] = 1 + dp[i - 1][j - 1];\n            else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n        }\n    }\n    return dp[m][n];\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Two strings comparison (LCS, Edit Distance), grid paths (Unique Paths), or 0/1 Knapsack.",
      "coreTemplate": "const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\nfor (let i = 1; i <= m; i++) {\n  for (let j = 1; j <= n; j++) {\n    if (s1[i - 1] === s2[j - 1]) dp[i][j] = 1 + dp[i - 1][j - 1];\n    else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n  }\n}",
      "pitfalls": "Make sure indices between DP table (1-indexed) and strings (0-indexed) are aligned."
    }
  },
  {
    "id": "dsa-maximum-subarray",
    "title": "Maximum Subarray",
    "titleSlug": "maximum-subarray",
    "url": "https://leetcode.com/problems/maximum-subarray/",
    "difficulty": "Medium",
    "pattern": "Greedy & Intervals",
    "tags": [
      "Arrays",
      "Dynamic Programming"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Apple"
    ],
    "description": "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    "examples": [
      {
        "input": "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        "output": "6"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        pass",
      "TypeScript": "function maxSubArray(nums: number[]): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        return 0;\n    }\n};",
      "Go": "func maxSubArray(nums []int) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Kadane's Insight",
        "content": "If the running sum becomes negative, it can only drag down any future subarray sum."
      },
      {
        "level": 2,
        "title": "Resetting Current Sum",
        "content": "currSum = max(nums[i], currSum + nums[i]). If currSum is negative, reset to 0."
      },
      {
        "level": 3,
        "title": "Negative Arrays",
        "content": "Initialize maxSum to the first element (or -Infinity) so that all-negative arrays return the largest single negative number."
      }
    ],
    "solution": {
      "intuition": "Kadane's Algorithm: Accumulate running sum; whenever running sum drops below 0, discard it and start fresh from the next element.",
      "approach": "Set currSum = 0, maxSum = nums[0]. For each num in nums: currSum += num; maxSum = max(maxSum, currSum); if currSum < 0 currSum = 0. Return maxSum.",
      "timeComplexity": "O(N) - single pass.",
      "spaceComplexity": "O(1) - two variables.",
      "keyTakeaway": "Negative prefix sums should be immediately abandoned in maximum contiguous subarray problems.",
      "code": {
        "Java": "class Solution {\n    public int maxSubArray(int[] nums) {\n        int max = nums[0], sum = 0;\n        for (int n : nums) {\n            sum += n;\n            if (sum > max) max = sum;\n            if (sum < 0) sum = 0;\n        }\n        return max;\n    }\n}",
        "Python": "class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        max_sum, curr = nums[0], 0\n        for n in nums:\n            curr += n\n            if curr > max_sum: max_sum = curr\n            if curr < 0: curr = 0\n        return max_sum",
        "TypeScript": "function maxSubArray(nums: number[]): number {\n    let maxSum = nums[0], curr = 0;\n    for (const n of nums) {\n        curr += n;\n        if (curr > maxSum) maxSum = curr;\n        if (curr < 0) curr = 0;\n    }\n    return maxSum;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Local optimal choice leads to global optimal (activity selection, merging overlapping intervals, jump game).",
      "coreTemplate": "intervals.sort((a, b) => a[0] - b[0]);\nconst merged = [intervals[0]];\nfor (let i = 1; i < intervals.length; i++) {\n  const last = merged[merged.length - 1];\n  if (intervals[i][0] <= last[1]) last[1] = Math.max(last[1], intervals[i][1]);\n  else merged.push(intervals[i]);\n}",
      "pitfalls": "Always sort intervals first! Check if intervals touch at boundaries (<= vs <)."
    }
  },
  {
    "id": "dsa-merge-intervals",
    "title": "Merge Intervals",
    "titleSlug": "merge-intervals",
    "url": "https://leetcode.com/problems/merge-intervals/",
    "difficulty": "Medium",
    "pattern": "Greedy & Intervals",
    "tags": [
      "Arrays",
      "Sorting"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Bloomberg"
    ],
    "description": "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of non-overlapping intervals that cover all input intervals.",
    "examples": [
      {
        "input": "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        "output": "[[1,6],[8,10],[15,18]]"
      }
    ],
    "constraints": [
      "1 <= intervals.length <= 10^4"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int[][] merge(int[][] intervals) {\n        return new int[0][0];\n    }\n}",
      "Python": "class Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        pass",
      "TypeScript": "function merge(intervals: number[][]): number[][] {\n    return [];\n}",
      "C++": "class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        return {};\n    }\n};",
      "Go": "func merge(intervals [][]int) [][]int {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Sort by Start Time",
        "content": "Sorting intervals by their starting boundary guarantees that any potential overlaps appear consecutively."
      },
      {
        "level": 2,
        "title": "Comparing Adjacent Intervals",
        "content": "For consecutive intervals A and B: if B.start <= A.end, they overlap. Merge them into [A.start, max(A.end, B.end)]."
      },
      {
        "level": 3,
        "title": "Append When Disjoint",
        "content": "If B.start > A.end, no overlap exists. Add A to the result list and start tracking B."
      }
    ],
    "solution": {
      "intuition": "Sorting by start times orders intervals along the timeline so we only ever need to check the last merged interval for overlaps.",
      "approach": "1. Sort intervals by start time.\n2. Add first interval to merged list.\n3. For each subsequent interval curr: if curr.start <= lastMerged.end, update lastMerged.end = max(lastMerged.end, curr.end).\n4. Otherwise, push curr to merged list.\n5. Return merged list.",
      "timeComplexity": "O(N log N) - driven by sorting.",
      "spaceComplexity": "O(N) - to store merged output.",
      "keyTakeaway": "Interval problems almost always start by sorting by start time or end time.",
      "code": {
        "Java": "import java.util.*;\nclass Solution {\n    public int[][] merge(int[][] intervals) {\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n        List<int[]> res = new ArrayList<>();\n        int[] curr = intervals[0];\n        res.add(curr);\n        for (int[] interval : intervals) {\n            if (interval[0] <= curr[1]) curr[1] = Math.max(curr[1], interval[1]);\n            else { curr = interval; res.add(curr); }\n        }\n        return res.toArray(new int[res.size()][]);\n    }\n}",
        "Python": "class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        intervals.sort(key=lambda x: x[0])\n        merged = [intervals[0]]\n        for start, end in intervals[1:]:\n            if start <= merged[-1][1]: merged[-1][1] = max(merged[-1][1], end)\n            else: merged.append([start, end])\n        return merged",
        "TypeScript": "function merge(intervals: number[][]): number[][] {\n    intervals.sort((a, b) => a[0] - b[0]);\n    const merged: number[][] = [intervals[0]];\n    for (let i = 1; i < intervals.length; i++) {\n        const curr = intervals[i], last = merged[merged.length - 1];\n        if (curr[0] <= last[1]) last[1] = Math.max(last[1], curr[1]);\n        else merged.push(curr);\n    }\n    return merged;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Local optimal choice leads to global optimal (activity selection, merging overlapping intervals, jump game).",
      "coreTemplate": "intervals.sort((a, b) => a[0] - b[0]);\nconst merged = [intervals[0]];\nfor (let i = 1; i < intervals.length; i++) {\n  const last = merged[merged.length - 1];\n  if (intervals[i][0] <= last[1]) last[1] = Math.max(last[1], intervals[i][1]);\n  else merged.push(intervals[i]);\n}",
      "pitfalls": "Always sort intervals first! Check if intervals touch at boundaries (<= vs <)."
    }
  },
  {
    "id": "dsa-single-number",
    "title": "Single Number",
    "titleSlug": "single-number",
    "url": "https://leetcode.com/problems/single-number/",
    "difficulty": "Easy",
    "pattern": "Bit Manipulation",
    "tags": [
      "Arrays",
      "Bit Manipulation"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Apple"
    ],
    "description": "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with linear runtime complexity and use only constant extra space.",
    "examples": [
      {
        "input": "nums = [2,2,1]",
        "output": "1"
      },
      {
        "input": "nums = [4,1,2,1,2]",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 3 * 10^4"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int singleNumber(int[] nums) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def singleNumber(self, nums: List[int]) -> int:\n        pass",
      "TypeScript": "function singleNumber(nums: number[]): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        return 0;\n    }\n};",
      "Go": "func singleNumber(nums []int) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "XOR Identity",
        "content": "Recall the algebraic properties of XOR: x ^ x = 0, and x ^ 0 = x."
      },
      {
        "level": 2,
        "title": "Associative Property",
        "content": "XOR is commutative and associative. Pairwise duplicate numbers cancel out to 0."
      },
      {
        "level": 3,
        "title": "Accumulator",
        "content": "XOR all numbers in the array together. The final result is the unique single number."
      }
    ],
    "solution": {
      "intuition": "XORing a number with itself yields 0. XORing with 0 yields the number itself. Hence all duplicate pairs cancel, leaving the single number.",
      "approach": "Initialize res = 0. Iterate through each num in nums and compute res ^= num. Return res.",
      "timeComplexity": "O(N) - single pass.",
      "spaceComplexity": "O(1) - single accumulator variable.",
      "keyTakeaway": "XOR bitwise cancellation is the classic technique for finding unpaired elements.",
      "code": {
        "Java": "class Solution {\n    public int singleNumber(int[] nums) {\n        int res = 0;\n        for (int n : nums) res ^= n;\n        return res;\n    }\n}",
        "Python": "class Solution:\n    def singleNumber(self, nums: list[int]) -> int:\n        res = 0\n        for n in nums: res ^= n\n        return res",
        "TypeScript": "function singleNumber(nums: number[]): number {\n    let res = 0;\n    for (const n of nums) res ^= n;\n    return res;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "XOR properties (x ^ x = 0, x ^ 0 = x), clearing lowest set bit (n & (n - 1)), bitmasking subsets.",
      "coreTemplate": "let res = 0;\nfor (const n of nums) res ^= n;\nreturn res;",
      "pitfalls": "Operator precedence in JavaScript/Python: == has higher precedence than & or ^. Always wrap bit operations in parentheses: ((n & 1) === 1)."
    }
  },
  {
    "id": "dsa-min-stack",
    "title": "Min Stack",
    "titleSlug": "min-stack",
    "url": "https://leetcode.com/problems/min-stack/",
    "difficulty": "Medium",
    "pattern": "Stack & Monotonic Stack",
    "tags": [
      "Stack",
      "Design"
    ],
    "companies": [
      "Amazon",
      "Bloomberg",
      "Microsoft",
      "Google"
    ],
    "description": "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.\n\nImplement the MinStack class:\n- MinStack() initializes the stack object.\n- void push(int val) pushes the element val onto the stack.\n- void pop() removes the element on the top of the stack.\n- int top() gets the top element of the stack.\n- int getMin() retrieves the minimum element in the stack.\n\nYou must implement a solution with O(1) time complexity for each operation.",
    "examples": [
      {
        "input": "[\"MinStack\",\"push\",\"push\",\"push\",\"getMin\",\"pop\",\"top\",\"getMin\"]\n[[],[-2],[0],[-3],[],[],[],[]]",
        "output": "[null,null,null,null,-3,null,0,-2]"
      }
    ],
    "constraints": [
      "-2^31 <= val <= 2^31 - 1",
      "Methods pop, top and getMin will always be called on non-empty stacks."
    ],
    "starterCode": {
      "Java": "class MinStack {\n    public MinStack() {}\n    public void push(int val) {}\n    public void pop() {}\n    public int top() { return 0; }\n    public int getMin() { return 0; }\n}",
      "Python": "class MinStack:\n    def __init__(self):\n        pass\n    def push(self, val: int) -> None:\n        pass\n    def pop(self) -> None:\n        pass\n    def top(self) -> int:\n        return 0\n    def getMin(self) -> int:\n        return 0",
      "TypeScript": "class MinStack {\n    constructor() {}\n    push(val: number): void {}\n    pop(): void {}\n    top(): number { return 0; }\n    getMin(): number { return 0; }\n}",
      "C++": "class MinStack {\npublic:\n    MinStack() {}\n    void push(int val) {}\n    void pop() {}\n    int top() { return 0; }\n    int getMin() { return 0; }\n};",
      "Go": "type MinStack struct {}\nfunc Constructor() MinStack { return MinStack{} }\nfunc (this *MinStack) Push(val int) {}\nfunc (this *MinStack) Pop() {}\nfunc (this *MinStack) Top() int { return 0 }\nfunc (this *MinStack) GetMin() int { return 0 }"
    },
    "hints": [
      {
        "level": 1,
        "title": "Two Stacks",
        "content": "Maintain a secondary stack that tracks the minimum value up to the current stack height."
      },
      {
        "level": 2,
        "title": "Paired Values",
        "content": "Alternatively, store pairs [val, currentMin] in a single stack."
      },
      {
        "level": 3,
        "title": "Push / Pop Sync",
        "content": "When pushing val, currentMin = Math.min(val, stack.isEmpty() ? val : stack.peek()[1])."
      }
    ],
    "solution": {
      "intuition": "Every element pushed onto the stack can snapshot the minimum element present in the stack up to that moment.",
      "approach": "Store pairs [val, minSoFar]. When pushing val, compute minSoFar = stack.isEmpty() ? val : Math.min(val, stack.peek()[1]). Then top() returns pair[0] and getMin() returns pair[1].",
      "timeComplexity": "O(1) for all operations.",
      "spaceComplexity": "O(N) - storing elements and running minimums.",
      "keyTakeaway": "Augmenting stack frames with running invariants provides instant O(1) historical queries.",
      "code": {
        "Java": "import java.util.*;\nclass MinStack {\n    private Deque<int[]> stack = new ArrayDeque<>();\n    public MinStack() {}\n    public void push(int val) {\n        int min = stack.isEmpty() ? val : Math.min(val, stack.peek()[1]);\n        stack.push(new int[]{ val, min });\n    }\n    public void pop() { stack.pop(); }\n    public int top() { return stack.peek()[0]; }\n    public int getMin() { return stack.peek()[1]; }\n}",
        "Python": "class MinStack:\n    def __init__(self):\n        self.stack = []\n    def push(self, val: int) -> None:\n        m = val if not self.stack else min(val, self.stack[-1][1])\n        self.stack.append((val, m))\n    def pop(self) -> None:\n        self.stack.pop()\n    def top(self) -> int:\n        return self.stack[-1][0]\n    def getMin(self) -> int:\n        return self.stack[-1][1]",
        "TypeScript": "class MinStack {\n    private stack: [number, number][] = [];\n    push(val: number): void {\n        const min = this.stack.length === 0 ? val : Math.min(val, this.stack[this.stack.length - 1][1]);\n        this.stack.push([val, min]);\n    }\n    pop(): void { this.stack.pop(); }\n    top(): number { return this.stack[this.stack.length - 1][0]; }\n    getMin(): number { return this.stack[this.stack.length - 1][1]; }\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Nested structure matching (parentheses, tags) or finding the \"next greater element\" / \"previous smaller element\" in O(N) total time.",
      "coreTemplate": "const stack = [];\nfor (let i = 0; i < nums.length; i++) {\n  while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {\n    const prevIdx = stack.pop();\n    result[prevIdx] = nums[i];\n  }\n  stack.push(i);\n}",
      "pitfalls": "Store indices instead of values when distance between elements is required for calculations (like Daily Temperatures or Histogram)."
    }
  },
  {
    "id": "dsa-largest-rectangle-in-histogram",
    "title": "Largest Rectangle in Histogram",
    "titleSlug": "largest-rectangle-in-histogram",
    "url": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    "difficulty": "Hard",
    "pattern": "Stack & Monotonic Stack",
    "tags": [
      "Arrays",
      "Stack",
      "Monotonic Stack"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "description": "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.",
    "examples": [
      {
        "input": "heights = [2,1,5,6,2,3]",
        "output": "10",
        "explanation": "The largest rectangle is bounded by bars 5 and 6 of width 2: area = 2 * 5 = 10."
      },
      {
        "input": "heights = [2,4]",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= heights.length <= 10^5",
      "0 <= heights[i] <= 10^4"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int largestRectangleArea(int[] heights) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def largestRectangleArea(self, heights: List[int]) -> int:\n        pass",
      "TypeScript": "function largestRectangleArea(heights: number[]): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int largestRectangleArea(vector<int>& heights) {\n        return 0;\n    }\n};",
      "Go": "func largestRectangleArea(heights []int) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Height Limitation",
        "content": "For each bar, what is the maximum width it can span as the shortest bar? It spans from the first smaller bar on the left to the first smaller bar on the right."
      },
      {
        "level": 2,
        "title": "Monotonic Increasing Stack",
        "content": "Maintain a stack of increasing bar heights. When a shorter bar is encountered, pop previous bars and compute their enclosed area."
      },
      {
        "level": 3,
        "title": "Width Formula",
        "content": "When popping index i, height = heights[i], right bound = current index, left bound = stack.peek() (or -1 if empty). Width = right - left - 1."
      }
    ],
    "solution": {
      "intuition": "Each bar can form a rectangle of its own height spanning between the nearest smaller bar to its left and right.",
      "approach": "Iterate i from 0 to n. When heights[i] < heights[stack.peek()], pop h = heights[stack.pop()]. Width is stack.isEmpty() ? i : i - stack.peek() - 1. Calculate area = h * width and update maxArea.",
      "timeComplexity": "O(N) - every bar is pushed and popped once.",
      "spaceComplexity": "O(N) - stack storage.",
      "keyTakeaway": "Monotonic stacks efficiently identify boundaries of influence for array elements.",
      "code": {
        "Java": "import java.util.*;\nclass Solution {\n    public int largestRectangleArea(int[] heights) {\n        Deque<Integer> stack = new ArrayDeque<>();\n        int max = 0, n = heights.length;\n        for (int i = 0; i <= n; i++) {\n            int h = (i == n) ? 0 : heights[i];\n            while (!stack.isEmpty() && h < heights[stack.peek()]) {\n                int height = heights[stack.pop()];\n                int width = stack.isEmpty() ? i : i - stack.peek() - 1;\n                max = Math.max(max, height * width);\n            }\n            stack.push(i);\n        }\n        return max;\n    }\n}",
        "Python": "class Solution:\n    def largestRectangleArea(self, heights: list[int]) -> int:\n        stack = []\n        max_area = 0\n        heights.append(0)\n        for i, h in enumerate(heights):\n            while stack and h < heights[stack[-1]]:\n                height = heights[stack.pop()]\n                width = i if not stack else i - stack[-1] - 1\n                max_area = max(max_area, height * width)\n            stack.append(i)\n        heights.pop()\n        return max_area",
        "TypeScript": "function largestRectangleArea(heights: number[]): number {\n    const stack: number[] = [];\n    let maxArea = 0, n = heights.length;\n    for (let i = 0; i <= n; i++) {\n        const h = (i === n) ? 0 : heights[i];\n        while (stack.length > 0 && h < heights[stack[stack.length - 1]]) {\n            const height = heights[stack.pop()!];\n            const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;\n            maxArea = Math.max(maxArea, height * width);\n        }\n        stack.push(i);\n    }\n    return maxArea;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Nested structure matching (parentheses, tags) or finding the \"next greater element\" / \"previous smaller element\" in O(N) total time.",
      "coreTemplate": "const stack = [];\nfor (let i = 0; i < nums.length; i++) {\n  while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {\n    const prevIdx = stack.pop();\n    result[prevIdx] = nums[i];\n  }\n  stack.push(i);\n}",
      "pitfalls": "Store indices instead of values when distance between elements is required for calculations (like Daily Temperatures or Histogram)."
    }
  },
  {
    "id": "dsa-remove-nth-node-from-end-of-list",
    "title": "Remove Nth Node From End of List",
    "titleSlug": "remove-nth-node-from-end-of-list",
    "url": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    "difficulty": "Medium",
    "pattern": "Linked List",
    "tags": [
      "Linked List",
      "Two Pointers"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Apple"
    ],
    "description": "Given the head of a linked list, remove the nth node from the end of the list and return its head.",
    "examples": [
      {
        "input": "head = [1,2,3,4,5], n = 2",
        "output": "[1,2,3,5]"
      },
      {
        "input": "head = [1], n = 1",
        "output": "[]"
      },
      {
        "input": "head = [1,2], n = 1",
        "output": "[1]"
      }
    ],
    "constraints": [
      "The number of nodes in the list is sz.",
      "1 <= sz <= 30",
      "1 <= n <= sz"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public ListNode removeNthFromEnd(ListNode head, int n) {\n        return null;\n    }\n}",
      "Python": "class Solution:\n    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:\n        pass",
      "TypeScript": "function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {\n    return null;\n}",
      "C++": "class Solution {\npublic:\n    ListNode* removeNthFromEnd(ListNode* head, int n) {\n        return nullptr;\n    }\n};",
      "Go": "func removeNthFromEnd(head *ListNode, n int) *ListNode {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Two Pointers Gap",
        "content": "Create a gap of n nodes between fast and slow pointers."
      },
      {
        "level": 2,
        "title": "Dummy Node for Edge Case",
        "content": "Attach a dummy head before head so deleting the first node is seamless."
      },
      {
        "level": 3,
        "title": "Simultaneous Traversal",
        "content": "Advance fast by n + 1 steps from dummy. Then advance fast and slow together until fast is null. slow.next = slow.next.next."
      }
    ],
    "solution": {
      "intuition": "Maintain two pointers separated by distance n. When the fast pointer hits the end, the slow pointer points directly to the predecessor of the target node.",
      "approach": "Use a dummy node before head. Advance fast pointer n + 1 steps. Then move slow and fast together until fast is null. Remove target node with slow.next = slow.next.next. Return dummy.next.",
      "timeComplexity": "O(N) - single pass.",
      "spaceComplexity": "O(1) - two pointer references.",
      "keyTakeaway": "Fixed-gap pointer traversal resolves any Kth-from-end list query in one pass.",
      "code": {
        "Java": "class Solution {\n    public ListNode removeNthFromEnd(ListNode head, int n) {\n        ListNode dummy = new ListNode(0);\n        dummy.next = head;\n        ListNode fast = dummy, slow = dummy;\n        for (int i = 0; i <= n; i++) fast = fast.next;\n        while (fast != null) {\n            fast = fast.next;\n            slow = slow.next;\n        }\n        slow.next = slow.next.next;\n        return dummy.next;\n    }\n}",
        "Python": "class Solution:\n    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:\n        dummy = ListNode(0, head)\n        slow = fast = dummy\n        for _ in range(n + 1): fast = fast.next\n        while fast:\n            slow, fast = slow.next, fast.next\n        slow.next = slow.next.next\n        return dummy.next",
        "TypeScript": "function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {\n    const dummy = new ListNode(0, head);\n    let fast: ListNode | null = dummy, slow: ListNode | null = dummy;\n    for (let i = 0; i <= n; i++) fast = fast!.next;\n    while (fast !== null) {\n        fast = fast.next;\n        slow = slow!.next;\n    }\n    slow!.next = slow!.next!.next;\n    return dummy.next;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "In-place pointer manipulation, reversal, dummy head technique to simplify edge cases at head or tail.",
      "coreTemplate": "const dummy = new ListNode(0);\ndummy.next = head;\nlet prev = null, curr = head;\nwhile (curr !== null) {\n  const next = curr.next;\n  curr.next = prev;\n  prev = curr;\n  curr = next;\n}",
      "pitfalls": "Always use a dummy node for inserts/deletes to avoid null checks on head. Save curr.next before overwriting pointer."
    }
  },
  {
    "id": "dsa-lru-cache",
    "title": "LRU Cache",
    "titleSlug": "lru-cache",
    "url": "https://leetcode.com/problems/lru-cache/",
    "difficulty": "Medium",
    "pattern": "Linked List",
    "tags": [
      "Linked List",
      "HashMap",
      "Design"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "description": "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the LRUCache class:\n- LRUCache(int capacity) Initialize the LRU cache with positive size capacity.\n- int get(int key) Return value of key if key exists, otherwise return -1.\n- void put(int key, int value) Update value of key if exists. Otherwise, add key-value pair. If number of keys exceeds capacity, evict the least recently used key.\n\nFunctions get and put must each run in O(1) average time complexity.",
    "examples": [
      {
        "input": "[\"LRUCache\",\"put\",\"put\",\"get\",\"put\",\"get\",\"put\",\"get\",\"get\",\"get\"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]",
        "output": "[null,null,null,1,null,-1,null,-1,3,4]"
      }
    ],
    "constraints": [
      "1 <= capacity <= 3000",
      "0 <= key <= 10^4",
      "0 <= value <= 10^5",
      "At most 2 * 10^5 calls to get and put."
    ],
    "starterCode": {
      "Java": "class LRUCache {\n    public LRUCache(int capacity) {}\n    public int get(int key) { return -1; }\n    public void put(int key, int value) {}\n}",
      "Python": "class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n    def get(self, key: int) -> int:\n        return -1\n    def put(self, key: int, value: int) -> None:\n        pass",
      "TypeScript": "class LRUCache {\n    constructor(capacity: number) {}\n    get(key: number): number { return -1; }\n    put(key: number, value: number): void {}\n}",
      "C++": "class LRUCache {\npublic:\n    LRUCache(int capacity) {}\n    int get(int key) { return -1; }\n    void put(int key, int value) {}\n};",
      "Go": "type LRUCache struct {}\nfunc Constructor(capacity int) LRUCache { return LRUCache{} }\nfunc (this *LRUCache) Get(key int) int { return -1 }\nfunc (this *LRUCache) Put(key int, value int) {}"
    },
    "hints": [
      {
        "level": 1,
        "title": "HashMap + Doubly Linked List",
        "content": "HashMap provides O(1) lookup. Doubly Linked List allows O(1) node removal and insertion to the head."
      },
      {
        "level": 2,
        "title": "Dummy Head and Tail",
        "content": "Use sentinel head and tail nodes to avoid null checks when linking/unlinking nodes."
      },
      {
        "level": 3,
        "title": "Eviction and Promotion",
        "content": "On get or update, move node to head (most recently used). On capacity overflow, remove node before tail (least recently used)."
      }
    ],
    "solution": {
      "intuition": "Doubly Linked List handles O(1) node deletion and head insertion, while a HashMap provides O(1) key-to-node pointer lookup.",
      "approach": "Create Node class with prev, next, key, val. Keep dummy head and tail. On get(key): if present, removeNode(node), insertToHead(node), return node.val. On put(key, val): if present, update val and moveToHead. Else if size == capacity, evict tail.prev from list and map; insert newNode to head and map.",
      "timeComplexity": "O(1) for both get and put.",
      "spaceComplexity": "O(capacity) - storing up to capacity items.",
      "keyTakeaway": "The combination of HashMap and Doubly Linked List is the quintessential systems interview data structure.",
      "code": {
        "Java": "import java.util.*;\nclass LRUCache {\n    class Node { int k, v; Node prev, next; Node(int k, int v) { this.k = k; this.v = v; } }\n    private Map<Integer, Node> map = new HashMap<>();\n    private int cap; private Node head = new Node(0, 0), tail = new Node(0, 0);\n    public LRUCache(int capacity) {\n        this.cap = capacity;\n        head.next = tail; tail.prev = head;\n    }\n    public int get(int key) {\n        if (!map.containsKey(key)) return -1;\n        Node n = map.get(key);\n        remove(n); insert(n);\n        return n.v;\n    }\n    public void put(int key, int value) {\n        if (map.containsKey(key)) remove(map.get(key));\n        if (map.size() == cap) { map.remove(tail.prev.k); remove(tail.prev); }\n        Node n = new Node(key, value);\n        insert(n); map.put(key, n);\n    }\n    private void remove(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }\n    private void insert(Node n) { n.next = head.next; n.next.prev = n; head.next = n; n.prev = head; }\n}",
        "Python": "class Node:\n    def __init__(self, k, v):\n        self.k, self.v = k, v\n        self.prev = self.next = None\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity\n        self.map = {}\n        self.head, self.tail = Node(0, 0), Node(0, 0)\n        self.head.next, self.tail.prev = self.tail, self.head\n    def get(self, key: int) -> int:\n        if key not in self.map: return -1\n        node = self.map[key]\n        self._remove(node); self._insert(node)\n        return node.v\n    def put(self, key: int, value: int) -> None:\n        if key in self.map: self._remove(self.map[key])\n        elif len(self.map) == self.cap:\n            lru = self.tail.prev\n            self._remove(lru); del self.map[lru.k]\n        node = Node(key, value)\n        self._insert(node); self.map[key] = node\n    def _remove(self, node):\n        node.prev.next = node.next; node.next.prev = node.prev\n    def _insert(self, node):\n        node.next, node.prev = self.head.next, self.head\n        self.head.next.prev = self.head.next = node",
        "TypeScript": "class DNode { k: number; v: number; prev: DNode | null = null; next: DNode | null = null; constructor(k: number, v: number) { this.k = k; this.v = v; } }\nclass LRUCache {\n    private cap: number; private map = new Map<number, DNode>();\n    private head = new DNode(0, 0); private tail = new DNode(0, 0);\n    constructor(capacity: number) { this.cap = capacity; this.head.next = this.tail; this.tail.prev = this.head; }\n    get(key: number): number {\n        if (!this.map.has(key)) return -1;\n        const node = this.map.get(key)!;\n        this.remove(node); this.insert(node);\n        return node.v;\n    }\n    put(key: number, value: number): void {\n        if (this.map.has(key)) this.remove(this.map.get(key)!);\n        else if (this.map.size === this.cap) {\n            const lru = this.tail.prev!;\n            this.remove(lru); this.map.delete(lru.k);\n        }\n        const node = new DNode(key, value);\n        this.insert(node); this.map.set(key, node);\n    }\n    private remove(n: DNode) { n.prev!.next = n.next; n.next!.prev = n.prev; }\n    private insert(n: DNode) { n.next = this.head.next; n.next!.prev = n; this.head.next = n; n.prev = this.head; }\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "In-place pointer manipulation, reversal, dummy head technique to simplify edge cases at head or tail.",
      "coreTemplate": "const dummy = new ListNode(0);\ndummy.next = head;\nlet prev = null, curr = head;\nwhile (curr !== null) {\n  const next = curr.next;\n  curr.next = prev;\n  prev = curr;\n  curr = next;\n}",
      "pitfalls": "Always use a dummy node for inserts/deletes to avoid null checks on head. Save curr.next before overwriting pointer."
    }
  },
  {
    "id": "dsa-binary-tree-level-order-traversal",
    "title": "Binary Tree Level Order Traversal",
    "titleSlug": "binary-tree-level-order-traversal",
    "url": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    "difficulty": "Medium",
    "pattern": "Trees (BFS & DFS)",
    "tags": [
      "Trees",
      "BFS"
    ],
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Meta"
    ],
    "description": "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
    "examples": [
      {
        "input": "root = [3,9,20,null,null,15,7]",
        "output": "[[3],[9,20],[15,7]]"
      },
      {
        "input": "root = [1]",
        "output": "[[1]]"
      },
      {
        "input": "root = []",
        "output": "[]"
      }
    ],
    "constraints": [
      "Number of nodes is [0, 2000].",
      "-1000 <= Node.val <= 1000"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        return new ArrayList<>();\n    }\n}",
      "Python": "class Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\n        pass",
      "TypeScript": "function levelOrder(root: TreeNode | null): number[][] {\n    return [];\n}",
      "C++": "class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        return {};\n    }\n};",
      "Go": "func levelOrder(root *TreeNode) [][]int {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Queue for BFS",
        "content": "Use a Queue FIFO structure starting with root."
      },
      {
        "level": 2,
        "title": "Level Size Snapshot",
        "content": "At the start of each level, record levelSize = queue.size(). Process exactly levelSize nodes for that level."
      },
      {
        "level": 3,
        "title": "Child Enqueue",
        "content": "Enqueue left and right children if they exist."
      }
    ],
    "solution": {
      "intuition": "Breadth-First Search naturally processes nodes layer by layer when snapping queue size at the start of each iteration.",
      "approach": "If root is null return empty list. Initialize queue with root. While queue is not empty: levelSize = queue.size(), create level list. Loop levelSize times: pop node, add node.val to level, enqueue left/right children. Add level to result.",
      "timeComplexity": "O(N) - every node processed once.",
      "spaceComplexity": "O(N) - queue holds at most N/2 leaf nodes.",
      "keyTakeaway": "Snapping queue size at the beginning of each BFS round segments elements into discrete levels.",
      "code": {
        "Java": "import java.util.*;\nclass Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        List<List<Integer>> res = new ArrayList<>();\n        if (root == null) return res;\n        Queue<TreeNode> q = new ArrayDeque<>();\n        q.add(root);\n        while (!q.isEmpty()) {\n            int size = q.size();\n            List<Integer> level = new ArrayList<>(size);\n            for (int i = 0; i < size; i++) {\n                TreeNode n = q.poll();\n                level.add(n.val);\n                if (n.left != null) q.add(n.left);\n                if (n.right != null) q.add(n.right);\n            }\n            res.add(level);\n        }\n        return res;\n    }\n}",
        "Python": "from collections import deque\nclass Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:\n        if not root: return []\n        res, q = [], deque([root])\n        while q:\n            level = []\n            for _ in range(len(q)):\n                node = q.popleft()\n                level.append(node.val)\n                if node.left: q.append(node.left)\n                if node.right: q.append(node.right)\n            res.append(level)\n        return res",
        "TypeScript": "function levelOrder(root: TreeNode | null): number[][] {\n    if (!root) return [];\n    const res: number[][] = [], queue: TreeNode[] = [root];\n    while (queue.length > 0) {\n        const size = queue.length, level: number[] = [];\n        for (let i = 0; i < size; i++) {\n            const n = queue.shift()!;\n            level.push(n.val);\n            if (n.left) queue.push(n.left);\n            if (n.right) queue.push(n.right);\n        }\n        res.push(level);\n    }\n    return res;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Hierarchical traversals, subtree aggregation, diameter, path sums, level-by-level processing.",
      "coreTemplate": "function dfs(node) {\n  if (!node) return 0;\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n  return 1 + Math.max(left, right);\n}",
      "pitfalls": "Global vs local maximums (e.g. tree diameter vs node depth). Remember base case if (!node) return ..."
    }
  },
  {
    "id": "dsa-implement-trie-prefix-tree",
    "title": "Implement Trie (Prefix Tree)",
    "titleSlug": "implement-trie-prefix-tree",
    "url": "https://leetcode.com/problems/implement-trie-prefix-tree/",
    "difficulty": "Medium",
    "pattern": "Tries",
    "tags": [
      "Trie",
      "Design",
      "Strings"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Apple"
    ],
    "description": "A trie (pronounced as \"try\") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. There are various applications of this data structure, such as autocomplete and spellchecker.\n\nImplement the Trie class:\n- Trie() Initializes the trie object.\n- void insert(String word) Inserts the string word into the trie.\n- boolean search(String word) Returns true if the string word is in the trie (i.e., was inserted before), and false otherwise.\n- boolean startsWith(String prefix) Returns true if there is a previously inserted string word that has the prefix prefix, and false otherwise.",
    "examples": [
      {
        "input": "[\"Trie\", \"insert\", \"search\", \"search\", \"startsWith\", \"insert\", \"search\"]\n[[], [\"apple\"], [\"apple\"], [\"app\"], [\"app\"], [\"app\"], [\"app\"]]",
        "output": "[null, null, true, false, true, null, true]"
      }
    ],
    "constraints": [
      "1 <= word.length, prefix.length <= 2000",
      "word and prefix consist only of lowercase English letters."
    ],
    "starterCode": {
      "Java": "class Trie {\n    public Trie() {}\n    public void insert(String word) {}\n    public boolean search(String word) { return false; }\n    public boolean startsWith(String prefix) { return false; }\n}",
      "Python": "class Trie:\n    def __init__(self):\n        pass\n    def insert(self, word: str) -> None:\n        pass\n    def search(self, word: str) -> bool:\n        return False\n    def startsWith(self, prefix: str) -> bool:\n        return False",
      "TypeScript": "class Trie {\n    constructor() {}\n    insert(word: string): void {}\n    search(word: string): boolean { return false; }\n    startsWith(prefix: string): boolean { return false; }\n}",
      "C++": "class Trie {\npublic:\n    Trie() {}\n    void insert(string word) {}\n    bool search(string word) { return false; }\n    bool startsWith(string prefix) { return false; }\n};",
      "Go": "type Trie struct {}\nfunc Constructor() Trie { return Trie{} }\nfunc (this *Trie) Insert(word string) {}\nfunc (this *Trie) Search(word string) bool { return false }\nfunc (this *Trie) StartsWith(prefix string) bool { return false }"
    },
    "hints": [
      {
        "level": 1,
        "title": "Node Representation",
        "content": "Each node has children[26] array or a hash map, and a boolean flag isEnd."
      },
      {
        "level": 2,
        "title": "Insertion & Search",
        "content": "Traverse character by character down child pointers, creating nodes if missing."
      },
      {
        "level": 3,
        "title": "search vs startsWith",
        "content": "search requires node.isEnd == true. startsWith only requires that all characters exist in the path."
      }
    ],
    "solution": {
      "intuition": "Each trie node branches up to 26 times for lowercase English letters, enabling word and prefix queries in linear time with respect to word length O(L).",
      "approach": "Create TrieNode class with children: TrieNode[26] and isEnd: boolean. For insert, walk from root creating children and mark final isEnd = true. For search, traverse path and return node != null && node.isEnd. For startsWith, traverse path and return node != null.",
      "timeComplexity": "O(L) for insert, search, and startsWith where L is word/prefix length.",
      "spaceComplexity": "O(N * L) total characters stored in the tree.",
      "keyTakeaway": "Tries trade space to achieve optimal prefix lookup independent of dictionary size.",
      "code": {
        "Java": "class Trie {\n    class Node { Node[] ch = new Node[26]; boolean isEnd; }\n    private Node root = new Node();\n    public void insert(String word) {\n        Node curr = root;\n        for (char c : word.toCharArray()) {\n            if (curr.ch[c - 'a'] == null) curr.ch[c - 'a'] = new Node();\n            curr = curr.ch[c - 'a'];\n        }\n        curr.isEnd = true;\n    }\n    public boolean search(String word) {\n        Node n = find(word);\n        return n != null && n.isEnd;\n    }\n    public boolean startsWith(String prefix) {\n        return find(prefix) != null;\n    }\n    private Node find(String s) {\n        Node curr = root;\n        for (char c : s.toCharArray()) {\n            if (curr.ch[c - 'a'] == null) return null;\n            curr = curr.ch[c - 'a'];\n        }\n        return curr;\n    }\n}",
        "Python": "class Trie:\n    def __init__(self):\n        self.root = {}\n    def insert(self, word: str) -> None:\n        curr = self.root\n        for c in word:\n            if c not in curr: curr[c] = {}\n            curr = curr[c]\n        curr['#'] = True\n    def search(self, word: str) -> bool:\n        curr = self.root\n        for c in word:\n            if c not in curr: return False\n            curr = curr[c]\n        return '#' in curr\n    def startsWith(self, prefix: str) -> bool:\n        curr = self.root\n        for c in prefix:\n            if c not in curr: return False\n            curr = curr[c]\n        return True",
        "TypeScript": "class TrieNode { children = new Map<string, TrieNode>(); isEnd = false; }\nclass Trie {\n    private root = new TrieNode();\n    insert(word: string): void {\n        let curr = this.root;\n        for (const c of word) {\n            if (!curr.children.has(c)) curr.children.set(c, new TrieNode());\n            curr = curr.children.get(c)!;\n        }\n        curr.isEnd = true;\n    }\n    search(word: string): boolean {\n        let curr = this.root;\n        for (const c of word) {\n            if (!curr.children.has(c)) return false;\n            curr = curr.children.get(c)!;\n        }\n        return curr.isEnd;\n    }\n    startsWith(prefix: string): boolean {\n        let curr = this.root;\n        for (const c of prefix) {\n            if (!curr.children.has(c)) return false;\n            curr = curr.children.get(c)!;\n        }\n        return true;\n    }\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Prefix queries, dictionary lookup, autocomplete, prefix matching in linear time with respect to word length O(L).",
      "coreTemplate": "class TrieNode {\n  constructor() {\n    this.children = {};\n    this.isWord = false;\n  }\n}",
      "pitfalls": "Do not forget the isWord flag to differentiate a complete word from a prefix of a longer word."
    }
  },
  {
    "id": "dsa-subsets",
    "title": "Subsets",
    "titleSlug": "subsets",
    "url": "https://leetcode.com/problems/subsets/",
    "difficulty": "Medium",
    "pattern": "Backtracking",
    "tags": [
      "Backtracking",
      "Arrays",
      "Bit Manipulation"
    ],
    "companies": [
      "Meta",
      "Amazon",
      "Google",
      "Microsoft",
      "Bloomberg"
    ],
    "description": "Given an integer array nums of unique elements, return all possible subsets (the power set).\n\nThe solution set must not contain duplicate subsets. Return the solution in any order.",
    "examples": [
      {
        "input": "nums = [1,2,3]",
        "output": "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]"
      },
      {
        "input": "nums = [0]",
        "output": "[[],[0]]"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10",
      "-10 <= nums[i] <= 10",
      "All numbers of nums are unique."
    ],
    "starterCode": {
      "Java": "class Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        return new ArrayList<>();\n    }\n}",
      "Python": "class Solution:\n    def subsets(self, nums: List[int]) -> List[List[int]]:\n        pass",
      "TypeScript": "function subsets(nums: number[]): number[][] {\n    return [];\n}",
      "C++": "class Solution {\npublic:\n    vector<vector<int>> subsets(vector<int>& nums) {\n        return {};\n    }\n};",
      "Go": "func subsets(nums []int) [][]int {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Decision Tree",
        "content": "For each element, we have two choices: include it in the current subset or exclude it."
      },
      {
        "level": 2,
        "title": "Snapshot at Each Step",
        "content": "At every recursive call, add a copy of the current path to the result list."
      },
      {
        "level": 3,
        "title": "Backtrack Template",
        "content": "Choose (push), Explore (recurse with index + 1), Un-choose (pop)."
      }
    ],
    "solution": {
      "intuition": "Every subset corresponds to a branch in a binary decision tree of whether to include or exclude each element.",
      "approach": "Create result list. Define backtrack(start, path): add new copy of path to result. Loop i from start to nums.length - 1: path.push(nums[i]), backtrack(i + 1, path), path.pop(). Call backtrack(0, []).",
      "timeComplexity": "O(N * 2^N) - generating all 2^N subsets of length up to N.",
      "spaceComplexity": "O(N) - recursion depth.",
      "keyTakeaway": "The canonical backtracking template for combination generation.",
      "code": {
        "Java": "import java.util.*;\nclass Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        List<List<Integer>> res = new ArrayList<>();\n        backtrack(nums, 0, new ArrayList<>(), res);\n        return res;\n    }\n    private void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> res) {\n        res.add(new ArrayList<>(path));\n        for (int i = start; i < nums.length; i++) {\n            path.add(nums[i]);\n            backtrack(nums, i + 1, path, res);\n            path.remove(path.size() - 1);\n        }\n    }\n}",
        "Python": "class Solution:\n    def subsets(self, nums: list[int]) -> list[list[int]]:\n        res = []\n        def backtrack(start, path):\n            res.append(list(path))\n            for i in range(start, len(nums)):\n                path.append(nums[i])\n                backtrack(i + 1, path)\n                path.pop()\n        backtrack(0, [])\n        return res",
        "TypeScript": "function subsets(nums: number[]): number[][] {\n    const res: number[][] = [];\n    function backtrack(start: number, path: number[]) {\n        res.push([...path]);\n        for (let i = start; i < nums.length; i++) {\n            path.push(nums[i]);\n            backtrack(i + 1, path);\n            path.pop();\n        }\n    }\n    backtrack(0, []);\n    return res;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Exhaustive combinatorial search (subsets, permutations, combinations, grid paths, N-Queens).",
      "coreTemplate": "function backtrack(start, path) {\n  if (isSolution(path)) {\n    result.push([...path]);\n    return;\n  }\n  for (let i = start; i < candidates.length; i++) {\n    path.push(candidates[i]); // Choose\n    backtrack(i + 1, path);   // Explore\n    path.pop();               // Un-choose\n  }\n}",
      "pitfalls": "Always clone/copy the current path when adding to results. Deduplicate candidates by sorting first."
    }
  },
  {
    "id": "dsa-house-robber",
    "title": "House Robber",
    "titleSlug": "house-robber",
    "url": "https://leetcode.com/problems/house-robber/",
    "difficulty": "Medium",
    "pattern": "1D Dynamic Programming",
    "tags": [
      "Dynamic Programming",
      "Arrays"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Apple"
    ],
    "description": "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.\n\nGiven an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
    "examples": [
      {
        "input": "nums = [1,2,3,1]",
        "output": "4",
        "explanation": "Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 4."
      },
      {
        "input": "nums = [2,7,9,3,1]",
        "output": "12"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 100",
      "0 <= nums[i] <= 400"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int rob(int[] nums) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def rob(self, nums: List[int]) -> int:\n        pass",
      "TypeScript": "function rob(nums: number[]): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int rob(vector<int>& nums) {\n        return 0;\n    }\n};",
      "Go": "func rob(nums []int) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Recurrence Relation",
        "content": "At house i, you either rob house i (nums[i] + rob(i-2)) or skip house i (rob(i-1))."
      },
      {
        "level": 2,
        "title": "dp[i] Formula",
        "content": "dp[i] = max(dp[i-1], dp[i-2] + nums[i])."
      },
      {
        "level": 3,
        "title": "O(1) Space",
        "content": "You only need to track the two previous values: rob1 and rob2."
      }
    ],
    "solution": {
      "intuition": "At each house, the decision is whether to skip it (keeping previous max) or rob it (adding its cash to the max from two houses ago).",
      "approach": "Initialize rob1 = 0, rob2 = 0. For each n in nums: temp = max(rob1 + n, rob2); rob1 = rob2; rob2 = temp. Return rob2.",
      "timeComplexity": "O(N) - single pass.",
      "spaceComplexity": "O(1) - two variables.",
      "keyTakeaway": "The non-adjacent choice recurrence is the basis of many dynamic programming problems.",
      "code": {
        "Java": "class Solution {\n    public int rob(int[] nums) {\n        int rob1 = 0, rob2 = 0;\n        for (int n : nums) {\n            int temp = Math.max(rob1 + n, rob2);\n            rob1 = rob2;\n            rob2 = temp;\n        }\n        return rob2;\n    }\n}",
        "Python": "class Solution:\n    def rob(self, nums: list[int]) -> int:\n        rob1 = rob2 = 0\n        for n in nums:\n            rob1, rob2 = rob2, max(rob1 + n, rob2)\n        return rob2",
        "TypeScript": "function rob(nums: number[]): number {\n    let rob1 = 0, rob2 = 0;\n    for (const n of nums) {\n        const temp = Math.max(rob1 + n, rob2);\n        rob1 = rob2;\n        rob2 = temp;\n    }\n    return rob2;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Optimal substructure and overlapping subproblems where answer depends on previous 1 or 2 states (Fibonacci, House Robber, Coin Change).",
      "coreTemplate": "const dp = new Array(amount + 1).fill(Infinity);\ndp[0] = 0;\nfor (let i = 1; i <= amount; i++) {\n  for (const c of coins) {\n    if (i - c >= 0) dp[i] = Math.min(dp[i], 1 + dp[i - c]);\n  }\n}",
      "pitfalls": "Check base cases carefully. Often O(N) space can be optimized to O(1) space with two variables."
    }
  },
  {
    "id": "dsa-kth-largest-element-in-an-array",
    "title": "Kth Largest Element in an Array",
    "titleSlug": "kth-largest-element-in-an-array",
    "url": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "difficulty": "Medium",
    "pattern": "Heap & Priority Queue",
    "tags": [
      "Heap",
      "Sorting",
      "Divide and Conquer",
      "Quickselect"
    ],
    "companies": [
      "Meta",
      "Amazon",
      "Google",
      "Apple",
      "Microsoft"
    ],
    "description": "Given an integer array nums and an integer k, return the kth largest element in the array.\n\nNote that it is the kth largest element in the sorted order, not the kth distinct element.\n\nCan you solve it without sorting?",
    "examples": [
      {
        "input": "nums = [3,2,1,5,6,4], k = 2",
        "output": "5"
      },
      {
        "input": "nums = [3,2,3,1,2,4,5,5,6], k = 4",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= k <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def findKthLargest(self, nums: List[int], k: int) -> int:\n        pass",
      "TypeScript": "function findKthLargest(nums: number[], k: number): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        return 0;\n    }\n};",
      "Go": "func findKthLargest(nums []int, k int) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Min-Heap of Size K",
        "content": "Use a min-heap to keep track of the k largest elements seen so far."
      },
      {
        "level": 2,
        "title": "Eviction Invariant",
        "content": "When the heap exceeds size k, evict the smallest element (pq.poll()). The root of the heap is always the kth largest."
      },
      {
        "level": 3,
        "title": "Quickselect Alternative",
        "content": "Quickselect achieves O(N) average time by partitioning around a pivot without maintaining a heap."
      }
    ],
    "solution": {
      "intuition": "A min-heap bounded at size k holds the k largest numbers; its minimum element is precisely the kth largest.",
      "approach": "Create a PriorityQueue (min-heap). For each num in nums: add num to heap. If heap size > k, poll from heap. Finally return heap.peek().",
      "timeComplexity": "O(N log K) - heap contains at most K elements.",
      "spaceComplexity": "O(K) - heap memory.",
      "keyTakeaway": "To find the K largest elements, maintain a MIN-heap of size K so the smallest among the top K is at the top.",
      "code": {
        "Java": "import java.util.*;\nclass Solution {\n    public int findKthLargest(int[] nums, int k) {\n        PriorityQueue<Integer> pq = new PriorityQueue<>(k);\n        for (int n : nums) {\n            pq.add(n);\n            if (pq.size() > k) pq.poll();\n        }\n        return pq.peek();\n    }\n}",
        "Python": "import heapq\nclass Solution:\n    def findKthLargest(self, nums: list[int], k: int) -> int:\n        return heapq.nlargest(k, nums)[-1]",
        "TypeScript": "function findKthLargest(nums: number[], k: number): number {\n    nums.sort((a, b) => b - a);\n    return nums[k - 1];\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Top-K elements, streaming running median, scheduling tasks, merging K sorted streams.",
      "coreTemplate": "// Min-heap of size K keeps top K largest elements\nconst pq = new MinPriorityQueue();\nfor (const num of nums) {\n  pq.enqueue(num);\n  if (pq.size() > k) pq.dequeue();\n}",
      "pitfalls": "To find top K largest, use a MIN-heap of size K. To find top K smallest, use a MAX-heap."
    }
  },
  {
    "id": "dsa-find-median-from-data-stream",
    "title": "Find Median from Data Stream",
    "titleSlug": "find-median-from-data-stream",
    "url": "https://leetcode.com/problems/find-median-from-data-stream/",
    "difficulty": "Hard",
    "pattern": "Heap & Priority Queue",
    "tags": [
      "Heap",
      "Design",
      "Data Stream"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Meta",
      "Microsoft",
      "Bloomberg"
    ],
    "description": "The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.\n\nImplement the MedianFinder class:\n- MedianFinder() initializes the MedianFinder object.\n- void addNum(int num) adds the integer num from the data stream to the data structure.\n- double findMedian() returns the median of all elements so far.",
    "examples": [
      {
        "input": "[\"MedianFinder\",\"addNum\",\"addNum\",\"findMedian\",\"addNum\",\"findMedian\"]\n[[],[1],[2],[],[3],[]]",
        "output": "[null,null,null,1.5,null,2.0]"
      }
    ],
    "constraints": [
      "-10^5 <= num <= 10^5",
      "At most 5 * 10^4 calls will be made to addNum and findMedian."
    ],
    "starterCode": {
      "Java": "class MedianFinder {\n    public MedianFinder() {}\n    public void addNum(int num) {}\n    public double findMedian() { return 0.0; }\n}",
      "Python": "class MedianFinder:\n    def __init__(self):\n        pass\n    def addNum(self, num: int) -> None:\n        pass\n    def findMedian(self) -> double:\n        return 0.0",
      "TypeScript": "class MedianFinder {\n    constructor() {}\n    addNum(num: number): void {}\n    findMedian(): number { return 0; }\n}",
      "C++": "class MedianFinder {\npublic:\n    MedianFinder() {}\n    void addNum(int num) {}\n    double findMedian() { return 0.0; }\n};",
      "Go": "type MedianFinder struct {}\nfunc Constructor() MedianFinder { return MedianFinder{} }\nfunc (this *MedianFinder) AddNum(num int) {}\nfunc (this *MedianFinder) FindMedian() float64 { return 0 }"
    },
    "hints": [
      {
        "level": 1,
        "title": "Two Heaps Blueprint",
        "content": "Divide the numbers into two halves: small half (max-heap) and large half (min-heap)."
      },
      {
        "level": 2,
        "title": "Balancing Sizes",
        "content": "Ensure max-heap has either equal elements or exactly 1 more element than min-heap."
      },
      {
        "level": 3,
        "title": "Median Calculation",
        "content": "If sizes are equal, median is average of the two roots. If odd, median is root of max-heap."
      }
    ],
    "solution": {
      "intuition": "Two heaps (max-heap for smaller half, min-heap for larger half) allow O(log N) insertion and O(1) median retrieval.",
      "approach": "Add num to maxHeap. Move maxHeap.poll() to minHeap. If minHeap.size() > maxHeap.size(), balance by moving minHeap.poll() to maxHeap. For findMedian: if sizes unequal, return maxHeap.peek(); else return (maxHeap.peek() + minHeap.peek()) / 2.0.",
      "timeComplexity": "O(log N) for addNum, O(1) for findMedian.",
      "spaceComplexity": "O(N) to store incoming stream.",
      "keyTakeaway": "The two-heap pattern is standard for dynamic partitioning and percentile queries on streaming data.",
      "code": {
        "Java": "import java.util.*;\nclass MedianFinder {\n    private PriorityQueue<Integer> small = new PriorityQueue<>(Collections.reverseOrder());\n    private PriorityQueue<Integer> large = new PriorityQueue<>();\n    public void addNum(int num) {\n        small.add(num);\n        large.add(small.poll());\n        if (large.size() > small.size()) small.add(large.poll());\n    }\n    public double findMedian() {\n        return small.size() > large.size() ? small.peek() : (small.peek() + large.peek()) / 2.0;\n    }\n}",
        "Python": "import heapq\nclass MedianFinder:\n    def __init__(self):\n        self.small, self.large = [], []\n    def addNum(self, num: int) -> None:\n        heapq.heappush(self.small, -num)\n        heapq.heappush(self.large, -heapq.heappop(self.small))\n        if len(self.large) > len(self.small):\n            heapq.heappush(self.small, -heapq.heappop(self.large))\n    def findMedian(self) -> float:\n        if len(self.small) > len(self.large): return -self.small[0]\n        return (-self.small[0] + self.large[0]) / 2.0",
        "TypeScript": "class MedianFinder {\n    private nums: number[] = [];\n    addNum(num: number): void {\n        let l = 0, r = this.nums.length;\n        while (l < r) {\n            const mid = (l + r) >> 1;\n            if (this.nums[mid] < num) l = mid + 1;\n            else r = mid;\n        }\n        this.nums.splice(l, 0, num);\n    }\n    findMedian(): number {\n        const n = this.nums.length, mid = Math.floor(n / 2);\n        return n % 2 === 1 ? this.nums[mid] : (this.nums[mid - 1] + this.nums[mid]) / 2;\n    }\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Top-K elements, streaming running median, scheduling tasks, merging K sorted streams.",
      "coreTemplate": "// Min-heap of size K keeps top K largest elements\nconst pq = new MinPriorityQueue();\nfor (const num of nums) {\n  pq.enqueue(num);\n  if (pq.size() > k) pq.dequeue();\n}",
      "pitfalls": "To find top K largest, use a MIN-heap of size K. To find top K smallest, use a MAX-heap."
    }
  },
  {
    "id": "dsa-combination-sum",
    "title": "Combination Sum",
    "titleSlug": "combination-sum",
    "url": "https://leetcode.com/problems/combination-sum/",
    "difficulty": "Medium",
    "pattern": "Backtracking",
    "tags": [
      "Backtracking",
      "Arrays"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Bloomberg"
    ],
    "description": "Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. You may return the combinations in any order.\n\nThe same number may be chosen from candidates an unlimited number of times. Two combinations are unique if the frequency of at least one of the chosen numbers is different.",
    "examples": [
      {
        "input": "candidates = [2,3,6,7], target = 7",
        "output": "[[2,2,3],[7]]"
      },
      {
        "input": "candidates = [2,3,5], target = 8",
        "output": "[[2,2,2,2],[2,3,3],[3,5]]"
      }
    ],
    "constraints": [
      "1 <= candidates.length <= 30",
      "2 <= candidates[i] <= 40",
      "All elements of candidates are distinct.",
      "1 <= target <= 40"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public List<List<Integer>> combinationSum(int[] candidates, int target) {\n        return new ArrayList<>();\n    }\n}",
      "Python": "class Solution:\n    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:\n        pass",
      "TypeScript": "function combinationSum(candidates: number[], target: number): number[][] {\n    return [];\n}",
      "C++": "class Solution {\npublic:\n    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {\n        return {};\n    }\n};",
      "Go": "func combinationSum(candidates []int, target int) [][]int {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Unlimited Reuse",
        "content": "Since candidates can be reused, stay at the same index i in recursive calls."
      },
      {
        "level": 2,
        "title": "Pruning with Sort",
        "content": "Sort candidates first so you can break the loop early when candidates[i] > remainingTarget."
      },
      {
        "level": 3,
        "title": "Backtracking State",
        "content": "track path and remaining target. When remaining == 0, save a copy of path."
      }
    ],
    "solution": {
      "intuition": "Explore combinations using a DFS decision tree where each branch either reuses the current candidate or moves to the next.",
      "approach": "Sort candidates. In backtrack(start, remain, path): if remain == 0, res.add(copy of path); return. For i from start to len: if candidates[i] > remain break (prune); path.add(candidates[i]); backtrack(i, remain - candidates[i], path); path.removeLast().",
      "timeComplexity": "O(N^(T/M)) where T is target and M is min candidate value.",
      "spaceComplexity": "O(T/M) for recursion stack.",
      "keyTakeaway": "Pruning branches early by sorting candidates prevents exploring dead-end subtrees.",
      "code": {
        "Java": "import java.util.*;\nclass Solution {\n    public List<List<Integer>> combinationSum(int[] candidates, int target) {\n        Arrays.sort(candidates);\n        List<List<Integer>> res = new ArrayList<>();\n        backtrack(candidates, 0, target, new ArrayList<>(), res);\n        return res;\n    }\n    private void backtrack(int[] c, int start, int remain, List<Integer> path, List<List<Integer>> res) {\n        if (remain == 0) { res.add(new ArrayList<>(path)); return; }\n        for (int i = start; i < c.length && c[i] <= remain; i++) {\n            path.add(c[i]);\n            backtrack(c, i, remain - c[i], path, res);\n            path.remove(path.size() - 1);\n        }\n    }\n}",
        "Python": "class Solution:\n    def combinationSum(self, candidates: list[int], target: int) -> list[list[int]]:\n        candidates.sort()\n        res = []\n        def backtrack(start, remain, path):\n            if remain == 0:\n                res.append(list(path)); return\n            for i in range(start, len(candidates)):\n                if candidates[i] > remain: break\n                path.append(candidates[i])\n                backtrack(i, remain - candidates[i], path)\n                path.pop()\n        backtrack(0, target, [])\n        return res",
        "TypeScript": "function combinationSum(candidates: number[], target: number): number[][] {\n    candidates.sort((a, b) => a - b);\n    const res: number[][] = [];\n    function backtrack(start: number, remain: number, path: number[]) {\n        if (remain === 0) { res.push([...path]); return; }\n        for (let i = start; i < candidates.length && candidates[i] <= remain; i++) {\n            path.push(candidates[i]);\n            backtrack(i, remain - candidates[i], path);\n            path.pop();\n        }\n    }\n    backtrack(0, target, []);\n    return res;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Exhaustive combinatorial search (subsets, permutations, combinations, grid paths, N-Queens).",
      "coreTemplate": "function backtrack(start, path) {\n  if (isSolution(path)) {\n    result.push([...path]);\n    return;\n  }\n  for (let i = start; i < candidates.length; i++) {\n    path.push(candidates[i]); // Choose\n    backtrack(i + 1, path);   // Explore\n    path.pop();               // Un-choose\n  }\n}",
      "pitfalls": "Always clone/copy the current path when adding to results. Deduplicate candidates by sorting first."
    }
  },
  {
    "id": "dsa-word-search",
    "title": "Word Search",
    "titleSlug": "word-search",
    "url": "https://leetcode.com/problems/word-search/",
    "difficulty": "Medium",
    "pattern": "Backtracking",
    "tags": [
      "Backtracking",
      "Matrix",
      "Arrays"
    ],
    "companies": [
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Google",
      "Meta"
    ],
    "description": "Given an m x n grid of characters board and a string word, return true if word exists in the grid.\n\nThe word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.",
    "examples": [
      {
        "input": "board = [[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word = \"ABCCED\"",
        "output": "true"
      },
      {
        "input": "board = [[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word = \"SEE\"",
        "output": "true"
      },
      {
        "input": "board = [[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word = \"ABCB\"",
        "output": "false"
      }
    ],
    "constraints": [
      "m == board.length",
      "n == board[i].length",
      "1 <= m, n <= 6",
      "1 <= word.length <= 15"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public boolean exist(char[][] board, String word) {\n        return false;\n    }\n}",
      "Python": "class Solution:\n    def exist(self, board: List[List[str]], word: str) -> bool:\n        pass",
      "TypeScript": "function exist(board: string[][], word: string): boolean {\n    return false;\n}",
      "C++": "class Solution {\npublic:\n    bool exist(vector<vector<char>>& board, string word) {\n        return false;\n    }\n};",
      "Go": "func exist(board [][]byte, word string) bool {\n    return false\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "DFS Search",
        "content": "For each cell matching word[0], begin a depth-first search in the 4 directions."
      },
      {
        "level": 2,
        "title": "In-Place Visited Masking",
        "content": "Temporarily replace board[r][c] with '#' to mark it visited, restoring it after exploring."
      },
      {
        "level": 3,
        "title": "Early Exit",
        "content": "Return true immediately if any branch matches the entire word."
      }
    ],
    "solution": {
      "intuition": "Backtracking explores path possibilities on the 2D grid while in-place marking prevents reusing characters.",
      "approach": "Iterate every cell (r, c). If board[r][c] == word[0] and dfs(r, c, 0) is true, return true. In dfs: if idx == word.length return true. If out of bounds or mismatch, return false. Mark board[r][c] = '#', explore 4 directions with idx + 1. Restore board[r][c]. Return found.",
      "timeComplexity": "O(N * 3^L) where N is cell count and L is word length.",
      "spaceComplexity": "O(L) for call stack.",
      "keyTakeaway": "In-place state mutation followed by restoration is the cleanest pattern for 2D grid backtracking.",
      "code": {
        "Java": "class Solution {\n    public boolean exist(char[][] board, String word) {\n        for (int r = 0; r < board.length; r++) {\n            for (int c = 0; c < board[0].length; c++) {\n                if (dfs(board, word, r, c, 0)) return true;\n            }\n        }\n        return false;\n    }\n    private boolean dfs(char[][] b, String w, int r, int c, int i) {\n        if (i == w.length()) return true;\n        if (r < 0 || r >= b.length || c < 0 || c >= b[0].length || b[r][c] != w.charAt(i)) return false;\n        char temp = b[r][c];\n        b[r][c] = '#';\n        boolean found = dfs(b, w, r + 1, c, i + 1) || dfs(b, w, r - 1, c, i + 1) ||\n                        dfs(b, w, r, c + 1, i + 1) || dfs(b, w, r, c - 1, i + 1);\n        b[r][c] = temp;\n        return found;\n    }\n}",
        "Python": "class Solution:\n    def exist(self, board: list[list[str]], word: str) -> bool:\n        m, n = len(board), len(board[0])\n        def dfs(r, c, i):\n            if i == len(word): return True\n            if r < 0 or r >= m or c < 0 or c >= n or board[r][c] != word[i]: return False\n            temp, board[r][c] = board[r][c], '#'\n            found = dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1) or dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1)\n            board[r][c] = temp\n            return found\n        for r in range(m):\n            for c in range(n):\n                if dfs(r, c, 0): return True\n        return False",
        "TypeScript": "function exist(board: string[][], word: string): boolean {\n    const m = board.length, n = board[0].length;\n    function dfs(r: number, c: number, i: number): boolean {\n        if (i === word.length) return true;\n        if (r < 0 || r >= m || c < 0 || c >= n || board[r][c] !== word[i]) return false;\n        const temp = board[r][c];\n        board[r][c] = '#';\n        const found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);\n        board[r][c] = temp;\n        return found;\n    }\n    for (let r = 0; r < m; r++) {\n        for (let c = 0; c < n; c++) {\n            if (dfs(r, c, 0)) return true;\n        }\n    }\n    return false;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Exhaustive combinatorial search (subsets, permutations, combinations, grid paths, N-Queens).",
      "coreTemplate": "function backtrack(start, path) {\n  if (isSolution(path)) {\n    result.push([...path]);\n    return;\n  }\n  for (let i = start; i < candidates.length; i++) {\n    path.push(candidates[i]); // Choose\n    backtrack(i + 1, path);   // Explore\n    path.pop();               // Un-choose\n  }\n}",
      "pitfalls": "Always clone/copy the current path when adding to results. Deduplicate candidates by sorting first."
    }
  },
  {
    "id": "dsa-rotting-oranges",
    "title": "Rotting Oranges",
    "titleSlug": "rotting-oranges",
    "url": "https://leetcode.com/problems/rotting-oranges/",
    "difficulty": "Medium",
    "pattern": "Graphs (BFS & DFS)",
    "tags": [
      "Graphs",
      "BFS",
      "Matrix"
    ],
    "companies": [
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Google"
    ],
    "description": "You are given an m x n grid where each cell can have one of three values:\n- 0 representing an empty cell,\n- 1 representing a fresh orange, or\n- 2 representing a rotten orange.\n\nEvery minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.\n\nReturn the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.",
    "examples": [
      {
        "input": "grid = [[2,1,1],[1,1,0],[0,1,1]]",
        "output": "4"
      },
      {
        "input": "grid = [[2,1,1],[0,1,1],[1,0,1]]",
        "output": "-1"
      },
      {
        "input": "grid = [[0,2]]",
        "output": "0"
      }
    ],
    "constraints": [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 10"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int orangesRotting(int[][] grid) {\n        return -1;\n    }\n}",
      "Python": "class Solution:\n    def orangesRotting(self, grid: List[List[int]]) -> int:\n        pass",
      "TypeScript": "function orangesRotting(grid: number[][]): number {\n    return -1;\n}",
      "C++": "class Solution {\npublic:\n    int orangesRotting(vector<vector<int>>& grid) {\n        return -1;\n    }\n};",
      "Go": "func orangesRotting(grid [][]int) int {\n    return -1\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Multi-Source BFS",
        "content": "All initial rotten oranges start rotting their neighbors simultaneously at minute 0."
      },
      {
        "level": 2,
        "title": "Track Fresh Count",
        "content": "Count total fresh oranges initially. If fresh == 0, return 0 immediately."
      },
      {
        "level": 3,
        "title": "Minute Waves",
        "content": "Process queue level-by-level. Each full round of queue size corresponds to 1 elapsed minute."
      }
    ],
    "solution": {
      "intuition": "Multi-source BFS models simultaneous infection spread across the grid minute by minute.",
      "approach": "1. Scan grid: enqueue all rotten oranges (2) and count fresh oranges (1).\n2. If fresh == 0 return 0.\n3. While queue not empty and fresh > 0: process level, rot adjacent fresh oranges, decrement fresh, increment minutes.\n4. Return fresh == 0 ? minutes : -1.",
      "timeComplexity": "O(M * N) - each cell entered into queue at most once.",
      "spaceComplexity": "O(M * N) - queue storage.",
      "keyTakeaway": "Multi-source BFS is ideal for modeling simultaneous propagation in grids.",
      "code": {
        "Java": "import java.util.*;\nclass Solution {\n    public int orangesRotting(int[][] grid) {\n        int m = grid.length, n = grid[0].length, fresh = 0;\n        Queue<int[]> q = new ArrayDeque<>();\n        for (int r = 0; r < m; r++) {\n            for (int c = 0; c < n; c++) {\n                if (grid[r][c] == 2) q.add(new int[]{ r, c });\n                else if (grid[r][c] == 1) fresh++;\n            }\n        }\n        if (fresh == 0) return 0;\n        int minutes = 0, dirs[][] = {{1,0},{-1,0},{0,1},{0,-1}};\n        while (!q.isEmpty() && fresh > 0) {\n            int size = q.size();\n            for (int i = 0; i < size; i++) {\n                int[] curr = q.poll();\n                for (int[] d : dirs) {\n                    int nr = curr[0] + d[0], nc = curr[1] + d[1];\n                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == 1) {\n                        grid[nr][nc] = 2;\n                        fresh--;\n                        q.add(new int[]{ nr, nc });\n                    }\n                }\n            }\n            minutes++;\n        }\n        return fresh == 0 ? minutes : -1;\n    }\n}",
        "Python": "from collections import deque\nclass Solution:\n    def orangesRotting(self, grid: list[list[int]]) -> int:\n        m, n = len(grid), len(grid[0])\n        q = deque()\n        fresh = 0\n        for r in range(m):\n            for c in range(n):\n                if grid[r][c] == 2: q.append((r, c))\n                elif grid[r][c] == 1: fresh += 1\n        if fresh == 0: return 0\n        mins = 0\n        dirs = [(1,0),(-1,0),(0,1),(0,-1)]\n        while q and fresh > 0:\n            for _ in range(len(q)):\n                r, c = q.popleft()\n                for dr, dc in dirs:\n                    nr, nc = r + dr, c + dc\n                    if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:\n                        grid[nr][nc] = 2\n                        fresh -= 1\n                        q.append((nr, nc))\n            mins += 1\n        return mins if fresh == 0 else -1",
        "TypeScript": "function orangesRotting(grid: number[][]): number {\n    const m = grid.length, n = grid[0].length;\n    let fresh = 0, q: [number, number][] = [];\n    for (let r = 0; r < m; r++) {\n        for (let c = 0; c < n; c++) {\n            if (grid[r][c] === 2) q.push([r, c]);\n            else if (grid[r][c] === 1) fresh++;\n        }\n    }\n    if (fresh === 0) return 0;\n    let mins = 0;\n    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];\n    while (q.length > 0 && fresh > 0) {\n        const nextQ: [number, number][] = [];\n        for (const [r, c] of q) {\n            for (const [dr, dc] of dirs) {\n                const nr = r + dr, nc = c + dc;\n                if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === 1) {\n                    grid[nr][nc] = 2;\n                    fresh--;\n                    nextQ.push([nr, nc]);\n                }\n            }\n        }\n        q = nextQ;\n        mins++;\n    }\n    return fresh === 0 ? mins : -1;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Connected components, grid traversal, flood fill, shortest path in unweighted graphs (BFS).",
      "coreTemplate": "const visited = new Set();\nconst queue = [[startRow, startCol]];\nwhile (queue.length) {\n  const [r, c] = queue.shift();\n  for (const [dr, dc] of directions) {\n    const nr = r + dr, nc = c + dc;\n    if (inBounds(nr, nc) && !visited.has(`${nr},${nc}`)) {\n      visited.add(`${nr},${nc}`);\n      queue.push([nr, nc]);\n    }\n  }\n}",
      "pitfalls": "Mark nodes as visited at the moment they are pushed to the queue, not when popped, to avoid exponential duplicate pushes."
    }
  },
  {
    "id": "dsa-jump-game",
    "title": "Jump Game",
    "titleSlug": "jump-game",
    "url": "https://leetcode.com/problems/jump-game/",
    "difficulty": "Medium",
    "pattern": "Greedy & Intervals",
    "tags": [
      "Greedy",
      "Dynamic Programming",
      "Arrays"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Apple"
    ],
    "description": "You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position.\n\nReturn true if you can reach the last index, or false otherwise.",
    "examples": [
      {
        "input": "nums = [2,3,1,1,4]",
        "output": "true",
        "explanation": "Jump 1 step from index 0 to 1, then 3 steps to the last index."
      },
      {
        "input": "nums = [3,2,1,0,4]",
        "output": "false",
        "explanation": "You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible to reach the last index."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^4",
      "0 <= nums[i] <= 10^5"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public boolean canJump(int[] nums) {\n        return false;\n    }\n}",
      "Python": "class Solution:\n    def canJump(self, nums: List[int]) -> bool:\n        pass",
      "TypeScript": "function canJump(nums: number[]): boolean {\n    return false;\n}",
      "C++": "class Solution {\npublic:\n    bool canJump(vector<int>& nums) {\n        return false;\n    }\n};",
      "Go": "func canJump(nums []int) bool {\n    return false\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Max Reachable Index",
        "content": "Track the maximum index you can reach so far (maxReach)."
      },
      {
        "level": 2,
        "title": "Inaccessible Check",
        "content": "If at any index i, i > maxReach, you can never reach this position. Return false."
      },
      {
        "level": 3,
        "title": "Greedy Extension",
        "content": "Update maxReach = max(maxReach, i + nums[i]). If maxReach >= nums.length - 1, return true."
      }
    ],
    "solution": {
      "intuition": "Greedily keep track of the furthest index reachable. If the current index exceeds this boundary, we are trapped.",
      "approach": "Initialize maxReach = 0. Iterate i from 0 to n-1: if i > maxReach return false; maxReach = max(maxReach, i + nums[i]); if maxReach >= n-1 return true. Return true.",
      "timeComplexity": "O(N) - single pass.",
      "spaceComplexity": "O(1) - single variable.",
      "keyTakeaway": "When deciding reachability, maintaining the maximum frontier avoids full DP tabulation.",
      "code": {
        "Java": "class Solution {\n    public boolean canJump(int[] nums) {\n        int maxReach = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (i > maxReach) return false;\n            maxReach = Math.max(maxReach, i + nums[i]);\n            if (maxReach >= nums.length - 1) return true;\n        }\n        return true;\n    }\n}",
        "Python": "class Solution:\n    def canJump(self, nums: list[int]) -> bool:\n        max_reach = 0\n        for i, jump in enumerate(nums):\n            if i > max_reach: return False\n            max_reach = max(max_reach, i + jump)\n            if max_reach >= len(nums) - 1: return True\n        return True",
        "TypeScript": "function canJump(nums: number[]): boolean {\n    let maxReach = 0;\n    for (let i = 0; i < nums.length; i++) {\n        if (i > maxReach) return false;\n        maxReach = Math.max(maxReach, i + nums[i]);\n        if (maxReach >= nums.length - 1) return true;\n    }\n    return true;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Local optimal choice leads to global optimal (activity selection, merging overlapping intervals, jump game).",
      "coreTemplate": "intervals.sort((a, b) => a[0] - b[0]);\nconst merged = [intervals[0]];\nfor (let i = 1; i < intervals.length; i++) {\n  const last = merged[merged.length - 1];\n  if (intervals[i][0] <= last[1]) last[1] = Math.max(last[1], intervals[i][1]);\n  else merged.push(intervals[i]);\n}",
      "pitfalls": "Always sort intervals first! Check if intervals touch at boundaries (<= vs <)."
    }
  },
  {
    "id": "dsa-number-of-1-bits",
    "title": "Number of 1 Bits",
    "titleSlug": "number-of-1-bits",
    "url": "https://leetcode.com/problems/number-of-1-bits/",
    "difficulty": "Easy",
    "pattern": "Bit Manipulation",
    "tags": [
      "Bit Manipulation",
      "Math"
    ],
    "companies": [
      "Apple",
      "Microsoft",
      "Amazon",
      "Meta"
    ],
    "description": "Write a function that takes the binary representation of a positive integer and returns the number of set bits it has (also known as the Hamming weight).",
    "examples": [
      {
        "input": "n = 11",
        "output": "3",
        "explanation": "The input binary string 1011 has a total of three set bits."
      },
      {
        "input": "n = 128",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= n <= 2^31 - 1"
    ],
    "starterCode": {
      "Java": "public class Solution {\n    public int hammingWeight(int n) {\n        return 0;\n    }\n}",
      "Python": "class Solution:\n    def hammingWeight(self, n: int) -> int:\n        pass",
      "TypeScript": "function hammingWeight(n: number): number {\n    return 0;\n}",
      "C++": "class Solution {\npublic:\n    int hammingWeight(uint32_t n) {\n        return 0;\n    }\n};",
      "Go": "func hammingWeight(num uint32) int {\n    return 0\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Brian Kernighan's Algorithm",
        "content": "n & (n - 1) always drops the lowest set bit of n."
      },
      {
        "level": 2,
        "title": "Loop Condition",
        "content": "While n != 0, increment count and update n = n & (n - 1)."
      },
      {
        "level": 3,
        "title": "Complexity",
        "content": "This runs in time proportional only to the number of set bits (at most 32)."
      }
    ],
    "solution": {
      "intuition": "Subtracting 1 flips all bits after the rightmost set bit (and the rightmost set bit itself). Bitwise ANDing n with n - 1 clears that lowest set bit.",
      "approach": "Initialize count = 0. While n != 0: n &= (n - 1); count++. Return count.",
      "timeComplexity": "O(k) where k is the number of 1 bits (at most 32).",
      "spaceComplexity": "O(1).",
      "keyTakeaway": "The bit trick `n & (n - 1)` eliminates the lowest 1-bit in O(1) time without looping over all 32 bits.",
      "code": {
        "Java": "public class Solution {\n    public int hammingWeight(int n) {\n        int count = 0;\n        while (n != 0) {\n            n &= (n - 1);\n            count++;\n        }\n        return count;\n    }\n}",
        "Python": "class Solution:\n    def hammingWeight(self, n: int) -> int:\n        count = 0\n        while n:\n            n &= (n - 1)\n            count += 1\n        return count",
        "TypeScript": "function hammingWeight(n: number): number {\n    let count = 0;\n    while (n !== 0) {\n        n &= (n - 1);\n        count++;\n    }\n    return count;\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "XOR properties (x ^ x = 0, x ^ 0 = x), clearing lowest set bit (n & (n - 1)), bitmasking subsets.",
      "coreTemplate": "let res = 0;\nfor (const n of nums) res ^= n;\nreturn res;",
      "pitfalls": "Operator precedence in JavaScript/Python: == has higher precedence than & or ^. Always wrap bit operations in parentheses: ((n & 1) === 1)."
    }
  },
  {
    "id": "dsa-redundant-connection",
    "title": "Redundant Connection",
    "titleSlug": "redundant-connection",
    "url": "https://leetcode.com/problems/redundant-connection/",
    "difficulty": "Medium",
    "pattern": "Union-Find",
    "tags": [
      "Union-Find",
      "Graphs",
      "DFS",
      "BFS"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Meta"
    ],
    "description": "In this problem, a tree is an undirected graph that is connected and has no cycles.\n\nYou are given a graph that started as a tree with n nodes labeled from 1 to n, with one additional edge added. The added edge has two different vertices chosen from 1 to n, and was not an edge that already existed.\n\nReturn an edge that can be removed so that the resulting graph is a tree of n nodes. If there are multiple answers, return the answer that occurs last in the input.",
    "examples": [
      {
        "input": "edges = [[1,2],[1,3],[2,3]]",
        "output": "[2,3]"
      },
      {
        "input": "edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]",
        "output": "[1,4]"
      }
    ],
    "constraints": [
      "n == edges.length",
      "3 <= n <= 1000",
      "edges[i].length == 2",
      "1 <= u_i < v_i <= n"
    ],
    "starterCode": {
      "Java": "class Solution {\n    public int[] findRedundantConnection(int[][] edges) {\n        return new int[0];\n    }\n}",
      "Python": "class Solution:\n    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:\n        pass",
      "TypeScript": "function findRedundantConnection(edges: number[][]): number[] {\n    return [];\n}",
      "C++": "class Solution {\npublic:\n    vector<int> findRedundantConnection(vector<vector<int>>& edges) {\n        return {};\n    }\n};",
      "Go": "func findRedundantConnection(edges [][]int) []int {\n    return nil\n}"
    },
    "hints": [
      {
        "level": 1,
        "title": "Cycle in Tree",
        "content": "A tree with n vertices has exactly n - 1 edges. The extra edge creates a single cycle."
      },
      {
        "level": 2,
        "title": "Disjoint Set Union (DSU)",
        "content": "For each edge (u, v), check if find(u) == find(v). If yes, this edge closes a cycle and is redundant."
      },
      {
        "level": 3,
        "title": "Union by Rank",
        "content": "Otherwise, union the two components and continue."
      }
    ],
    "solution": {
      "intuition": "An edge between two nodes already belonging to the same connected component creates a cycle; that edge is redundant.",
      "approach": "Initialize parent array parent[i] = i. For each edge [u, v]: rootU = find(u), rootV = find(v). If rootU == rootV, return [u, v]. Otherwise parent[rootU] = rootV. Return empty array.",
      "timeComplexity": "O(N * alpha(N)) where alpha is inverse Ackermann function (effectively O(N)).",
      "spaceComplexity": "O(N) for parent array.",
      "keyTakeaway": "Union-Find is the most optimal tool for incremental cycle detection in undirected graphs.",
      "code": {
        "Java": "class Solution {\n    public int[] findRedundantConnection(int[][] edges) {\n        int[] parent = new int[edges.length + 1];\n        for (int i = 0; i < parent.length; i++) parent[i] = i;\n        for (int[] e : edges) {\n            int p1 = find(parent, e[0]), p2 = find(parent, e[1]);\n            if (p1 == p2) return e;\n            parent[p1] = p2;\n        }\n        return new int[0];\n    }\n    private int find(int[] parent, int i) {\n        if (parent[i] != i) parent[i] = find(parent, parent[i]);\n        return parent[i];\n    }\n}",
        "Python": "class Solution:\n    def findRedundantConnection(self, edges: list[list[int]]) -> list[int]:\n        parent = list(range(len(edges) + 1))\n        def find(x):\n            if parent[x] != x: parent[x] = find(parent[x])\n            return parent[x]\n        for u, v in edges:\n            pu, pv = find(u), find(v)\n            if pu == pv: return [u, v]\n            parent[pu] = pv\n        return []",
        "TypeScript": "function findRedundantConnection(edges: number[][]): number[] {\n    const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);\n    function find(x: number): number {\n        if (parent[x] !== x) parent[x] = find(parent[x]);\n        return parent[x];\n    }\n    for (const [u, v] of edges) {\n        const pu = find(u), pv = find(v);\n        if (pu === pv) return [u, v];\n        parent[pu] = pv;\n    }\n    return [];\n}"
      }
    },
    "languages": [
      "Java",
      "Python",
      "TypeScript",
      "C++",
      "Go"
    ],
    "status": "Unattempted",
    "patternBlueprint": {
      "whenToUse": "Disjoint Set Union (DSU) for dynamic connectivity, Kruskal’s MST, detecting cycles in undirected graphs.",
      "coreTemplate": "class UnionFind {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.rank = new Array(n).fill(1);\n  }\n  find(x) {\n    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);\n    return this.parent[x];\n  }\n  union(x, y) {\n    const rx = this.find(x), ry = this.find(y);\n    if (rx === ry) return false;\n    if (this.rank[rx] < this.rank[ry]) this.parent[rx] = ry;\n    else if (this.rank[rx] > this.rank[ry]) this.parent[ry] = rx;\n    else { this.parent[ry] = rx; this.rank[rx]++; }\n    return true;\n  }\n}",
      "pitfalls": "Always use path compression (this.parent[x] = this.find(this.parent[x])) and union by rank for near O(1) operations."
    }
  }
]
