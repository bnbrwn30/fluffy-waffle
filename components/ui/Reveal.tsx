"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DUR, EASE, STAGGER } from "@/lib/motion";

/**
 * True once the element is on screen — or immediately, if it already was when
 * the component mounted.
 *
 * The plain `whileInView` prop is not enough on this page. A deep link like
 * `/#contact`, a restored scroll position, or a bfcache restore all put an
 * element on screen *before* its observer exists, and a throttled background
 * tab can defer the first callback indefinitely. Any of those leaves a reveal
 * stranded at its `hidden` values — which reads as a block of blank page where
 * a headline should be, not as a subtle animation.
 *
 * So: measure once on mount, and only fall back to the observer for content
 * that genuinely is still below the fold.
 */
function useShown(ref: React.RefObject<HTMLElement | null>) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScreen = () => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.92 && r.bottom > 0;
    };

    if (onScreen()) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);

    // Last resort. If the observer has still said nothing by the time a reader
    // could plausibly have scrolled here, show the content anyway — never trade
    // legibility for an entrance.
    const bail = window.setTimeout(() => {
      if (onScreen()) setShown(true);
    }, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(bail);
    };
  }, [ref]);

  return shown;
}

type Props = {
  children: ReactNode;
  className?: string;
  /** Seconds of delay on top of any parent stagger. */
  delay?: number;
  as?: "div" | "section" | "li" | "p" | "span";
};

/**
 * The standard entrance for anything that is not scroll-scrubbed: rise and
 * fade, on the site curve.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useShown(ref);
  const reduced = useReducedMotion();
  const Tag = motion[as];

  if (reduced) {
    const Plain = as;
    return (
      <Plain className={className} ref={ref as never}>
        {children}
      </Plain>
    );
  }

  return (
    <Tag
      ref={ref as never}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={shown ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: DUR.base, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/**
 * Per-line clip reveal for display headlines. Splitting on an explicit array
 * rather than on whitespace keeps the line breaks art-directed instead of
 * wherever the viewport happens to wrap.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  immediate = false,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  /** Play on mount rather than on scroll. Used above the fold. */
  immediate?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useShown(ref);
  const reduced = useReducedMotion();
  const shown = immediate || inView || reduced;

  return (
    <span className={className} ref={ref}>
      {lines.map((line, i) => (
        // The mask carries the trigger; the moving line never does. An
        // IntersectionObserver clips against ancestor overflow, so a line
        // parked at y:110% inside its own `overflow-hidden` mask can never
        // report as intersecting — observing it directly deadlocks the
        // headline hidden forever. The extra bottom padding keeps descenders
        // out of the mask edge.
        <span key={line} className="block overflow-hidden pb-[0.12em]">
          <motion.span
            className={`block will-change-transform ${lineClassName ?? ""}`}
            initial={reduced ? false : { y: "110%" }}
            animate={shown ? { y: "0%" } : undefined}
            transition={{
              duration: DUR.slow,
              ease: EASE,
              delay: i * STAGGER.base,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
