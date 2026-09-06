import Reveal, { RevealLines } from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";

/**
 * States the origin claim in plain language before the cinematic dramatises it.
 * A buyer skimming on a phone should get the whole argument from this section
 * alone, without ever triggering the pinned scroll.
 */
const PILLARS = [
  {
    n: 6000,
    suffix: "+",
    label: "heirloom varietals",
    body:
      "Ethiopian coffee was never narrowed down to a handful of commercial " +
      "cultivars the way it was elsewhere, so the range of cup profiles a " +
      "buyer can find here is unusually wide.",
  },
  {
    n: 100,
    suffix: "%",
    label: "of commercial arabica descends from here",
    body:
      "Arabica grown in Brazil, Colombia and Vietnam traces back to Ethiopian " +
      "stock — a narrow selection of it. Buying here means buying out of the " +
      "population those selections came from.",
  },
  {
    n: 2300,
    suffix: " m",
    label: "top of our altitude band",
    body:
      "Cold nights at altitude slow the cherry down. The bean ends up denser " +
      "and the acidity more pronounced, which is much of what separates a " +
      "specialty lot from a commercial one.",
  },
];

export default function Forest() {
  return (
    <section
      id="forest"
      aria-labelledby="forest-heading"
      className="relative border-t border-line bg-bg py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        {/* Headline and lede sit side by side once there is room for both.
            Stacked, the full-width column left a band of dead paper to the
            right of a three-line headline; paired, the whitespace reads as
            an editorial measure instead of a gap. */}
        <div className="grid items-end gap-x-16 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="kicker">The origin</p>
            </Reveal>

            <h2
              id="forest-heading"
              className="font-display mt-4 text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.04] text-balance text-fg"
            >
              <RevealLines
                lines={["Coffee is native to", "Ethiopia, and still", "grows wild here."]}
              />
            </h2>
          </div>

          <Reveal delay={0.1} className="lg:col-span-5">
            <p className="max-w-prose border-l border-line pl-6 text-[0.9375rem] leading-relaxed text-muted sm:text-base">
              In Kaffa and parts of Guji, coffee still grows semi-wild under
              forest canopy rather than in planted rows. That mix of forest,
              garden and estate production is part of why lots from neighbouring
              districts can cup so differently from one another.
            </p>
          </Reveal>
        </div>

        <dl className="mt-14 grid gap-x-10 gap-y-10 border-t border-line pt-10 sm:mt-16 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal
              key={p.label}
              delay={i * 0.08}
              className="md:not-first:border-l md:not-first:border-line md:not-first:pl-10"
            >
              <dt className="font-display nums text-[clamp(2.25rem,3.4vw,3rem)] leading-none text-accent">
                <CountUp to={p.n} suffix={p.suffix} />
              </dt>
              <dd className="mt-4">
                <p className="text-sm font-medium tracking-tight text-fg">
                  {p.label}
                </p>
                <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-faint">
                  {p.body}
                </p>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
