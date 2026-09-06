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
      className="relative border-t border-line bg-bg py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <Reveal>
          <p className="kicker">Getting it to you</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2
            id="logistics-heading"
            className="font-display mt-5 max-w-2xl text-3xl leading-[1.05] text-fg sm:text-5xl"
          >
            Addis to Djibouti to your warehouse.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted">
            Milled and graded in Addis Ababa, trucked down the Djibouti
            corridor, sealed at the port. We handle everything up to the ship's
            rail and the paperwork that follows it.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.14em] text-faint">
              Transit time from Djibouti
            </h3>
            <ul className="mt-6 space-y-px">
              {ROUTES.map((r, i) => (
                <Reveal as="li" key={r.port} delay={i * 0.05}>
                  <div className="flex items-center gap-5 border-b border-line py-3.5">
                    <span className="w-28 shrink-0 text-sm text-fg">{r.port}</span>
                    <span
                      className="h-px bg-accent-solid/60"
                      style={{ width: `${(r.days / 34) * 100}%` }}
                      aria-hidden
                    />
                    <span className="nums ml-auto shrink-0 text-sm text-muted">
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
