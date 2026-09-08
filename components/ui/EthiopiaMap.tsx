"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { ORIGINS } from "@/lib/origins";
import {
  LAT_MAX,
  LAT_MIN,
  LON_MAX,
  LON_MIN,
  MAP_H,
  MAP_W,
  OUTLINE,
  project,
} from "@/lib/ethiopia";

/**
 * Ethiopia as a shallow relief on paper: a locator map that also carries the
 * export argument.
 *
 * Everything here is SVG and CSS in the page's own palette. A Cycles render was
 * tried and thrown away — photographic shading put grey concrete in the middle
 * of a warm editorial page, and relighting never fixed the mismatch, because
 * the section's look comes from flat colour and hairlines. So the depth is
 * built from those: the outline stamped a dozen times, a unit apart, in the
 * hairline colour, under a cast shadow shaped to the country rather than to a
 * card.
 *
 * The geometry is real. The border is the national border in degrees (see
 * lib/ethiopia.ts) and every marker is projected from true coordinates through
 * one function, so nothing can drift when the outline is retouched. The version
 * this replaced was hand-drawn, which is why it had the northern border wrong,
 * no Somali spur, and Yirgacheffe plotted west of Sidamo.
 *
 * What it adds beyond a locator: picking a region draws that lot's actual route
 * to water — station to Addis for milling and grading, Addis down the corridor
 * to Djibouti — with a bead running it on a loop. For an exporter that is the
 * whole proposition in one graphic, and it is the reason this is a map rather
 * than a list of four names.
 */

/** Depth of the extrusion, in viewBox units. */
const DEPTH = 13;

/** The two fixed points every lot passes through on its way out. */
const ADDIS: [number, number] = [38.74, 9.03];
const DJIBOUTI: [number, number] = [43.145, 11.588];

/**
 * Where each label hangs off its pin.
 *
 * Yirgacheffe, Sidama and Guji sit inside a degree of each other, so at true
 * scale their labels collide however they are anchored. Only the type moves:
 * a label offset is a typographic decision, a moved pin would be a lie about
 * where the coffee grows.
 */
const LABEL: Record<
  string,
  { dx: number; dy: number; ady: number; anchor: "start" | "end" }
> = {
  // `ady` is the altitude readout's own baseline, not an offset from the name.
  // Hanging it a fixed distance under every name put Jimma's band straight
  // through Sidamo's label: these four sit inside a degree of each other, so
  // the second line is placed per region, on whichever side happens to be
  // free, rather than by one rule. Jimma's goes above for that reason.
  //
  // The vertical spread is not decoration. Sidamo and Yirgacheffe are 24
  // units apart at true scale and a label's box is 27 tall, so leaving both
  // beside their dots overlaps them — one has to go up and one down.
  //
  // That distance between a name and its dot was flagged and a leader line was
  // tried to close it. The leader read as a stray scratch at the size this
  // renders, so the offsets stand on their own: the halo on the active pin is
  // what ties the two together.
  jimma: { dx: -18, dy: -18, ady: -50, anchor: "end" },
  sidamo: { dx: -18, dy: -14, ady: 26, anchor: "end" },
  yirgacheffe: { dx: -18, dy: 28, ady: 50, anchor: "end" },
  guji: { dx: 20, dy: 18, ady: 40, anchor: "start" },
};

const FALLBACK_LABEL = { dx: 18, dy: 6, ady: 26, anchor: "start" } as const;

/**
 * A gently bowed two-leg route: origin to Addis, Addis to the port.
 *
 * Bowed rather than straight because two straight segments meeting at Addis
 * read as a dogleg — an error in the drawing — where an arc reads as a journey.
 * The control point is pushed off each segment's midpoint along its own normal,
 * so the bow scales with the leg and short legs do not loop.
 */
function routePath(from: [number, number]): string {
  const legs = [from, project(...ADDIS), project(...DJIBOUTI)];
  let d = `M${legs[0][0].toFixed(1)} ${legs[0][1].toFixed(1)}`;

  for (let i = 1; i < legs.length; i++) {
    const [x0, y0] = legs[i - 1];
    const [x1, y1] = legs[i];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    // Normal to the leg, scaled — negative so the bow falls consistently to
    // one side and the two legs read as one continuous sweep.
    const nx = -(y1 - y0) * 0.14;
    const ny = (x1 - x0) * 0.14;
    d += ` Q${(mx + nx).toFixed(1)} ${(my + ny).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return d;
}

/** Graticule every two degrees, for the cartographic read. */
const GRID_STEP = 2;
const gridLons: number[] = [];
for (let l = Math.ceil(LON_MIN / GRID_STEP) * GRID_STEP; l < LON_MAX; l += GRID_STEP) {
  gridLons.push(l);
}
const gridLats: number[] = [];
for (let l = Math.ceil(LAT_MIN / GRID_STEP) * GRID_STEP; l < LAT_MAX; l += GRID_STEP) {
  gridLats.push(l);
}

/** 200 km at this scale. One degree of latitude is ~111 km. */
const SCALE_KM = 200;
const SCALE_LEN = (SCALE_KM / 111) * (MAP_H / (LAT_MAX - LAT_MIN));

/* --- Reduced motion, as a subscription -------------------------------------
 *
 * SMIL animation ignores prefers-reduced-motion — no CSS media query reaches
 * it — so the travelling bead has to be withheld in script, or it loops
 * forever for someone who asked for stillness.
 *
 * Read through useSyncExternalStore rather than an effect that calls setState:
 * a media query is precisely an external store, the server snapshot lets the
 * markup ship still and hydrate into motion (never the reverse), and it picks
 * up a reader changing the setting mid-visit for free.
 */
const RM_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(RM_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const readMotion = () => window.matchMedia(RM_QUERY).matches;
/** Assume stillness on the server: shipping motion and taking it away is worse. */
const readMotionServer = () => true;

export default function EthiopiaMap({
  activeId,
  onPick,
}: {
  activeId: string;
  onPick: (id: string) => void;
}) {
  const plate = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const still = useSyncExternalStore(
    subscribeMotion,
    readMotion,
    readMotionServer,
  );

  const active = ORIGINS.find((o) => o.id === activeId) ?? ORIGINS[0];
  const route = routePath(project(active.lon, active.lat));
  const [ax, ay] = project(...ADDIS);
  const [dx, dy] = project(...DJIBOUTI);

  return (
    <div>
      {/*
       * No 3D transform on this element, and that is the whole reason the map
       * looks sharp.
       *
       * It used to carry a resting rotateX plus a pointer-tracked rotateY, and
       * it looked soft at every size — which read as a low-resolution image
       * even though every mark here is vector. A CSS 3D transform promotes the
       * subtree to a composited layer, rasterises it ONCE into a flat texture,
       * and then transforms that texture: the border, the graticule and every
       * label get resampled, and text inside a 3D transform loses subpixel
       * antialiasing outright. Vector art cannot out-resolve that, because by
       * the time the tilt applies it is no longer vector.
       *
       * So the tilt is gone and the crispness is back. The depth still reads —
       * it comes from the stamped wall and the cast shadow, which are drawn at
       * full resolution like everything else.
       */}
      <div ref={plate} className="relative">
        <svg
          viewBox={`-8 -8 ${MAP_W + 16} ${MAP_H + DEPTH + 16}`}
          className="mx-auto block w-full max-w-[20rem] sm:max-w-sm md:max-w-none"
          // role="img" with one summary label, deliberately. The pins below are
          // pointer affordances that duplicate the radio group above — that
          // group is the accessible control, and exposing four more buttons
          // saying the same thing would only pad the tab order.
          role="img"
          aria-label={`Map of Ethiopia. Regions marked: ${ORIGINS.map((o) => o.name).join(
            ", ",
          )}. Showing the route from ${active.name} to Addis Ababa and on to the port of Djibouti.`}
        >
          <defs>
            {/* The box shadow, shaped to the country rather than to a card. A
                rectangular plate shadow boxed the map into a tile that fought
                the section's open layout; a cast following the border lifts the
                landmass and leaves the layout alone. Warm --faint, never grey —
                a neutral shadow on warm paper is what made the render read as
                concrete. */}
            <filter
              id="eth-cast"
              x="-15%"
              y="-15%"
              width="130%"
              height="135%"
              colorInterpolationFilters="sRGB"
            >
              <feDropShadow
                dx="2"
                dy="9"
                stdDeviation="9"
                floodColor="#8a7e70"
                floodOpacity="0.38"
              />
            </filter>

            {/* The graticule is clipped to the land so it reads as printed on
                the map rather than drawn across the page. */}
            <clipPath id="eth-clip">
              <path d={OUTLINE} />
            </clipPath>
          </defs>

          {/* --- The relief -----------------------------------------------
              The outline stamped downward in the hairline colour, darkening as
              it goes, so the wall has a light source rather than reading as a
              flat band. Warm, because everything on this page is. */}
          <g className="map-face" filter="url(#eth-cast)">
            {Array.from({ length: DEPTH }, (_, i) => {
              const d = DEPTH - i;
              return (
                <path
                  key={d}
                  d={OUTLINE}
                  transform={`translate(0 ${d})`}
                  fill="var(--line)"
                  fillOpacity={0.3 + (i / DEPTH) * 0.7}
                />
              );
            })}
          </g>

          {/* The top face, and the survey line that draws it in. Same element:
              the stroke animates its dash open, then the fill washes in behind
              it — see .map-outline in globals.css. */}
          <path
            className="map-outline"
            d={OUTLINE}
            // pathLength normalises the outline to 1, so the dash animation is
            // written in fractions and nothing calls getTotalLength().
            pathLength={1}
            fill="var(--surface)"
            // Between the two that were tried: --faint at 1.25 vanished, and
            // --muted at 2 was the heavy line that got pulled. This mixes 40%
            // of the darker tone into the lighter one, so the coastline reads
            // as the firmest line in the drawing without turning into a rule.
            stroke="color-mix(in srgb, var(--muted) 40%, var(--faint))"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* --- Graticule --------------------------------------------------- */}
          <g className="map-grid" clipPath="url(#eth-clip)" aria-hidden>
            {gridLons.map((lon) => {
              const [x] = project(lon, 0);
              return (
                <line
                  key={`v${lon}`}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={MAP_H}
                  stroke="var(--faint)"
                  strokeWidth="0.5"
                  opacity="0.28"
                />
              );
            })}
            {gridLats.map((lat) => {
              const [, y] = project(0, lat);
              return (
                <line
                  key={`h${lat}`}
                  x1={0}
                  y1={y}
                  x2={MAP_W}
                  y2={y}
                  stroke="var(--faint)"
                  strokeWidth="0.5"
                  opacity="0.28"
                />
              );
            })}
          </g>

          {/* --- Export route ------------------------------------------------
              Station to Addis to Djibouti, redrawn whenever the region changes.
              Keyed on the active id so the dash animation restarts and the line
              re-draws rather than snapping to the new geometry. */}
          <g className="map-route" key={active.id} aria-hidden>
            <path
              className="route-line"
              d={route}
              fill="none"
              stroke="var(--accent-solid)"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeDasharray="7 6"
            />
            {!still && (
              <circle r="3.5" fill="var(--accent-solid)">
                {/* SMIL, not CSS: motion along an arbitrary path is exactly
                    what animateMotion does, and it needs no script and no
                    per-frame work on the main thread. */}
                <animateMotion
                  dur="3.6s"
                  repeatCount="indefinite"
                  path={route}
                  rotate="auto"
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1"
                />
              </circle>
            )}
          </g>

          {/* Addis Ababa: where every lot is milled and graded. */}
          <g aria-hidden className="map-pin" style={{ animationDelay: "1.35s" }}>
            <rect
              x={ax - 3.5}
              y={ay - 3.5}
              width="7"
              height="7"
              fill="var(--fg)"
              transform={`rotate(45 ${ax} ${ay})`}
            />
            <text
              x={ax + 12}
              y={ay - 6}
              fill="var(--muted)"
              fontSize="17"
              paintOrder="stroke"
              stroke="var(--surface)"
              strokeWidth="3.5"
              strokeLinejoin="round"
            >
              Addis Ababa
            </text>
          </g>

          {/* Djibouti sits outside the border, which is the point — it is the
              water this coffee leaves from. */}
          <g aria-hidden className="map-pin" style={{ animationDelay: "1.4s" }}>
            <circle cx={dx} cy={dy} r="4" fill="none" stroke="var(--fg)" strokeWidth="1.5" />
            <circle cx={dx} cy={dy} r="1.5" fill="var(--fg)" />
            <text
              x={dx + 12}
              y={dy + 4}
              fill="var(--muted)"
              fontSize="17"
              paintOrder="stroke"
              stroke="var(--bg)"
              strokeWidth="3.5"
              strokeLinejoin="round"
            >
              Djibouti
            </text>
          </g>

          {/* --- Stations --------------------------------------------------- */}
          {ORIGINS.map((o, i) => {
            const [x, y] = project(o.lon, o.lat);
            const on = o.id === activeId;
            const hot = hovered === o.id;
            const label = LABEL[o.id] ?? FALLBACK_LABEL;

            return (
              <g
                key={o.id}
                className="map-pin cursor-pointer"
                style={{ animationDelay: `${1.1 + i * 0.06}s` }}
                onClick={() => onPick(o.id)}
                onPointerEnter={() => setHovered(o.id)}
                onPointerLeave={() => setHovered((h) => (h === o.id ? null : h))}
              >
                {/* A generous invisible target. The visible dot is four units
                    across; asking anyone to hit that with a thumb, on a plate
                    that is also tilting under their finger, would be a joke. */}
                <circle cx={x} cy={y} r="26" fill="transparent" />
                {(on || hot) && (
                  <circle
                    cx={x}
                    cy={y}
                    r={on ? 18 : 13}
                    fill="var(--accent-solid)"
                    opacity={on ? 0.16 : 0.1}
                    style={{
                      transition: "r var(--dur-fast) var(--ease), opacity var(--dur-fast)",
                    }}
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={on ? 6.5 : hot ? 5.5 : 4}
                  fill={on || hot ? "var(--accent-solid)" : "var(--faint)"}
                  style={{
                    transition:
                      "r var(--dur-fast) var(--ease), fill var(--dur-fast) var(--ease)",
                  }}
                />
                <text
                  x={x + label.dx}
                  y={y + label.dy}
                  textAnchor={label.anchor}
                  fill={on || hot ? "var(--fg)" : "var(--faint)"}
                  fontSize="22"
                  // Paper behind the type: three of the four labels sit over the
                  // face, and one crosses the western border.
                  paintOrder="stroke"
                  stroke="var(--surface)"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                  style={{ transition: "fill var(--dur-fast) var(--ease)" }}
                >
                  {o.name}
                </text>
                {/* The altitude band, on the pin, for the region in play. The
                    number a buyer actually wants next to a place name. */}
                {on && (
                  <text
                    x={x + label.dx}
                    y={y + label.ady}
                    textAnchor={label.anchor}
                    fill="var(--accent)"
                    fontSize="15"
                    paintOrder="stroke"
                    stroke="var(--surface)"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  >
                    {o.altitude[0].toLocaleString()}–{o.altitude[1].toLocaleString()} m
                  </text>
                )}
              </g>
            );
          })}

          {/* --- Furniture ---------------------------------------------------
              A scale bar and a north point. Cheap, and they are the difference
              between a shape with dots on it and something that reads as a
              map — which matters when the claim being made is traceability. */}
          <g className="map-pin" style={{ animationDelay: "1.5s" }} aria-hidden>
            <line
              x1={16}
              y1={MAP_H - 6}
              x2={16 + SCALE_LEN}
              y2={MAP_H - 6}
              stroke="var(--faint)"
              strokeWidth="1.25"
            />
            <line x1={16} y1={MAP_H - 11} x2={16} y2={MAP_H - 1} stroke="var(--faint)" strokeWidth="1.25" />
            <line
              x1={16 + SCALE_LEN}
              y1={MAP_H - 11}
              x2={16 + SCALE_LEN}
              y2={MAP_H - 1}
              stroke="var(--faint)"
              strokeWidth="1.25"
            />
            <text x={16} y={MAP_H - 16} fill="var(--faint)" fontSize="15">
              {SCALE_KM} km
            </text>

            <g transform={`translate(${MAP_W - 34} 30)`}>
              <path d="M0 -14 L5 8 L0 3 L-5 8 Z" fill="var(--faint)" />
              <text x={0} y={26} textAnchor="middle" fill="var(--faint)" fontSize="15">
                N
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
