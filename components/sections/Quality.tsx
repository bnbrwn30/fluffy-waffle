"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { DUR, prefersReducedMotion } from "@/lib/motion";

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
 * Two different kinds of number live in here, and the distinction matters:
 *
 *  - The lot descriptors (station, varietal, altitude, harvest and export
 *    windows, screen size, grade) are the published figures for those
 *    origins, each sourced in a comment on the lot. Swap them for the
 *    contract's own numbers as each lot is confirmed.
 *  - The four instrument readings (moisture, water activity, density, defect
 *    count) are crop-year typicals for the grade, and the section says so on
 *    the page: the signed certificate of analysis travels with the sample.
 *  - The SPEC ranges they are plotted against are real, published thresholds,
 *    each carrying the standard and method it comes from. Those are what turn
 *    a table of figures into an argument a green buyer can check: it is not
 *    "our moisture is 10.4%", it is "10.4% against a 9–12.5% specialty band,
 *    measured the way ISO 6673 says to measure it".
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
  /** Window in which the crop year ships from Djibouti. */
  shipping: string;
  grade: string;
  screen: string;
  score: number;
  /** Pre-shipment analysis. Plotted against SPEC, so these stay numeric. */
  moisture: number;
  /** Water activity, aw. */
  water: number;
  /** Free-flow bulk density, g/L (ISO 6669). */
  density: number;
  /** Full defect equivalents per 300 g sample (SCA green grading protocol). */
  defects: number;
  bags: string;
  notes: string;
  /** Cupping attributes, in AXIS_LABELS order. */
  scores: number[];
  /** Warehouse bag shot. */
  image: string;
};

const LOTS: Lot[] = [
  // Guji: region 1,800–2,300 m, harvest Nov–Feb, export-ready Feb–Jun
  // (ethiocoffee.co harvest calendar). Shakiso smallholders are published at
  // 1,900–2,100 m; 74110/74112 are JARC selections released in 1979.
  {
    id: "ETH-GJ-2401",
    region: "Guji",
    station: "Shakiso washing station",
    process: "Natural",
    varietal: "74110 · 74112",
    altitude: "1,900–2,100 m",
    harvest: "Nov – Feb",
    shipping: "Feb – Jun",
    grade: "G1 · ECX Q1",
    screen: "15–17 (6.0–6.75 mm)",
    score: 88.0,
    moisture: 10.4,
    water: 0.55,
    density: 716,
    defects: 2,
    bags: "160 × 60 kg",
    notes: "Blueberry · jasmine · dark chocolate",
    scores: [8.75, 8.5, 8.25, 8.75, 8.0, 8.5],
    image: "/img/bags/guji.webp",
  },
  // Yirgacheffe: 1,750–2,200 m, harvest Oct–Jan, export-ready Jan–May. The
  // Kochere station itself is published at 1,800–2,100 m, fermenting 36–48 h.
  {
    id: "ETH-YG-2408",
    region: "Yirgacheffe",
    station: "Kochere washing station",
    process: "Fully washed",
    varietal: "74112 · local heirloom",
    altitude: "1,800–2,100 m",
    harvest: "Oct – Jan",
    shipping: "Jan – May",
    grade: "G1 · ECX Q1",
    screen: "15–17 (6.0–6.75 mm)",
    score: 87.5,
    moisture: 10.6,
    water: 0.56,
    density: 728,
    defects: 1,
    bags: "320 × 60 kg",
    notes: "Bergamot · white peach · black tea",
    scores: [8.5, 8.5, 8.25, 8.75, 7.75, 8.25],
    image: "/img/bags/yirgacheffe.webp",
  },
  // Sidama: 1,550–2,200 m regionally, harvest Oct–Feb, export-ready Jan–Jun.
  // Bensa sits at the top of that: its stations publish 1,920–2,300 m and pick
  // Dec–Feb. 74158 is one of the three varieties common to Sidama.
  {
    id: "ETH-SD-2412",
    region: "Sidamo",
    station: "Bensa washing station",
    process: "Fully washed",
    varietal: "74158 · mixed heirloom",
    altitude: "1,920–2,300 m",
    harvest: "Dec – Feb",
    shipping: "Jan – Jun",
    grade: "G1 · ECX Q1",
    screen: "15–17 (6.0–6.75 mm)",
    score: 87.0,
    moisture: 10.5,
    water: 0.55,
    density: 722,
    defects: 3,
    bags: "640 × 60 kg",
    notes: "Red apple · caramel · jasmine",
    scores: [8.5, 8.25, 8.25, 8.5, 8.0, 8.25],
    image: "/img/bags/sidamo.webp",
  },
  // Nekemte ships under the ECX trade name Lekempti. Gimbi is a West Wollega
  // woreda, published at 1,600–2,100 m; harvest Oct–Jan, export-ready Mar–Aug,
  // screen 14–18 but predominantly 15–17. Commercial Lekempti cups 78–84 and
  // specialty micro-lots reach 85–87, so a G1 here is the top of the crop and
  // needs reserving ahead — hence 86.25, not the 88 a Guji natural carries.
  {
    id: "ETH-NK-2415",
    region: "Nekemte",
    station: "Gimbi · West Wollega",
    process: "Natural",
    varietal: "Wollega heirloom",
    altitude: "1,600–2,100 m",
    harvest: "Oct – Jan",
    shipping: "Mar – Aug",
    grade: "G1 · ECX Q1",
    screen: "15–17 (6.0–6.75 mm)",
    score: 86.25,
    moisture: 10.7,
    water: 0.57,
    density: 705,
    // ECX G1 allows 0–3 full defects per 300 g, so a G1 lot cannot carry 4.
    defects: 3,
    bags: "480 × 60 kg",
    notes: "Stone fruit · jasmine · cocoa",
    scores: [8.25, 8.25, 8.0, 8.0, 8.25, 8.0],
    image: "/img/bags/nekemte.webp",
  },
];

/**
 * The published thresholds each reading is judged against.
 *
 * `lo`/`hi` are the ends of the plotted axis, not the pass band — the band is
 * `okLo`/`okHi`, and it is drawn as a shaded zone so a reading sitting inside
 * it is legible at a glance without anyone reading a number. `ref` is the
 * standard the band comes from; it is printed, because an unattributed
 * threshold is just another number we made up.
 */
type Spec = {
  k: string;
  unit: string;
  lo: number;
  hi: number;
  okLo: number;
  okHi: number;
  /** Decimal places when printing the reading. */
  dp: number;
  ref: string;
  get: (l: Lot) => number;
};

const SPEC: Spec[] = [
  {
    k: "Moisture",
    unit: "%",
    lo: 8,
    hi: 14,
    okLo: 9,
    okHi: 12.5,
    dp: 1,
    ref: "SCA green grading 9–12.5% · measured per ISO 6673",
    get: (l) => l.moisture,
  },
  {
    k: "Water activity",
    unit: "aw",
    lo: 0.4,
    hi: 0.75,
    okLo: 0.4,
    okHi: 0.6,
    dp: 2,
    ref: "≤ 0.60 aw — the storage threshold below which mould growth stalls",
    get: (l) => l.water,
  },
  {
    k: "Bulk density",
    unit: "g/L",
    lo: 600,
    hi: 800,
    okLo: 680,
    okHi: 780,
    dp: 0,
    ref: "Free-flow bulk density, ISO 6669 · high-grown arabica runs dense",
    get: (l) => l.density,
  },
  {
    k: "Full defects",
    unit: "/ 300 g",
    lo: 0,
    hi: 12,
    okLo: 0,
    okHi: 5,
    dp: 0,
    ref: "SCA specialty: max 5 full defects, zero category 1 · ECX G1 is 0–3",
    get: (l) => l.defects,
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

/**
 * Tweens the six cupping values whenever the selected lot changes, so the
 * polygon *reshapes* into the next lot instead of fading out and back in.
 *
 * This is the difference between decoration and information. Guji's acidity
 * spike visibly collapsing into Nekemte's flatter, body-forward hexagon tells
 * a buyer how the two lots differ in a way that two separate shapes, shown a
 * third of a second apart, never can — the comparison happens in the motion.
 *
 * Hand-rolled rather than six motion values: the shape is one attribute string
 * on one polygon, so there is nothing for a component-per-axis to buy, and
 * writing the interpolation here keeps the site's easing curve authoritative.
 */
function useMorphingRadar(target: number[]) {
  const polyRef = useRef<SVGPolygonElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);

  /**
   * The shape React renders. Captured once, on mount, and never updated —
   * React owns the first paint and the effect below owns every frame after it,
   * so a re-render can never yank the polygon back to the selected lot's final
   * values while a morph is still travelling.
   */
  const [initial] = useState(target);
  /** Where the drawn shape actually is. Written only from the effect. */
  const current = useRef(target);
  const raf = useRef(0);

  useEffect(() => {
    const write = (values: number[]) => {
      polyRef.current?.setAttribute("points", poly(values));
      values.forEach((v, i) => {
        const [x, y] = point(i, v);
        const dot = dotRefs.current[i];
        dot?.setAttribute("cx", String(x));
        dot?.setAttribute("cy", String(y));
      });
      current.current = values;
    };

    // Jumping straight to the answer is the correct reduced-motion behaviour
    // here: the shape carries data, so it must arrive — just not travel.
    if (prefersReducedMotion()) {
      write(target);
      return;
    }

    const start = current.current;
    const t0 = performance.now();
    const ms = DUR.base * 1000;

    /**
     * The shape must arrive even if not a single frame of the morph does.
     *
     * requestAnimationFrame does not run in a backgrounded, hidden or occluded
     * page, and this tween is the only thing that writes the polygon — so a
     * starved rAF would leave the radar drawn from the *previous* lot while
     * the spec sheet beside it names the new one. That is not a missing
     * animation, it is a chart showing the wrong coffee. Timers still fire
     * where frames do not, so one lands the final geometry regardless.
     */
    const land = window.setTimeout(() => write(target), ms + 400);

    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      // The expo-out shape of --ease, closed-form. Sampling the cubic bezier
      // properly would be more faithful and utterly indistinguishable.
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      write(target.map((to, i) => start[i] + (to - start[i]) * e));

      if (p < 1) {
        raf.current = requestAnimationFrame(step);
        return;
      }
      // Land on the exact figures rather than on the last interpolation.
      write(target);
      clearTimeout(land);
    };

    raf.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(land);
    };
    // Keyed on the array identity deliberately: LOTS is module-level, so each
    // lot's `scores` is a stable reference and this runs once per change of
    // lot rather than on every re-render. An interrupted morph resumes from
    // wherever the shape had actually reached, via `current`.
  }, [target]);

  return { polyRef, dotRefs, initial };
}

export default function Quality() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const lot = LOTS[active];
  const subtotal = lot.scores.reduce((s, v) => s + v, 0);
  /** The drawn shape morphs into the selected lot rather than cutting to it. */
  const { polyRef, dotRefs, initial } = useMorphingRadar(lot.scores);

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
      className="relative border-t border-line bg-bg py-16 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <Reveal>
              <p className="kicker">Quality &amp; traceability</p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2
                id="quality-heading"
                className="font-display mt-3 max-w-lg text-[clamp(1.75rem,7vw,2rem)] leading-[1.1] text-balance text-fg sm:mt-4 sm:text-[2.5rem] sm:leading-[1.08]"
              >
                Traceable to the washing station.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <p className="max-w-sm text-sm leading-relaxed text-muted sm:max-w-[15rem]">
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
            className="mt-7 grid grid-cols-2 gap-px border border-line bg-line sm:mt-9 sm:grid-cols-4"
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
                  className={`group relative px-3.5 py-3 text-left transition-colors sm:px-4 sm:py-3.5 duration-[var(--dur-fast)] [transition-timing-function:var(--ease)] ${
                    on ? "bg-surface" : "bg-bg hover:bg-surface/60"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 top-0 h-px origin-left bg-accent-solid transition-transform duration-[var(--dur-fast)] [transition-timing-function:var(--ease)] ${
                      on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-hover:opacity-40"
                    }`}
                  />
                  <span className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
                    <span
                      className={`font-display text-[0.9375rem] leading-tight transition-colors duration-[var(--dur-fast)] sm:truncate sm:text-base ${
                        on ? "text-fg" : "text-muted group-hover:text-fg"
                      }`}
                    >
                      {l.region}
                    </span>
                    <span
                      className={`nums font-display shrink-0 text-base leading-none transition-colors duration-[var(--dur-fast)] sm:text-lg ${
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
                className="w-full max-w-[200px] sm:max-w-[180px]"
              >
                <Image
                  src={lot.image}
                  alt={`60 kg jute sack of ${lot.region} ${lot.process} green coffee.`}
                  width={760}
                  height={711}
                  sizes="(min-width: 1024px) 200px, (min-width: 768px) 40vw, 60vw"
                  className="h-auto w-full"
                  // Lazy (the default), deliberately. This sack sits well below
                  // the fold; `priority` put a <link rel="preload"> carrying
                  // the whole ten-entry srcset in the document head, ahead of
                  // the hero on a cold load, and `eager` still hoisted one.
                  // Lenis scrolls the window natively — there is no
                  // transformed wrapper — so the lazy observer fires here.
                />
              </motion.div>
            </div>

            {/* Radar */}
            <figure className="border-b border-line px-4 py-5 lg:border-b-0 lg:border-r">
              <svg
                viewBox="0 0 280 236"
                className="mx-auto w-full max-w-[240px] sm:max-w-[210px]"
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
                {/* No key, deliberately. Keying this group on the lot id
                    remounts it on every change, which is what forced the old
                    fade-and-rescale; letting one group persist is what allows
                    the shape to morph from one lot into the next. */}
                <g>
                  <polygon
                    ref={polyRef}
                    points={poly(initial)}
                    fill="var(--accent-solid)"
                    fillOpacity="0.18"
                    stroke="var(--accent-solid)"
                    strokeWidth="1.5"
                  />
                  {initial.map((v, i) => {
                    const [x, y] = point(i, v);
                    return (
                      <circle
                        key={i}
                        ref={(el) => {
                          dotRefs.current[i] = el;
                        }}
                        cx={x}
                        cy={y}
                        r="2.5"
                        fill="var(--accent-solid)"
                      />
                    );
                  })}
                </g>
              </svg>
              <figcaption className="nums text-center text-[10px] text-faint">
                Subtotal {subtotal.toFixed(2)} / 60 · SCA scale 6–10
              </figcaption>
            </figure>

            {/* Spec sheet */}
            <div className="p-4 sm:p-6 md:col-span-2 lg:col-span-1">
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
                  ["Varietal", lot.varietal],
                  ["Harvest", lot.harvest],
                  ["Ships", lot.shipping],
                  ["Available", lot.bags],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-faint">{k}</dt>
                    <dd className="mt-0.5 text-sm text-fg">{v}</dd>
                  </div>
                ))}
              </dl>

              {/* --- Analysis against the published spec ------------------- */}
              <div className="mt-5 border-t border-line pt-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-faint">
                  Analysis vs. standard
                </p>
                <p className="mt-2 text-[10px] leading-snug text-faint">
                  Crop-year typicals for the grade. The signed certificate of
                  analysis for the specific lot travels with the sample.
                </p>
                <ul className="mt-3 space-y-3">
                  {SPEC.map((sp) => (
                    <SpecRow key={sp.k} spec={sp} lot={lot} />
                  ))}
                </ul>
              </div>
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

/**
 * One reading plotted on its own axis, with the pass band shaded behind it.
 *
 * The band is the point of the row: a bare "0.55 aw" means nothing to a
 * roaster who does not carry the threshold in their head, whereas a marker
 * sitting inside a shaded zone labelled with the standard it comes from reads
 * instantly and survives being checked.
 */
function SpecRow({ spec, lot }: { spec: Spec; lot: Lot }) {
  const value = spec.get(lot);
  const at = (v: number) =>
    `${Math.min(100, Math.max(0, ((v - spec.lo) / (spec.hi - spec.lo)) * 100))}%`;
  const inSpec = value >= spec.okLo && value <= spec.okHi;

  return (
    <li>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] text-muted">{spec.k}</span>
        <span className="nums text-[13px] text-fg">
          {value.toFixed(spec.dp)}
          <span className="ml-1 text-[10px] text-faint">{spec.unit}</span>
        </span>
      </div>

      <div className="relative mt-1.5 h-1.5" aria-hidden>
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
        {/* Pass band. */}
        <span
          className="absolute inset-y-0 bg-accent-solid/12"
          style={{ left: at(spec.okLo), right: `calc(100% - ${at(spec.okHi)})` }}
        />
        {/* The reading. */}
        <span
          className={`absolute top-1/2 h-2.5 w-px -translate-x-1/2 -translate-y-1/2 ${
            inSpec ? "bg-accent-solid" : "bg-fg"
          }`}
          style={{ left: at(value) }}
        />
      </div>

      <p className="mt-1 text-[10px] leading-snug text-faint">{spec.ref}</p>
    </li>
  );
}
