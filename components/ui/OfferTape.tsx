import { ORIGINS } from "@/lib/origins";

/**
 * A tape of what we sell, running across the page like a trading board.
 *
 * It earns its place by being true rather than by moving: every item is built
 * from lib/origins.ts, so the regions, cup bands and ECX grades on the tape are
 * the same figures the Origins cards show. Deliberately NOT prices, positions
 * or spot/afloat status — a tape that implies live market data it does not have
 * is the kind of thing a green buyer notices immediately, and the credibility
 * cost would be far higher than the decorative gain.
 *
 * A server component: no state, no effects, no client JavaScript. The scroll is
 * one CSS keyframe.
 *
 * The loop is seamless because the list is rendered twice inside a track that
 * travels exactly -50%. When the first copy has fully exited, the second sits
 * precisely where the first began, so the animation restarting is invisible.
 * The duplicate is aria-hidden — it is the same sentence again, and a screen
 * reader should hear the offer once.
 */
export default function OfferTape() {
  const items = ORIGINS.map(
    (o) =>
      `${o.name} · ${o.processes[0]} · ${o.cupScore[0]}–${o.cupScore[1]} SCA · ${o.grades.join(
        " ",
      )}`,
  );

  return (
    <section
      aria-label="Regions we are offering"
      // `tape` is the hover target that pauses the track. group/tape rather
      // than a bare group so a future nested group cannot capture it.
      className="tape group/tape relative overflow-hidden border-y border-line bg-surface py-3 sm:py-3.5"
    >
      {/* Feathered ends, so the type dissolves into the paper instead of being
          chopped off by the section edge. Two gradients rather than a mask, to
          keep the compositing cheap. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-24"
        style={{
          background: "linear-gradient(to right, var(--surface), transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-24"
        style={{
          background: "linear-gradient(to left, var(--surface), transparent)",
        }}
      />

      <div className="tape-track flex w-max items-center">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center"
            aria-hidden={copy === 1 || undefined}
          >
            {items.map((text) => (
              <span key={text} className="flex shrink-0 items-center">
                <span className="nums px-5 text-[11px] tracking-[0.14em] text-muted uppercase sm:px-7 sm:text-xs">
                  {text}
                </span>
                {/* The separator is the accent, so the tape carries a pulse of
                    colour without the type having to shout. */}
                <span aria-hidden className="text-accent-solid">
                  ◆
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
