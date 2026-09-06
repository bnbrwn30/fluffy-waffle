"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import PhotoJourney from "@/components/ui/PhotoJourney";
import { BEATS, beatIndexAt } from "@/lib/journey";
import { DUR, EASE } from "@/lib/motion";

/**
 * The signature section: nine photographs from wild forest to a ship leaving
 * Djibouti, cross-dissolving under a slow push as you scroll, with the beat
 * copy and its hard number changing over them.
 *
 * The copy is real DOM text rather than part of the imagery, so it is
 * selectable, translatable and readable by a screen reader — and the full beat
 * list is repeated in a visually hidden ordered list below for anyone who never
 * sees the pinned scroll at all.
 */
export default function Journey({ available }: { available: string[] }) {
  const [beatId, setBeatId] = useState(BEATS[0].id);

  const handleProgress = useCallback((p: number) => {
    const next = BEATS[beatIndexAt(p)].id;
    setBeatId((cur) => (cur === next ? cur : next));
  }, []);

  const beat = BEATS.find((b) => b.id === beatId) ?? BEATS[0];
  const index = BEATS.findIndex((b) => b.id === beat.id);

  return (
    // `on-dark` redefines the colour tokens for this subtree only: the copy
    // sits over full-bleed photographs behind a dark scrim, so it needs light
    // type regardless of the paper ground everywhere else. The cut from paper
    // into full-bleed image is a moment in its own right.
    <section
      id="journey"
      aria-labelledby="journey-heading"
      className="on-dark relative"
    >
      <h2 id="journey-heading" className="sr-only">
        From the forest to your roastery
      </h2>

      <PhotoJourney onProgress={handleProgress} available={available}>
        {/* Passed as children so the pin covers copy and imagery together.
            Kept out of the transformed layers, so changing beat never touches
            the elements being animated on scroll. */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-6 pb-16 sm:px-10 lg:pb-24">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <AnimatePresence mode="wait">
                <motion.div
                  key={beat.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: DUR.base, ease: EASE }}
                  className="max-w-xl"
                >
                  <p className="kicker">{beat.kicker}</p>
                  <p className="font-display mt-3 text-3xl leading-[1.1] text-fg sm:text-4xl lg:text-5xl">
                    {beat.headline}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                    {beat.body}
                  </p>
                </motion.div>
              </AnimatePresence>

              {beat.stat && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${beat.id}-stat`}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: DUR.base, ease: EASE, delay: 0.06 }}
                    className="border-l border-line pl-5 lg:pl-6"
                  >
                    <p className="font-display nums text-4xl text-accent lg:text-5xl">
                      {beat.stat.value}
                    </p>
                    <p className="mt-1 max-w-[16rem] text-xs leading-snug text-faint">
                      {beat.stat.label}
                    </p>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Progress rail — nine ticks, one per beat. */}
            <div className="mt-10 flex items-center gap-2" aria-hidden>
              {BEATS.map((b, i) => (
                <span
                  key={b.id}
                  className="h-px flex-1 origin-left transition-colors"
                  style={{
                    background: i <= index ? "var(--accent-solid)" : "var(--line)",
                    transitionDuration: "var(--dur-fast)",
                    transitionTimingFunction: "var(--ease)",
                  }}
                />
              ))}
              <span className="nums ml-3 text-[11px] text-faint">
                {String(index + 1).padStart(2, "0")} / {String(BEATS.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </PhotoJourney>

      {/* Text equivalent: the whole story, for reduced motion and assistive tech. */}
      <ol className="sr-only">
        {BEATS.map((b) => (
          <li key={b.id}>
            <h3>{b.headline}</h3>
            <p>{b.kicker}</p>
            <p>{b.body}</p>
            {b.stat && (
              <p>
                {b.stat.value} — {b.stat.label}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
