import { useEffect, useRef, useState } from "react";

/** Anima transições numéricas (count-up suave entre valores). */
export function useAnimatedValue(target: number, duration = 450): number {
  const [value, setValue] = useState(target);
  const previous = useRef(target);

  useEffect(() => {
    const from = previous.current;
    if (from === target) return;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(from + (target - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    previous.current = target;
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
