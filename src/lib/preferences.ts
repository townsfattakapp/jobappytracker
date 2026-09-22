import { useEffect, useState } from 'react'

export const CODE_LANGUAGES = ['Java', 'JavaScript', 'TypeScript', 'Python', 'C++', 'Go'] as const
export type CodeLanguage = (typeof CODE_LANGUAGES)[number]

const KEY = 'jobappy-code-language'
const EVENT = 'jobappy:code-language'
/** Fired on window whenever the preferred code language changes; detail is the new language. */
export const CODE_LANGUAGE_EVENT = EVENT

/** Monaco / code-runner identifiers for each display language. */
export const LANGUAGE_IDS: Record<CodeLanguage, string> = {
  Java: 'java',
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Python: 'python',
  'C++': 'cpp',
  Go: 'go',
}

export function getCodeLanguage(): CodeLanguage {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved && (CODE_LANGUAGES as readonly string[]).includes(saved)) return saved as CodeLanguage
  } catch {
    // storage unavailable
  }
  return 'Java'
}

export function setCodeLanguage(language: CodeLanguage): void {
  try {
    localStorage.setItem(KEY, language)
  } catch {
    // storage unavailable
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: language }))
}

/** The learner's preferred programming language for examples, snippets and the DSA editor (synced with the account). */
export function useCodeLanguage(): [CodeLanguage, (language: CodeLanguage) => void] {
  const [language, setLanguage] = useState<CodeLanguage>(() => getCodeLanguage())
  useEffect(() => {
    const onChange = (e: Event) => setLanguage((e as CustomEvent<CodeLanguage>).detail)
    window.addEventListener(EVENT, onChange)
    return () => window.removeEventListener(EVENT, onChange)
  }, [])
  return [language, setCodeLanguage]
}
