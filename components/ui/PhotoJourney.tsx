"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BEATS, photoPath } from "@/lib/journey";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * The scroll centrepiece: nine photographs cross-dissolving under a slow push,
 * scrubbed by scroll position inside a pinned section.
 *
 * Opacity and transform are written straight to the DOM on each scroll update
 * rather than through React state. Nine layers re-rendering at scroll frequency
 * would drop frames; assigning two style properties per layer does not.
 *
 * Photographs are optional. A beat with no file shows its tint instead, so the
 * section is fully working — timing, copy, choreography — before any imagery
 * has been bought.
 */
export default function PhotoJourney({
  onProgress,
  className,
  children,
  available,
}: {
  onProgress?: (p: number) => void;
  className?: string;
  /**
   * Photo basenames that exist on disk, resolved on the server at build time.
   * A beat not in this list renders its tint instead.
   */
  available: string[];
  /**
   * Overlay content — the beat copy. It must live INSIDE this component
   * because ScrollTrigger pins this element and nothing else; a sibling
   * overlay scrolls away while the images stay put.
   */
  children?: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const present = useMemo(
    () => new Set(available),
    [available],
  );

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const n = BEATS.length;
    /** Fraction of one beat's window spent cross-fading into the next. */
    const FADE = 0.32;

    const paint = (p: number) => {
      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        // Distance from this layer's centre, measured in beat-widths.
        const centre = (i + 0.5) / n;
        const d = Math.abs(p - centre) * n;

        // Opacity: full while the beat owns the scroll, easing out across the
        // overlap so two frames are only ever briefly on screen together.
        const o = d <= 0.5 ? 1 : Math.max(0, 1 - (d - 0.5) / FADE);

        // Ken Burns: a slow, continuous push. Never resets between beats, so
        // the whole section reads as one move rather than nine separate ones.
        const local = (p - i / n) * n;
        const scale = 1.1 - Math.min(Math.max(local, -0.4), 1.4) * 0.07;

        el.style.opacity = String(o);
        el.style.transform = `scale(${scale.toFixed(4)})`;
        // Fully transparent layers stop costing compositing work.
        el.style.visibility = o <= 0.001 ? "hidden" : "visible";
      });
    };

    paint(0);
    onProgress?.(0);

    if (prefersReducedMotion()) {
      // No pin and no scrub: the section collapses to its first frame and the
      // beat copy below carries the story instead.
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: "top top",
      // Roughly one viewport of scroll per beat: long enough to read each one,
      // short enough that it never feels like the page is holding you hostage.
      end: () => `+=${window.innerHeight * BEATS.length * 0.85}`,
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        paint(self.progress);
        onProgress?.(self.progress);
      },
    });

    return () => st.kill();
  }, [onProgress]);

  return (
    <div
      ref={wrapRef}
      className={`relative h-svh w-full overflow-hidden bg-bg ${className ?? ""}`}
    >
      {BEATS.map((beat, i) => (
        <div
          key={beat.id}
          ref={(el) => {
            layerRefs.current[i] = el;
          }}
          aria-hidden
          className="absolute inset-0 will-change-transform"
          style={{
            opacity: 0,
            backgroundColor: beat.tint,
            backgroundImage: present.has(beat.photo)
              ? `url(${photoPath(beat)})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}

      {/* Scrim: guarantees the overlaid copy has contrast whatever photograph
          ends up underneath it, including a bright one. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(8,7,6,0.92) 0%, rgba(8,7,6,0.45) 42%, rgba(8,7,6,0.15) 70%, rgba(8,7,6,0.35) 100%)",
        }}
      />

      {children}
    </div>
  );
}
