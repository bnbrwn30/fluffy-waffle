"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ORIGINS, getOrigin } from "@/lib/origins";
import { DUR, EASE } from "@/lib/motion";
import Reveal from "@/components/ui/Reveal";

/** Metres at the bottom and top of the altitude plot. */
const LO = 1400;
const HI = 2400;
const pct = (m: number) => ((m - LO) / (HI - LO)) * 100;

/**
 * Stylised outline of Ethiopia. Deliberately simplified — this is a locator
 * graphic, not a survey map, and a hand-tuned path stays legible at 320px wide
 * where real border geometry turns to mush.
 */
const ETHIOPIA =
  "M150 210 L250 150 L330 130 L400 165 L445 200 L500 235 L575 300 L520 340 " +
  "L470 380 L420 430 L380 480 L330 515 L275 505 L235 470 L190 420 L160 350 " +
  "L140 280 Z";

export default function Origins() {
  const [activeId, setActiveId] = useState(ORIGINS[0].id);
  const active = getOrigin(activeId);

  return (
    <section
      id="origins"
      aria-labelledby="origins-heading"
      className="relative border-t border-line bg-bg py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        {/* Heading and the region control share one row on desktop — the tabs
            are this section's primary verb, so they sit at eye level rather
            than buried under the map. */}
        <div className="flex flex-col gap-6 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Reveal>
              <p className="kicker">Where it grows</p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2
                id="origins-heading"
                className="font-display mt-3 max-w-xl text-2xl leading-[1.1] text-fg sm:text-4xl"
              >
                The four regions we buy from most.
              </h2>
            </Reveal>
          </div>

          {/* The real control: a radio group, so it is keyboard-operable. */}
          <fieldset className="shrink-0">
            <legend className="sr-only">Choose a growing region</legend>
            <div className="flex flex-wrap gap-1.5">
              {ORIGINS.map((o) => {
                const on = o.id === activeId;
                return (
                  <label
                    key={o.id}
                    className={`cursor-pointer border px-3 py-1.5 text-xs tracking-wide transition-colors duration-[var(--dur-fast)] [transition-timing-function:var(--ease)] ${
                      on
                        ? "border-accent-solid bg-accent-solid text-fg"
                        : "border-line text-muted hover:border-faint hover:text-fg"
                    }`}
                  >
                    <input
                      type="radio"
                      name="origin"
                      value={o.id}
                      checked={on}
                      onChange={() => setActiveId(o.id)}
                      className="sr-only"
                    />
                    {o.name}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-12">
          {/* --- Map + altitude ------------------------------------------- */}
          <div className="relative">
            {/* viewBox is cropped to the outline itself — the old 0 0 600 600
                frame padded the map with a third of a screen of empty space. */}
            <svg
              viewBox="125 115 470 420"
              className="mx-auto w-full max-w-sm lg:max-w-none"
              role="presentation"
              aria-hidden
            >
              <path
                d={ETHIOPIA}
                fill="var(--surface)"
                stroke="var(--line)"
                strokeWidth="1.5"
              />
              {ORIGINS.map((o) => {
                const on = o.id === activeId;
                return (
                  <g key={o.id}>
                    {on && (
                      <motion.circle
                        cx={o.map.x}
                        cy={o.map.y}
                        r={24}
                        fill="var(--accent-solid)"
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 0.16, scale: 1 }}
                        transition={{ duration: DUR.base, ease: EASE }}
                        style={{ transformOrigin: `${o.map.x}px ${o.map.y}px` }}
                      />
                    )}
                    <circle
                      cx={o.map.x}
                      cy={o.map.y}
                      r={on ? 6.5 : 4}
                      fill={on ? "var(--accent-solid)" : "var(--faint)"}
                      style={{
                        transition: `r var(--dur-fast) var(--ease), fill var(--dur-fast) var(--ease)`,
                      }}
                    />
                    <text
                      x={o.map.x + 14}
                      y={o.map.y + 4}
                      fill={on ? "var(--fg)" : "var(--faint)"}
                      fontSize="16"
                      style={{ transition: "fill var(--dur-fast) var(--ease)" }}
                    >
                      {o.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            <AltitudeBands activeId={activeId} onPick={setActiveId} />
          </div>

          {/* --- Data card ------------------------------------------------ */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: DUR.base, ease: EASE }}
              className="border border-line bg-surface p-5 sm:p-7"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-2xl text-fg sm:text-3xl">
                  {active.name}
                </h3>
                <p className="kicker shrink-0">{active.zone}</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {active.pitch}
              </p>

              <dl className="nums mt-5 grid grid-cols-2 gap-x-6 gap-y-3.5 border-t border-line pt-5 sm:grid-cols-3">
                <Field label="Altitude">
                  {active.altitude[0].toLocaleString()}–
                  {active.altitude[1].toLocaleString()} m
                </Field>
                <Field label="Cup score">{active.cupScore.toFixed(1)}</Field>
                <Field label="Harvest">{active.harvest}</Field>
                <Field label="Process">{active.processes.join(" · ")}</Field>
                <Field label="Varietal">{active.varietal}</Field>
                <Field label="Grades">{active.grades.join(", ")}</Field>
              </dl>

              {/* Tasting notes read as one line of chips next to their label,
                  instead of a stacked block with its own heading. */}
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                <p className="mr-1 text-[10px] uppercase tracking-[0.14em] text-faint">
                  In the cup
                </p>
                {active.notes.map((n) => (
                  <span
                    key={n}
                    className="border border-line px-2.5 py-1 text-xs text-muted"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/**
 * Altitude bands as a flat range plot, one row per region on a shared scale.
 *
 * This replaced a WebGL bar scene: four extruded boxes cost a second GL
 * context, could not carry their own numbers, and read as decoration. Height
 * is the commercial argument here, so the comparison should be exact — a
 * shared axis and printed metres does that in a fraction of the space.
 * The rows double as a second control for picking a region.
 */
function AltitudeBands({
  activeId,
  onPick,
}: {
  activeId: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="mt-5 border-t border-line pt-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] uppercase tracking-[0.14em] text-faint">
          Altitude band
        </p>
        <p className="nums text-[10px] text-faint">
          {LO.toLocaleString()}–{HI.toLocaleString()} m
        </p>
      </div>

      <ul className="mt-3 space-y-2.5">
        {ORIGINS.map((o) => {
          const on = o.id === activeId;
          const [low, high] = o.altitude;
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => onPick(o.id)}
                className="group flex w-full items-center gap-3 text-left"
              >
                <span
                  className={`w-20 shrink-0 text-[11px] transition-colors duration-[var(--dur-fast)] [transition-timing-function:var(--ease)] ${
                    on ? "text-fg" : "text-faint group-hover:text-muted"
                  }`}
                >
                  {o.name}
                </span>

                <span className="relative h-2 flex-1">
                  <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
                  <span
                    className={`absolute top-1/2 h-[3px] -translate-y-1/2 transition-[background-color] duration-[var(--dur-fast)] [transition-timing-function:var(--ease)] ${
                      on ? "bg-accent-solid" : "bg-faint group-hover:bg-muted"
                    }`}
                    style={{
                      left: `${pct(low)}%`,
                      width: `${pct(high) - pct(low)}%`,
                    }}
                  />
                </span>

                <span
                  className={`nums w-28 shrink-0 text-right text-[11px] transition-colors duration-[var(--dur-fast)] [transition-timing-function:var(--ease)] ${
                    on ? "text-fg" : "text-faint"
                  }`}
                >
                  {low.toLocaleString()}–{high.toLocaleString()}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.14em] text-faint">
        {label}
      </dt>
      <dd className="mt-1 text-[13px] leading-snug text-fg">{children}</dd>
    </div>
  );
}
