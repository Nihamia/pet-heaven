import { useCallback, useEffect, useRef, useState } from 'react';

function readStoredValue(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const savedValue = window.localStorage.getItem(key);
    return savedValue === null ? fallback : JSON.parse(savedValue);
  } catch {
    return fallback;
  }
}

// Keep a React value in sync with localStorage while falling back safely when storage is unavailable.
export default function useLocalStorage(key, initialValue) {
  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;
  const [stored, setStored] = useState(() => ({ key, value: readStoredValue(key, initialValueRef.current) }));
  const value = stored.key === key ? stored.value : readStoredValue(key, initialValueRef.current);

  useEffect(() => {
    if (stored.key !== key) setStored({ key, value: readStoredValue(key, initialValueRef.current) });
  }, [key, stored.key]);

  useEffect(() => {
    if (stored.key !== key || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(stored.value));
    } catch {
      // Keep the in-memory state usable when storage is full or blocked.
    }
  }, [key, stored]);

  const setValue = useCallback((nextValue) => {
    setStored((current) => {
      const currentValue = current.key === key ? current.value : readStoredValue(key, initialValueRef.current);
      const resolvedValue = typeof nextValue === 'function' ? nextValue(currentValue) : nextValue;
      return { key, value: resolvedValue };
    });
  }, [key]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // The in-memory state can still be reset when storage is unavailable.
    }
    setStored({ key, value: initialValueRef.current });
  }, [key]);

  return [value, setValue, removeValue];
}
