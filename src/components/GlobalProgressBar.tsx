"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

/** Thin top bar shown while a user-visible request is in flight (ignores background polling). */
export function GlobalProgressBar() {
  const fetching = useIsFetching({ predicate: (q) => q.state.data === undefined });
  const mutating = useIsMutating();
  const busy = fetching + mutating > 0;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay showing so instant responses don't flash the bar
    const t = setTimeout(() => setVisible(busy), busy ? 150 : 0);
    return () => clearTimeout(t);
  }, [busy]);

  return (
    <AnimatePresence>
      {visible && busy && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[60] h-1 origin-left bg-coral"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 0.85, transition: { duration: 6, ease: [0.1, 0.8, 0.2, 1] } }}
          exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.25 } }}
          role="progressbar"
          aria-label="Loading"
        />
      )}
    </AnimatePresence>
  );
}
