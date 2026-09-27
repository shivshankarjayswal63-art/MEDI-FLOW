import { useEffect, useState } from "react";

/**
 * @param {string} text - full text to reveal
 * @param {boolean} active - animate when true
 * @param {number} charsPerSecond
 */
export function useTypewriter(text, active, charsPerSecond = 42) {
  const [display, setDisplay] = useState(active ? "" : text || "");

  useEffect(() => {
    if (!active || !text) {
      setDisplay(text || "");
      return undefined;
    }

    setDisplay("");
    let index = 0;
    const delay = 1000 / charsPerSecond;
    const tick = () => {
      index += 1;
      setDisplay(text.slice(0, index));
      if (index < text.length) {
        timer = window.setTimeout(tick, delay);
      }
    };
    let timer = window.setTimeout(tick, delay);
    return () => window.clearTimeout(timer);
  }, [text, active, charsPerSecond]);

  const done = !active || display.length >= (text || "").length;
  return { display, done, isTyping: active && !done };
}
