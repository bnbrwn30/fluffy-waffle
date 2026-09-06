"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * The hero backdrop: a macro plate of unroasted beans, drifting slowly.
 * It carries no information — the headline and CTA sit above it and say
 * everything — so it stays muted, decorative and cheap to skip.
 *
 * It plays once and holds on its last frame. A backdrop that restarts every
 * few seconds pulls the eye back to itself while someone is trying to read
 * the headline; a single settling move does not. Refreshing replays it.
 *
 * Reduced motion gets the poster frame and no video element at all, which
 * also spares the download rather than merely pausing it.
 */
export default function HeroVideo() {
  const [still, setStill] = useState(false);

  // Resolved after mount: the server has no matchMedia, and guessing wrong
  // would flash the wrong layer.
  useEffect(() => setStill(prefersReducedMotion()), []);

  if (still) {
    return (
      <img
        src="/video/green-beans-poster.jpg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
      />
    );
  }

  return (
    <video
      autoPlay
      muted
      playsInline
      preload="metadata"
      poster="/video/green-beans-poster.jpg"
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
    >
      <source src="/video/green-beans.webm" type="video/webm" />
      <source src="/video/green-beans.mp4" type="video/mp4" />
    </video>
  );
}
