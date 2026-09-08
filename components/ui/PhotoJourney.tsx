"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BEATS, photoPath } from "@/lib/journey";
import { prefersReducedMotion } from "@/lib/motion";
import { velocity } from "@/lib/scroll";

/**
 * The scroll centrepiece: four photographs cross-dissolving under a slow push,
 * scrubbed by scroll position inside a pinned section.
 *
 * Opacity and transform are written straight to the DOM on each scroll update
 * rather than through React state. Four layers re-rendering at scroll frequency
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

  /**
   * Photographs are held back until the section is roughly a screen away.
   *
   * These four frames are the heaviest thing on the page. As inline
   * `background-image` on server-rendered markup the preload scanner found all
   * four in the first HTML chunk and fetched them immediately — three quarters
   * of a megabyte racing the hero for bandwidth, for imagery nobody sees until
   * they have scrolled past two full sections. The tints render meanwhile, and
   * a decode that starts one viewport out is comfortably done by the time the
   * pin engages.
   */
  const [loadPhotos, setLoadPhotos] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadPhotos(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    /**
     * The pinned frame is sized to the LARGEST viewport, in pixels, rather
     * than left to `h-svh`.
     *
     * `svh` is the SMALLEST viewport height — the one with the mobile toolbar
     * showing — and ScrollTrigger freezes whatever it measures at pin time into
     * an inline height. So once the toolbar collapses the frame stops reaching
     * the bottom of the screen and the page's own dark ground shows through as
     * a band under the photograph.
     *
     * Tracking `innerHeight` live is not enough either: scrolling up on a
     * phone grows the viewport without reliably firing a `resize`, so the
     * frame keeps the short measurement and the band comes back. Sizing to
     * `lvh` — the toolbar-hidden height — means the frame is never too short in
     * any toolbar state; it is only ever too tall by the toolbar's own height,
     * and `overflow-hidden` swallows that. The copy is then held off that
     * hidden strip by `--jv-inset` so it stays on screen either way. The
     * trigger itself is deliberately not refreshed (see `ignoreMobileResize`
     * below), so the pin never jumps.
     */
    let tallest = window.innerHeight;
    /** `100lvh` in pixels, measured off a probe so it survives inline sizing. */
    const measureLvh = () => {
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:absolute;top:0;left:0;width:0;height:100lvh;pointer-events:none;visibility:hidden";
      document.body.appendChild(probe);
      const h = probe.getBoundingClientRect().height;
      probe.remove();
      // Older engines without `lvh` measure 0; the tallest height we have seen
      // is the best stand-in for the toolbar-hidden one.
      return h > 0 ? h : tallest;
    };

    /** Frame height in px. Only a real resize can change it. */
    let frame = 0;

    /**
     * How much of the frame the toolbar is currently covering, for the copy to
     * sit above. Cheap enough to run on every scroll: one `innerHeight` read
     * and, only when the number actually changed, one custom-property write.
     */
    let inset = -1;
    const fitInset = () => {
      const next = Math.max(0, Math.round(frame - window.innerHeight));
      if (next === inset) return;
      inset = next;
      wrap.style.setProperty("--jv-inset", `${next}px`);
    };

    const fitViewport = () => {
      tallest = Math.max(tallest, window.innerHeight);
      frame = Math.max(measureLvh(), tallest);
      // `maxHeight` as well as `height`: pinning writes the measured height
      // into BOTH, and the max-height alone is enough to keep the frame short.
      wrap.style.height = `${frame}px`;
      wrap.style.maxHeight = `${frame}px`;
      fitInset();
    };
    // Once now and once after the frame settles — ScrollTrigger's own resize
    // handler is registered after this one and re-stamps the old measurement.
    const refit = () => {
      fitViewport();
      requestAnimationFrame(fitViewport);
    };
    fitViewport();
    window.addEventListener("resize", refit);
    window.visualViewport?.addEventListener("resize", refit);
    // The toolbar slides away mid-scroll without firing either resize event on
    // some engines, so keep the inset honest as the page moves too. The frame
    // itself is left alone here — it is already tall enough for every toolbar
    // state, and re-measuring it per scroll would cost a layout a frame.
    window.addEventListener("scroll", fitInset, { passive: true });

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
        // the whole section reads as one move rather than four separate ones.
        const local = (p - i / n) * n;
        const scale = 1.1 - Math.min(Math.max(local, -0.4), 1.4) * 0.07;

        // Velocity lean: a hard flick pushes the frame in a little further,
        // and it settles back as the glide decays. Read from the scroll module
        // rather than from React state — this runs at scroll frequency, and
        // re-rendering four layers a frame to move a scale by two per cent is
        // precisely the cost this component was built to avoid. Direction is
        // deliberately ignored: the push should read as pressure, not as the
        // image sliding with the wheel.
        const lean = 1 + Math.abs(velocity()) * 0.022;

        el.style.opacity = String(o);
        el.style.transform = `scale(${(scale * lean).toFixed(4)})`;
        // Fully transparent layers stop costing compositing work.
        el.style.visibility = o <= 0.001 ? "hidden" : "visible";
      });
    };

    paint(0);
    onProgress?.(0);

    if (prefersReducedMotion()) {
      // No pin and no scrub: the section collapses to its first frame and the
      // beat copy below carries the story instead.
      return () => {
        window.removeEventListener("resize", refit);
        window.visualViewport?.removeEventListener("resize", refit);
        window.removeEventListener("scroll", fitInset);
      };
    }

    gsap.registerPlugin(ScrollTrigger);

    // Mobile browsers resize the viewport as their address bar hides and
    // shows. Left alone, every one of those resizes refreshes the trigger and
    // the pinned section jumps under the reader's thumb — so ignore height-only
    // resizes on touch devices.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: "top top",
      // Roughly one viewport of scroll per beat: long enough to read each one,
      // short enough that it never feels like the page is holding you hostage.
      // Shorter per-beat travel on a phone: the same 0.85 viewports per beat
      // is a great deal more thumb-work on a 400px-tall scroll than it is on a
      // desktop wheel, and the copy is read long before the beat ends.
      end: () =>
        `+=${window.innerHeight * BEATS.length * (window.innerWidth < 640 ? 0.62 : 0.85)}`,
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        paint(self.progress);
        onProgress?.(self.progress);
      },
    });

    return () => {
      st.kill();
      window.removeEventListener("resize", refit);
      window.visualViewport?.removeEventListener("resize", refit);
      window.removeEventListener("scroll", fitInset);
    };
  }, [onProgress]);

  return (
    <div
      ref={wrapRef}
      className={`relative h-lvh w-full overflow-hidden bg-bg ${className ?? ""}`}
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
            backgroundImage:
              loadPhotos && present.has(beat.photo)
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
