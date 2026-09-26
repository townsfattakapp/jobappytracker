import { useState } from "react";
/** Persist on every edit so navigation cannot discard an unfinished activity. */
export function useLearningDraft<T>(
  key: string,
  initial: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(`jobappy-draft:${key}`);
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });
  return [
    value,
    (next) => {
      setValue((current) => {
        const resolved = typeof next === 'function' ? (next as (prev: T) => T)(current) : next;
        try {
          localStorage.setItem(`jobappy-draft:${key}`, JSON.stringify(resolved));
        } catch {
          // ignore quota
        }
        return resolved;
      });
    },
  ];
}
