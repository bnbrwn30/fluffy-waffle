import Reveal from "@/components/ui/Reveal";

/**
 * Supplied artwork, each already carrying its own wordmark — so the card shows
 * the logo and a sector line only, and the company name lives in the alt text
 * rather than being set twice. All four come on white grounds, hence the white
 * plate: cropping them onto the cream would mean retouching someone's logo.
 */
const COMPANIES = [
  {
    name: "Dire Dawa Food Complex",
    line: "Food processing",
    src: "/img/sister/diredawa-food-complex.webp",
  },
  {
    name: "Ali Investment Group",
    line: "Holding & investment",
    src: "/img/sister/ali-investment-group.webp",
  },
  {
    name: "Karamara Trading PLC",
    line: "Trading & distribution",
    src: "/img/sister/karamara-trading.webp",
  },
  {
    name: "Ali Steel Manufacturing",
    line: "Steel fabrication",
    src: "/img/sister/ali-steel-manufacturing.webp",
  },
];

export default function SisterCompanies() {
  return (
    <section
      id="sister-companies"
      aria-labelledby="sister-heading"
      className="relative border-t border-line bg-bg py-16 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-10">
        <Reveal>
          <p className="kicker">The wider group</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2
            id="sister-heading"
            className="font-display mx-auto mt-4 max-w-2xl text-[clamp(1.75rem,7vw,2rem)] leading-[1.08] text-fg sm:mt-5 sm:text-4xl sm:leading-[1.05] lg:text-5xl"
          >
            Sister companies.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-muted sm:mt-7 sm:text-base">
            Vera is part of a group with operations in food processing,
            trading, steel and investment. It is the same ownership and the
            same finance behind every contract we sign.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-6 xs:grid-cols-2 sm:mt-16 sm:gap-8 lg:grid-cols-4">
          {COMPANIES.map((c, i) => (
            <Reveal as="li" key={c.name} delay={i * 0.06}>
              <div className="flex h-full flex-col items-center gap-4 sm:gap-5">
                <div className="flex h-32 w-full items-center justify-center rounded-sm border border-line bg-white px-5 py-4 xs:h-36 sm:h-48 sm:px-6 sm:py-5">
                  {/* Plain img rather than next/image: these are already
                      hand-sized webp logos, so the optimizer has nothing left
                      to take off them and would only add a round trip.

                      Lazy, deliberately. Lenis scrolls the window natively —
                      there is no transformed wrapper — so native lazy loading
                      fires correctly here. Eager loading made React hoist a
                      <link rel="preload"> for all four into the document head,
                      which put logos from the bottom of the page in front of
                      the hero on a cold visit. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.src}
                    alt={c.name}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-faint">
                  {c.line}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
