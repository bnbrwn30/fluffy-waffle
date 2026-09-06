"use client";

import { useEffect, useRef, useState } from "react";
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
  const ref = useRef<HTMLVideoElement>(null);

  // Resolved after mount: the server has no matchMedia, and guessing wrong
  // would flash the wrong layer.
  useEffect(() => setStill(prefersReducedMotion()), []);

  useEffect(() => {
    const el = ref.current;
    if (!el || still) return;

    // React sets `muted` as an attribute but not always as the property, and
    // iOS decides autoplay eligibility from the property. Without this the
    // first play() is rejected on every iPhone.
    el.muted = true;
    el.defaultMuted = true;

    // Low Power Mode and Data Saver reject the initial play(). Fall back to
    // the poster until the first touch, then let it run.
    const play = () => el.play().catch(() => {});
    play();

    const events = ["touchstart", "pointerdown", "scroll"] as const;
    const retry = () => {
      play();
      events.forEach((e) => window.removeEventListener(e, retry));
    };
    events.forEach((e) =>
      window.addEventListener(e, retry, { once: true, passive: true }),
    );

    // iOS pauses backgrounded video and does not resume it on return.
    const onVisible = () => {
      if (!document.hidden && el.currentTime < el.duration) play();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      events.forEach((e) => window.removeEventListener(e, retry));
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [still]);

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
      ref={ref}
      autoPlay
      muted
      playsInline
      // iOS needs the bytes in hand to start on its own; `metadata` leaves it
      // sitting on the poster.
      preload="auto"
      poster="/video/green-beans-poster.jpg"
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
    >
      {/* MP4 first: Safari's WebM support is partial and it will not fall
          back once it has committed to a source. */}
      <source src="/video/green-beans.mp4" type="video/mp4" />
      <source src="/video/green-beans.webm" type="video/webm" />
    </video>
  );
}
