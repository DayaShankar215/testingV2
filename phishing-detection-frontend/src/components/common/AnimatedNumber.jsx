// components/common/AnimatedNumber.jsx
import React, { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const AnimatedNumber = ({ value = 0, duration = 900, decimals = 0 }) => {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(target);
  const frameRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(target);
      return undefined;
    }

    const start = performance.now();
    const from = 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (target - from) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  const formatted =
    decimals > 0
      ? Number(display).toFixed(decimals)
      : Math.round(display).toString();

  return <>{formatted}</>;
};

export default AnimatedNumber;
