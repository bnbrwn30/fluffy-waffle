/**
 * A fixed film grain sheet over the whole page.
 *
 * This is doing more work than it looks like: the cinematic frames are dark
 * and heavily graded, and without grain the flat CSS sections beside them read
 * as a different medium. Grain ties the rendered and the built halves of the
 * page into one image.
 *
 * Inline SVG turbulence rather than a PNG — no network request, no cache miss,
 * and it scales to any DPR for free.
 */
export default function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] mix-blend-overlay"
      style={{
        // Grain intensifies with scroll speed, the way film does when a camera
        // is pushed. It is the cheapest way to make the whole page feel like it
        // has weight: the reader never sees the grain change, they feel the
        // page resist. --vel-abs is written per frame by SmoothScroll and is 0
        // both at rest and under reduced motion, where this is simply the flat
        // 0.045 sheet it has always been.
        opacity: "calc(0.045 + var(--vel-abs, 0) * 0.05)",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}
