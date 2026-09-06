"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

/**
 * Quality & traceability.
 *
 * The buyer question here is "how do these lots compare?", so the section is
 * one selector rather than a chart marooned beside unrelated cards: picking a
 * lot drives both the cupping radar and the spec sheet next to it.
 *
 * The radar is a hand-rolled SVG — one polygon and six axes. A charting
 * dependency would cost more bundle than this whole section.
 *
 * Scores and specs are illustrative. VERIFY every field against the cupping
 * sheets and pre-shipment analysis for the crop year before launch.
 */

const AXIS_LABELS = ["Aroma", "Flavour", "Aftertaste", "Acidity", "Body", "Balance"] as const;

type Lot = {
  id: string;
  region: string;
  station: string;
  process: string;
  varietal: string;
  altitude: string;
  harvest: string;
  grade: string;
  screen: string;
  moisture: string;
  defects: string;
  score: number;
  bags: string;
  notes: string;
  /** Cupping attributes, in AXIS_LABELS order. */
  scores: number[];
  /** Warehouse bag shot. */
  image: string;
};

const LOTS: Lot[] = [
  {
    id: "ETH-GJ-2401",
    region: "Guji",
    station: "Shakiso washing station", // VERIFY
    process: "Natural",
    varietal: "Heirloom 74110",
    altitude: "1,950–2,150 m",
    harvest: "Nov 24 – Jan 25",
    grade: "G1",
    screen: "15+",
    moisture: "10.4%",
    defects: "0 primary",
    score: 88.0,
    bags: "160 × 60 kg",
    notes: "Blueberry · jasmine · dark chocolate",
    scores: [8.75, 8.5, 8.25, 8.75, 8.0, 8.5],
    image: "/img/bags/guji.webp",
  },
  {
    id: "ETH-YG-2408",
    region: "Yirgacheffe",
    station: "Kochere washing station", // VERIFY
    process: "Fully washed",
    varietal: "Heirloom 74112",
    altitude: "1,900–2,100 m",
    harvest: "Nov 24 – Jan 25",
    grade: "G1",
    screen: "15+",
    moisture: "10.6%",
    defects: "0 primary",
    score: 87.5,
    bags: "320 × 60 kg",
    notes: "Bergamot · white peach · black tea",
    scores: [8.5, 8.5, 8.25, 8.75, 7.75, 8.25],
    image: "/img/bags/yirgacheffe.webp",
  },
  {
    id: "ETH-SD-2412",
    region: "Sidamo",
    station: "Bensa washing station", // VERIFY
    process: "Fully washed",
    varietal: "Heirloom 74158",
    altitude: "1,850–2,050 m",
    harvest: "Dec 24 – Feb 25",
    grade: "G1",
    screen: "15+",
    moisture: "10.5%",
    defects: "0 primary",
    score: 87.0,
    bags: "640 × 60 kg",
    notes: "Red apple · caramel · jasmine",
    scores: [8.5, 8.25, 8.25, 8.5, 8.0, 8.25],
    image: "/img/bags/sidamo.webp",
  },
  {
    id: "ETH-NK-2415",
    region: "Nekemte",
    station: "Gimbi washing station", // VERIFY
    process: "Natural",
    varietal: "Wollega heirloom",
    altitude: "1,750–2,000 m",
    harvest: "Nov 24 – Jan 25",
    grade: "G1",
    screen: "15+",
    moisture: "10.7%",
    defects: "0 primary",
    score: 87.25,
    bags: "480 × 60 kg",
    notes: "Cocoa · ripe apricot · sweet spice",
    scores: [8.5, 8.25, 8.25, 8.25, 8.5, 8.25],
    image: "/img/bags/nekemte.webp",
  },
];

/** Cupping scores live in 6–10; anchoring the plot there uses the whole shape. */
const MIN = 6;
const MAX = 10;
const R = 84;
const CX = 140;
const CY = 124;

function point(i: number, value: number) {
  const angle = (Math.PI * 2 * i) / AXIS_LABELS.length - Math.PI / 2;
  const t = (value - MIN) / (MAX - MIN);
  return [CX + Math.cos(angle) * R * t, CY + Math.sin(angle) * R * t] as const;
}

const poly = (values: number[]) => values.map((v, i) => point(i, v).join(",")).join(" ");

export default function Quality() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const lot = LOTS[active];
  const subtotal = lot.scores.reduce((s, v) => s + v, 0);

  /** A tablist that ignores arrow keys isn't really a tablist. */
  function onKeyDown(e: React.KeyboardEvent) {
    const delta =
      e.key === "ArrowRight"
        ? 1
        : e.key === "ArrowLeft"
          ? -1
          : e.key === "Home"
            ? -active
            : e.key === "End"
              ? LOTS.length - 1 - active
              : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (active + delta + LOTS.length) % LOTS.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <section
      id="quality"
      aria-labelledby="quality-heading"
      className="relative border-t border-line bg-bg py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <Reveal>
              <p className="kicker">Quality &amp; traceability</p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2
                id="quality-heading"
                className="font-display mt-4 max-w-lg text-3xl leading-[1.08] text-fg sm:text-[2.5rem]"
              >
                Traceable to the washing station.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <p className="max-w-[15rem] text-sm leading-relaxed text-muted">
              Pick a lot to see its cupping profile and pre-shipment
              analysis.
            </p>
          </Reveal>
        </div>

        {/* --- Lot selector ------------------------------------------------ */}
        <Reveal delay={0.16}>
          <div
            role="tablist"
            aria-label="Available lots"
            onKeyDown={onKeyDown}
            className="mt-9 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4"
          >
            {LOTS.map((l, i) => {
              const on = i === active;
              return (
                <button
                  key={l.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  id={`lot-tab-${l.id}`}
                  aria-selected={on}
                  aria-controls="lot-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={`group relative px-4 py-3.5 text-left transition-colors duration-[var(--dur-fast)] [transition-timing-function:var(--ease)] ${
                    on ? "bg-surface" : "bg-bg hover:bg-surface/60"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 top-0 h-px origin-left bg-accent-solid transition-transform duration-[var(--dur-fast)] [transition-timing-function:var(--ease)] ${
                      on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-hover:opacity-40"
                    }`}
                  />
                  <span className="flex items-baseline justify-between gap-2">
                    <span
                      className={`font-display truncate text-base leading-tight transition-colors duration-[var(--dur-fast)] ${
                        on ? "text-fg" : "text-muted group-hover:text-fg"
                      }`}
                    >
                      {l.region}
                    </span>
                    <span
                      className={`nums font-display shrink-0 text-lg leading-none transition-colors duration-[var(--dur-fast)] ${
                        on ? "text-accent" : "text-faint"
                      }`}
                    >
                      {l.score.toFixed(2)}
                    </span>
                  </span>
                  <span className="mt-1 block truncate text-[10px] uppercase tracking-[0.14em] text-faint">
                    {l.process}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* --- Selected lot ------------------------------------------------ */}
        <Reveal delay={0.2}>
          <div
            id="lot-panel"
            role="tabpanel"
            aria-labelledby={`lot-tab-${lot.id}`}
            className="grid border-x border-b border-line bg-surface md:grid-cols-2 lg:grid-cols-[212px_226px_minmax(0,1fr)]"
          >
            {/* Bag */}
            <div className="flex items-center justify-center border-b border-line bg-bg px-4 py-6 md:border-r lg:border-b-0">
              <motion.div
                key={lot.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[180px]"
              >
                <Image
                  src={lot.image}
                  alt={`60 kg jute sack of ${lot.region} ${lot.process} green coffee.`}
                  width={760}
                  height={711}
                  sizes="(min-width: 1024px) 200px, (min-width: 768px) 40vw, 60vw"
                  className="h-auto w-full"
                  priority={lot === LOTS[0]}
                />
              </motion.div>
            </div>

            {/* Radar */}
            <figure className="border-b border-line px-4 py-5 lg:border-b-0 lg:border-r">
              <svg
                viewBox="0 0 280 236"
                className="mx-auto w-full max-w-[210px]"
                role="img"
                aria-label={`Cupping profile for lot ${lot.id}: ${AXIS_LABELS.map(
                  (a, i) => `${a} ${lot.scores[i]}`,
                ).join(", ")}.`}
              >
                {[0.25, 0.5, 0.75, 1].map((f) => (
                  <polygon
                    key={f}
                    points={poly(AXIS_LABELS.map(() => MIN + (MAX - MIN) * f))}
                    fill="none"
                    stroke="var(--line)"
                    strokeWidth="1"
                  />
                ))}
                {AXIS_LABELS.map((label, i) => {
                  const [x, y] = point(i, MAX);
                  const [lx, ly] = point(i, MAX + 1.35);
                  return (
                    <g key={label}>
                      <line x1={CX} y1={CY} x2={x} y2={y} stroke="var(--line)" />
                      <text
                        x={lx}
                        y={ly}
                        fill="var(--faint)"
                        fontSize="9"
                        letterSpacing="0.1em"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {label.toUpperCase()}
                      </text>
                    </g>
                  );
                })}
                <motion.g
                  key={lot.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: `${CX}px ${CY}px` }}
                >
                  <polygon
                    points={poly(lot.scores)}
                    fill="var(--accent-solid)"
                    fillOpacity="0.18"
                    stroke="var(--accent-solid)"
                    strokeWidth="1.5"
                  />
                  {lot.scores.map((v, i) => {
                    const [x, y] = point(i, v);
                    return <circle key={i} cx={x} cy={y} r="2.5" fill="var(--accent-solid)" />;
                  })}
                </motion.g>
              </svg>
              <figcaption className="nums text-center text-[10px] text-faint">
                Subtotal {subtotal.toFixed(2)} / 60 · SCA scale 6–10
              </figcaption>
            </figure>

            {/* Spec sheet */}
            <div className="p-5 sm:p-6 md:col-span-2 lg:col-span-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="nums text-[10px] tracking-[0.14em] text-accent">{lot.id}</p>
                  <h3 className="font-display mt-1 text-xl leading-tight text-fg">
                    {lot.region} · {lot.process}
                  </h3>
                  <p className="mt-0.5 text-xs text-faint">
                    {lot.station} · {lot.altitude}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display nums text-3xl leading-none text-fg">
                    {lot.score.toFixed(2)}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-faint">
                    SCA score
                  </p>
                </div>
              </div>

              <p className="mt-4 border-t border-line pt-4 text-sm italic text-muted">
                {lot.notes}
              </p>

              <dl className="nums mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-4 sm:grid-cols-3">
                {[
                  ["Grade", lot.grade],
                  ["Screen", lot.screen],
                  ["Moisture", lot.moisture],
                  ["Defects", lot.defects],
                  ["Varietal", lot.varietal],
                  ["Harvest", lot.harvest],
                  ["Available", lot.bags],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-faint">{k}</dt>
                    <dd className="mt-0.5 text-sm text-fg">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.26}>
          <p className="mt-4 text-xs text-faint">
            Lots move, so the list above is what is in the warehouse this week. Ask for the
            full offer sheet with current differentials and we will send samples of whatever
            fits.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
