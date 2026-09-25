"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type Variants } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

export const easeOut = [0.22, 1, 0.36, 1] as const;

/** Fade + rise on first appearance in the viewport. */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 16,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 380, damping: 30 } },
};

/** Grid/list whose children stagger in (children should be <StaggerItem>). */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerParent} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerChild} layout>
      {children}
    </motion.div>
  );
}

/** Counts up to `value` when scrolled into view. */
export function CountUp({ value, decimals = 0, duration = 1.1 }: { value: number; decimals?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration, ease: easeOut });
    return () => controls.stop();
  }, [inView, value, duration, reduce, mv]);

  return <motion.span ref={ref}>{text}</motion.span>;
}
