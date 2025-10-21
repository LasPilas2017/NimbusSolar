import { useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const finalValue = value instanceof Function ? value(stored) : value;
      setStored(finalValue);
      window.localStorage.setItem(key, JSON.stringify(finalValue));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[useLocalStorage] setValue error', e);
    }
  };

  return [stored, setValue];
}
