"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { onScroll } from "@/lib/scroll";

/**
 * The floating top bar.
 *
 * It sits over the hero rather than above it — an inset, rounded plate of
 * frosted glass, so the footage keeps running underneath. The "liquid glass"
 * read comes from three stacked layers, not from one blur: a backdrop filter
 * that blurs and over-saturates what's behind, a soft vertical tint on top of
 * that, and a hairline highlight along the upper edge that suggests a refracted
 * bevel. Blur alone reads as fog; the highlight is what makes it read as glass.
 *
 * Past the fold the plate firms up — more tint, a real shadow — because the
 * paper ground below gives it nothing to sit against.
 */
const LINKS = [
  { href: "#origins", label: "Origins" },
  { href: "#quality", label: "Quality" },
  { href: "#logistics", label: "Logistics" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

/** How far past the top the bar starts reacting at all. */
const SETTLE = 24;
/** Slack before a direction change counts, so a trackpad jitter can't flicker it. */
const THRESHOLD = 8;
/** Approximate lower edge of the floating plate, in px from the viewport top. */
const NAV_BOTTOM = 72;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  /** True while the plate is over the journey cinematic's dark ground. */
  const [onDark, setOnDark] = useState(false);
  const lastY = useRef(0);

  /**
   * Hide on the way down, return on the way up.
   *
   * Reading direction rather than absolute position is the whole point: someone
   * scrolling down is reading and wants the page, someone scrolling up is
   * usually reaching for navigation — so the bar comes back on the first
   * upward pixel rather than waiting to reach the top.
   */
  useEffect(() =>
    onScroll((y) => {
      const delta = y - lastY.current;

      setScrolled(y > SETTLE);

      /**
       * Invert the palette while the plate crosses the journey section.
       *
       * That section redefines every colour token for its own subtree because
       * it carries full-bleed graded photography; the bar floats above it in
       * the page's light palette and, left alone, drags a scrap of daylight
       * across the cinematic. Flipping it as it enters makes the chrome look
       * like it is passing *through* the film rather than sitting on top of it.
       *
       * Measured against the section's live rect rather than a stored offset:
       * the journey is GSAP-pinned, so the document height around it changes
       * while you are scrolling through it.
       */
      const dark = document.getElementById("journey")?.getBoundingClientRect();
      // NAV_BOTTOM is roughly where the plate ends; the swap should happen when
      // the bar is genuinely over the dark ground, not when it merely touches.
      setOnDark(!!dark && dark.top <= NAV_BOTTOM && dark.bottom >= NAV_BOTTOM);

      if (Math.abs(delta) > THRESHOLD) {
        // Never hide over the hero; there's nothing to gain from it there.
        setHidden(delta > 0 && y > 240);
        lastY.current = y;
      }
    }),
  []);

  // A hidden bar must not take the open sheet offscreen with it.
  useEffect(() => {
    if (open) setHidden(false);
  }, [open]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-transform duration-[var(--dur-base)] [transition-timing-function:var(--ease)] sm:px-6 sm:pt-5"
      style={{ transform: hidden ? "translateY(-140%)" : "translateY(0)" }}
    >
      <header
        className={[
          "pointer-events-auto relative mx-auto flex w-full max-w-3xl items-center justify-between",
          "overflow-hidden rounded-full",
          "px-4 py-2 sm:px-5 sm:py-2.5",
          "border",
          "backdrop-blur-xl backdrop-saturate-150",
          "transition-[background-color,box-shadow,border-color,color] duration-[var(--dur-base)]",
          "[transition-timing-function:var(--ease)]",
          // Palette only — the glass, the blur and the bevel are unchanged, so
          // the plate keeps its material and only its ink flips.
          onDark ? "tokens-dark border-white/15" : "border-white/20",
          scrolled
            ? "bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] shadow-[0_10px_30px_-14px_rgba(23,18,13,0.45)]"
            : "bg-[color-mix(in_srgb,var(--surface)_22%,transparent)] shadow-[0_6px_24px_-16px_rgba(23,18,13,0.3)]",
        ].join(" ")}
      >
        {/* Layer 2: the tint. A top-lit gradient, so the plate has a light
            source rather than a flat wash. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.12) 100%)",
          }}
        />
        {/* Layer 3: the bevel. One hairline of light across the top edge. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 -z-10 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
          }}
        />

        <Link
          href="#top"
          className="font-display shrink-0 text-base tracking-tight text-fg transition-colors duration-[var(--dur-base)] [transition-timing-function:var(--ease)]"
        >
          Vera Coffee<span className="text-accent">.</span>
        </Link>

        <nav className="hidden gap-7 text-sm text-muted md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="link-wipe transition-colors duration-[var(--dur-fast)] hover:text-fg"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="-mr-1 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-fg md:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            {open ? (
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 5.5h12M3 12.5h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </header>

      {/* The mobile sheet is a second plate rather than an expansion of the
          first, so the bar keeps its pill silhouette while open. */}
      {open && (
        <div
          className={[
            "pointer-events-auto mx-auto mt-2 w-full max-w-3xl overflow-hidden rounded-2xl md:hidden",
            // The sheet is a second plate, so it inverts with the first.
            onDark ? "tokens-dark" : "",
            "border border-white/25 backdrop-blur-xl backdrop-saturate-150",
            "bg-[color-mix(in_srgb,var(--surface)_78%,transparent)]",
            "shadow-[0_8px_32px_-8px_rgba(23,18,13,0.28)]",
          ].join(" ")}
        >
          <nav className="flex flex-col p-2 text-sm text-muted">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3.5 hover:bg-white/25 hover:text-fg"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
