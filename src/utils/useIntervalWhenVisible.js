import { useEffect, useRef } from "react";

/**
 * setInterval, faqat tab visible bo'lsa ishlaydi.
 * - focus qaytganda darrov 1 marta run qiladi (optional).
 */
export function useIntervalWhenVisible(
  callback,
  delay,
  { runOnFocus = true } = {},
) {
  const savedCb = useRef(callback);
  const timerRef = useRef(null);

  useEffect(() => {
    savedCb.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!delay || delay <= 0) return;

    const tick = () => savedCb.current?.();

    const start = () => {
      stop();
      if (document.visibilityState !== "visible") return;
      timerRef.current = window.setInterval(tick, delay);
    };

    const stop = () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };

    const onVis = () => {
      if (document.visibilityState === "visible") {
        if (runOnFocus) tick();
        start();
      } else {
        stop();
      }
    };

    const onFocus = () => {
      if (document.visibilityState === "visible") {
        if (runOnFocus) tick();
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
    };
  }, [delay, runOnFocus]);
}
