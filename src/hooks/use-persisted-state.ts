import { useCallback, useEffect, useState } from "react";

const EVENT = "nutrikal:persist";

/**
 * useState com persistência em localStorage.
 * Hidrata só após a montagem (compatível com SSR) e sincroniza instâncias
 * da mesma chave na mesma página.
 */
export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) setValue(JSON.parse(raw) as T);
      } catch {
        /* storage indisponível ou JSON inválido: mantém o valor atual */
      }
    };
    read();
    setReady(true);
    const onSync = (e: Event) => {
      if ((e as CustomEvent<string>).detail === key) read();
    };
    window.addEventListener(EVENT, onSync);
    return () => window.removeEventListener(EVENT, onSync);
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      const raw = JSON.stringify(value);
      if (localStorage.getItem(key) !== raw) {
        localStorage.setItem(key, raw);
        window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
      }
    } catch {
      /* ignora falhas de gravação */
    }
  }, [key, value, ready]);

  const set = useCallback((next: T | ((prev: T) => T)) => setValue(next), []);
  return [value, set] as const;
}
