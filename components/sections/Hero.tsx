import Button from "@/components/ui/Button";
import HeroVideo from "@/components/ui/HeroVideo";

/**
 * A server component with no client JavaScript of its own. The entrance runs
 * on CSS keyframes (see `.enter-*` in globals.css) rather than through the
 * motion library, because a motion component serialises its `initial` values
 * into the HTML: the whole hero used to ship invisible and stay that way until
 * hydration finished. Now it paints and animates straight off the stylesheet.
 *
 * Above the fold, a buyer gets the claim, the facts and the CTA in plain text.
 * The cinematic below rewards scrolling; it never holds information hostage.
 * Someone who lands, reads three lines and requests a sample in nine seconds
 * is a win, not a failure.
 */
const FACTS = [
  { k: "Origins", v: "Yirgacheffe · Sidamo · Guji · Jimma" },
  { k: "Grades", v: "G1 – G5, screen 14 – 18" },
  { k: "Terms", v: "FOB Djibouti · CIF on request" },
  { k: "Minimum", v: "One 20ft container, 19.2 MT" },
];

export default function Hero() {
  return (
    <section
      id="top"
      // Not a full `min-h-svh` on a phone. The copy block runs ~640px, so a
      // 956px hero left 250px of flex slack above it that the footage could
      // not fill: 1280x720 landscape object-cover'd into a 440-wide portrait
      // box scales to 1700px wide and shows a quarter of the frame at 1.33x,
      // which reads as a pale smear rather than coffee. Trimming the height
      // turns that band into a deliberate cinematic edge and tightens the crop
      // at the same time. Desktop is landscape-on-landscape and keeps the
      // full viewport.
      className="relative isolate flex min-h-[84svh] flex-col justify-end overflow-hidden bg-bg sm:min-h-svh"
    >
      <HeroVideo />

      {/* Paper scrim: keeps the headline legible where it crosses the plate,
          and fades out to the right so the footage is never boxed in. */}
      {/* Two scrims, one per aspect. The radial plate works on a wide screen,
          where the copy occupies the left third and the footage stays clear to
          the right. On a phone the copy runs the full width and the whole lower
          half needs lifting, so that shape reverses to a vertical wash. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 sm:hidden"
        style={{
          background:
            // Stops pushed up to match the shorter hero. Tuned for 956px, the
            // wash was still 46% opaque three quarters of the way up — which
            // is the one band with no copy in it to protect, so it veiled the
            // footage for nothing. It now clears above the headline.
            //
            // Thinned across the board so the plate shows through: the base
            // stays fully opaque only at the very bottom edge, where the facts
            // grid sits on small type, and drops away faster above it.
            "linear-gradient(to top, var(--bg) 0%, color-mix(in srgb, var(--bg) 72%, transparent) 40%, color-mix(in srgb, var(--bg) 44%, transparent) 62%, color-mix(in srgb, var(--bg) 16%, transparent) 84%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 max-sm:hidden"
        style={{
          background:
            "radial-gradient(75% 65% at 18% 45%, var(--bg) 0%, color-mix(in srgb, var(--bg) 78%, transparent) 52%, transparent 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-24 pb-9 sm:px-10 sm:pt-32 sm:pb-14">
        <p className="kicker enter-fade">Green coffee · Ethiopia</p>

        <h1 className="font-display mt-4 max-w-4xl text-[clamp(1.55rem,7.1vw,2.6rem)] leading-[1.02] text-fg sm:mt-5 sm:text-6xl sm:leading-[0.98] lg:text-7xl">
          {["Specialty green coffee,", "exported from Ethiopia."].map(
            (line, i) => (
              // The mask carries no animation; the line slides up inside it.
              // Extra bottom padding keeps descenders off the mask edge.
              <span key={line} className="block overflow-hidden pb-[0.12em]">
                <span
                  className={`enter-line block will-change-transform ${
                    i === 1 ? "enter-d1" : ""
                  }`}
                >
                  {line}
                </span>
              </span>
            ),
          )}
        </h1>

        <p
          className="enter-rise enter-d3 mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-muted sm:mt-6 sm:text-base"
        >
          We buy from washing stations in Yirgacheffe, Sidamo, Guji and
          Jimma, mill and grade in Addis Ababa, and ship out of Djibouti. Each
          lot stays traceable to the station it came from.
        </p>

        <div
          className="enter-rise enter-d4 mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap sm:mt-9"
        >
          <Button href="#contact">Request a sample</Button>
          <Button href="#origins" variant="ghost">
            See the origins
          </Button>
        </div>

        <dl
          className="enter-fade enter-d5 mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-7 sm:mt-14 sm:gap-x-8 sm:gap-y-6 sm:pt-8 lg:grid-cols-4"
        >
          {FACTS.map((f) => (
            <div key={f.k}>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-faint">
                {f.k}
              </dt>
              <dd className="mt-1.5 text-sm text-fg">{f.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
