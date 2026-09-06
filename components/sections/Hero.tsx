"use client";

import { motion } from "motion/react";
import Button from "@/components/ui/Button";
import HeroVideo from "@/components/ui/HeroVideo";
import { RevealLines } from "@/components/ui/Reveal";
import { DUR, EASE, STAGGER } from "@/lib/motion";

/**
 * Above the fold, a buyer gets the claim, the facts and the CTA in plain text.
 * The cinematic below rewards scrolling; it never holds information hostage.
 * Someone who lands, reads three lines and requests a sample in nine seconds
 * is a win, not a failure.
 */
const FACTS = [
  { k: "Origins", v: "Yirgacheffe · Sidamo · Guji · Harrar" },
  { k: "Grades", v: "G1 – G5, screen 14 – 18" },
  { k: "Terms", v: "FOB Djibouti · CIF on request" },
  { k: "Minimum", v: "One 20ft container, 19.2 MT" },
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden bg-bg"
    >
      <HeroVideo />

      {/* Paper scrim: keeps the headline legible where it crosses the plate,
          and fades out to the right so the footage is never boxed in. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(75% 65% at 18% 45%, var(--bg) 0%, color-mix(in srgb, var(--bg) 78%, transparent) 52%, transparent 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-32 pb-14 sm:px-10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.base, ease: EASE }}
          className="kicker"
        >
          Green coffee · Ethiopia
        </motion.p>

        <h1 className="font-display mt-5 max-w-4xl text-[2.6rem] leading-[0.98] text-fg sm:text-6xl lg:text-7xl">
          <RevealLines
            immediate
            lines={["Specialty green coffee,", "exported from Ethiopia."]}
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.slow, ease: EASE, delay: STAGGER.loose * 3 }}
          className="mt-6 max-w-lg text-base leading-relaxed text-muted"
        >
          We buy from washing stations in Yirgacheffe, Sidamo, Guji and
          Harrar, mill and grade in Addis Ababa, and ship out of Djibouti. Each
          lot stays traceable to the station it came from.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.slow, ease: EASE, delay: STAGGER.loose * 4 }}
          className="mt-9 flex flex-wrap gap-3"
        >
          <Button href="#contact">Request a sample</Button>
          <Button href="#origins" variant="ghost">
            See the origins
          </Button>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.slow, ease: EASE, delay: STAGGER.loose * 5 }}
          className="mt-14 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8 lg:grid-cols-4"
        >
          {FACTS.map((f) => (
            <div key={f.k}>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-faint">
                {f.k}
              </dt>
              <dd className="mt-1.5 text-sm text-fg">{f.v}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
