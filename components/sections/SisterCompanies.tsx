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
    src: "/img/sister/diredawa-food-complex.jpg",
  },
  {
    name: "Ali Investment Group",
    line: "Holding & investment",
    src: "/img/sister/ali-investment-group.jpg",
  },
  {
    name: "Karamara Trading PLC",
    line: "Trading & distribution",
    src: "/img/sister/karamara-trading.jpg",
  },
  {
    name: "Ali Steel Manufacturing",
    line: "Steel fabrication",
    src: "/img/sister/ali-steel-manufacturing.jpg",
  },
];

export default function SisterCompanies() {
  return (
    <section
      id="sister-companies"
      aria-labelledby="sister-heading"
      className="relative border-t border-line bg-bg py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 text-center sm:px-10">
        <Reveal>
          <p className="kicker">The wider group</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2
            id="sister-heading"
            className="font-display mx-auto mt-5 max-w-2xl text-3xl leading-[1.05] text-fg sm:text-5xl"
          >
            Sister companies.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-muted">
            Vera is part of a group with operations in food processing,
            trading, steel and investment. It is the same ownership and the
            same finance behind every contract we sign.
          </p>
        </Reveal>

        <ul className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {COMPANIES.map((c, i) => (
            <Reveal as="li" key={c.name} delay={i * 0.06}>
              <div className="flex h-full flex-col items-center gap-5">
                <div className="flex h-44 w-full items-center justify-center rounded-sm border border-line bg-white px-6 py-5 sm:h-48">
                  {/* Plain img, eagerly loaded: the page scrolls inside a
                      transformed smooth-scroll wrapper, which keeps next/image's
                      lazy observer from ever firing for this section. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.src}
                    alt={c.name}
                    loading="eager"
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
