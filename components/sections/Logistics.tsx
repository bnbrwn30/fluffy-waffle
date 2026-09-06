import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";

/** All figures VERIFY — these are typical, not quoted. */
/* A representative spread of lanes, not the whole schedule — the rest is a
   conversation, not a wall of rows. */
const ROUTES = [
  { port: "Jeddah", days: 9 },
  { port: "Hamburg", days: 21 },
  { port: "Rotterdam", days: 28 },
  { port: "New York", days: 34 },
];

const TERMS = [
  { k: "Incoterms", v: "FOB Djibouti · CIF · FCA Addis Ababa" },
  { k: "Container", v: "19.2 MT — 320 × 60 kg jute" },
  { k: "Packing", v: "60 kg jute, GrainPro liner on request" },
  { k: "Payment", v: "L/C at sight · CAD" },
];

export default function Logistics() {
  return (
    <section
      id="logistics"
      aria-labelledby="logistics-heading"
      className="relative border-t border-line bg-bg py-16 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <Reveal>
          <p className="kicker">Getting it to you</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2
            id="logistics-heading"
            className="font-display mt-4 max-w-2xl text-[clamp(1.75rem,7vw,2rem)] leading-[1.08] text-balance text-fg sm:mt-5 sm:text-4xl sm:leading-[1.05] lg:text-5xl"
          >
            Addis to Djibouti to your warehouse.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-muted sm:mt-7 sm:text-base">
            Milled and graded in Addis Ababa, trucked down the Djibouti
            corridor, sealed at the port. We handle everything up to the ship's
            rail and the paperwork that follows it.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-12 sm:mt-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.14em] text-faint">
              Transit time from Djibouti
            </h3>
            <ul className="mt-6 space-y-px">
              {ROUTES.map((r, i) => (
                <Reveal as="li" key={r.port} delay={i * 0.05}>
                  <div className="flex items-center gap-3 border-b border-line py-3.5 sm:gap-5">
                    <span className="w-[5.5rem] shrink-0 text-sm text-fg sm:w-28">
                      {r.port}
                    </span>
                    {/* The bar is a full-width track with a proportional fill
                        inside it, not a bare percentage-width element. As a
                        flex item that element shrinks under pressure, and on a
                        phone every lane ended up the same length — which is
                        exactly the comparison the row exists to make. */}
                    <span className="relative h-px flex-1" aria-hidden>
                      <span
                        className="absolute inset-y-0 left-0 bg-accent-solid/60"
                        style={{ width: `${(r.days / 34) * 100}%` }}
                      />
                    </span>
                    <span className="nums shrink-0 text-sm text-muted">
                      <CountUp to={r.days} suffix=" days" />
                    </span>
                  </div>
                </Reveal>
              ))}
            </ul>
            <p className="mt-4 text-xs text-faint">
              Typical port-to-port sailing time — it moves with the service and
              the sailing week.
            </p>
          </div>

          <dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {TERMS.map((t, i) => (
              <Reveal key={t.k} delay={i * 0.05}>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-faint">
                  {t.k}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-fg">{t.v}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
