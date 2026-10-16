import { useCallback, useEffect, useState } from 'react'

// Reads and writes are wrapped in try/catch: storage can be blocked (private mode, etc.).
function read<T>(key: string, initial: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? initial : (JSON.parse(raw) as T)
  } catch {
    return initial
  }
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => read(key, initial))

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore: the app still works, it just will not persist.
    }
  }, [key, value])

  // Keep several components (and tabs) in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setValue(read(key, initial))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const update = useCallback((next: T | ((prev: T) => T)) => setValue(next), [])
  return [value, update] as const
}
