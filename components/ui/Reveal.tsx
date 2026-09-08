"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { STAGGER } from "@/lib/motion";

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

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setShown(true);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(bail);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);

    /**
     * A geometry backstop, checked on every scroll.
     *
     * The observer is the primary trigger and usually the only one that ever
     * fires. But it is not a guarantee: IntersectionObserver delivers on the
     * render steps, and a page that is offscreen, backgrounded, or simply
     * starved on a slow device can go a long time without one — and a Reveal
     * whose callback never arrives stays at opacity 0 forever. That is how the
     * whole lot panel in Quality — sack, cupping radar and spec table — could
     * sit dead centre of the viewport and render as blank paper.
     *
     * Measuring a rect on a passive scroll listener costs nothing next to
     * losing a section, and both paths run through `reveal()`, so whichever
     * arrives first tears down the other.
     */
    const onScroll = () => {
      if (onScreen()) reveal();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // Final fallback. If neither path has spoken by the time a reader could
    // plausibly have scrolled here, show the content anyway — never trade
    // legibility for an entrance.
    const bail = window.setTimeout(onScroll, 2500);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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
 *
 * The trigger is JavaScript; the animation is not. It used to be a motion
 * component, which meant the entrance was interpolated frame by frame on
 * requestAnimationFrame — and anything that starves rAF (a background tab, a
 * throttled or offscreen renderer, a phone under load) left the element parked
 * on its `initial` values with no way out. Whole sections rendered as blank
 * paper: the Quality lot panel, sack and cupping radar included.
 *
 * A CSS keyframe runs on the compositor instead. Once the class is on, the
 * entrance plays whatever else the main thread is doing, and the end state is
 * declarative rather than something a running animation has to reach.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useShown(ref);
  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      className={`reveal${shown ? " reveal-in" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
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
  const shown = immediate || inView;

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
          <span
            className={`reveal-line${shown ? " reveal-in" : ""} block will-change-transform ${
              lineClassName ?? ""
            }`}
            style={i ? { animationDelay: `${i * STAGGER.base}s` } : undefined}
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * The same clip reveal, cascading word by word instead of line by line.
 *
 * Worth the extra spans only on the largest display headings, where three
 * lines arriving as three solid blocks is the one place the page still reads
 * as *placed* rather than *set*. At body size the effect is invisible and the
 * DOM cost is not.
 *
 * Lines stay an explicit array for the same reason `RevealLines` takes one —
 * the breaks are art-directed. But note the trade: because every word is now
 * its own inline-block, `text-balance` and `text-wrap` have nothing to work
 * with, so only pass lines that are already broken the way you want them.
 */
export function RevealWords({
  lines,
  className,
  immediate = false,
}: {
  lines: string[];
  className?: string;
  /** Play on mount rather than on scroll. */
  immediate?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useShown(ref);
  const shown = immediate || inView;

  // Continues across the line break rather than restarting per line, so the
  // headline reads as one sweep instead of three.
  let n = 0;

  return (
    <span className={`${shown ? "reveal-in " : ""}${className ?? ""}`} ref={ref}>
      {lines.map((line) => (
        <span key={line} className="block">
          {line.split(" ").map((word) => {
            const delay = n++ * STAGGER.tight;
            return (
              // The mask is inline-block so it can sit in the text flow, and
              // bottom-padded with a matching negative margin so descenders
              // clear the clip edge without adding leading between the lines.
              <span
                key={`${word}-${delay}`}
                className="inline-block overflow-hidden pb-[0.12em] mb-[-0.12em] align-bottom"
              >
                <span
                  className="reveal-word block will-change-transform"
                  style={delay ? { animationDelay: `${delay}s` } : undefined}
                >
                  {word}
                </span>
                {/* A real space, outside the mask — a margin here would be
                    wrong at every font size the headline clamps through. */}
              </span>
            );
          }).reduce<ReactNode[]>(
            (out, el, i) => (i ? [...out, " ", el] : [el]),
            [],
          )}
        </span>
      ))}
    </span>
  );
}
