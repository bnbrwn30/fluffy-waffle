/**
 * A single scroll signal for the whole site.
 *
 * Lenis interpolates the scroll position itself and — depending on how it is
 * driving the page — the browser's own `scroll` event is not a reliable hook
 * here. So Lenis publishes to this tiny emitter and any component that needs
 * to react to scrolling subscribes to it, rather than each one guessing at
 * which listener happens to fire.
 */
type Listener = (y: number) => void;

const listeners = new Set<Listener>();
let lastY = 0;

/** Called by SmoothScroll on every Lenis frame. */
export function publishScroll(y: number) {
  lastY = y;
  for (const l of listeners) l(y);
}

/** Subscribe; returns the unsubscribe. Fires once immediately with the current position. */
export function onScroll(listener: Listener): () => void {
  listeners.add(listener);
  listener(lastY);
  return () => listeners.delete(listener);
}

/* --- Scroll velocity ------------------------------------------------------
 *
 * How *fast* the page is moving, normalised to roughly -1…1 and smoothed, so
 * anything on the page can lean into the scroll instead of merely responding
 * to its position. This is the difference between a site that animates and one
 * that feels physical: a fast flick should visibly cost something.
 *
 * Kept as module state rather than React state on purpose — it changes every
 * frame, and re-rendering the tree sixty times a second to move a scale by two
 * per cent is how a smooth page stops being smooth. Consumers either read it
 * inside their own rAF loop (see PhotoJourney) or let CSS read the `--vel`
 * custom property that SmoothScroll mirrors it into.
 */
let vel = 0;

/** Called by SmoothScroll once per frame with the already-smoothed value. */
export function publishVelocity(v: number) {
  vel = v;
}

/** Signed, smoothed, clamped to -1…1. Positive is downward. */
export function velocity(): number {
  return vel;
}

/**
 * The live Lenis instance, registered by SmoothScroll.
 *
 * Anchor navigation has to cooperate with whatever owns the scroll position,
 * so it goes through here rather than through the browser.
 */
type Scroller = {
  scrollTo: (target: number, opts?: Record<string, unknown>) => void;
  stop: () => void;
  start: () => void;
};

let scroller: Scroller | null = null;

export function registerScroller(s: Scroller | null) {
  scroller = s;
}

/** Clearance for the floating nav plate, so a target never lands under it. */
export const SCROLL_OFFSET = 96;

/** Long enough to read as a glide, short enough not to feel like waiting. */
const DURATION = 1000;

/** Fast out, long settle — the same shape as the site's CSS easing. */
const ease = (t: number) => 1 - Math.pow(1 - t, 4);

let running = 0;

/**
 * Smoothly scrolls to `#id`. Returns false if the target does not exist.
 *
 * The destination is re-measured every frame rather than once at click time.
 * Several sections above the fold are GSAP-pinned, so the document grows and
 * shrinks *while the scroll is in flight* — a fixed target computed up front
 * is stale by the time it is reached, which is what made anchors land short.
 * Re-reading the element's box each frame makes the tween self-correcting: it
 * always aims at where the section is now, not where it was.
 *
 * Lenis is paused for the duration so the two are not writing the scroll
 * position on the same frame.
 */
export function scrollToHash(hash: string): boolean {
  const el = document.querySelector(hash);
  if (!(el instanceof HTMLElement)) return false;

  const targetNow = () =>
    Math.max(
      0,
      Math.min(
        el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
        document.documentElement.scrollHeight - window.innerHeight,
      ),
    );

  history.replaceState(null, "", hash);

  const start = window.scrollY;
  const id = ++running;
  scroller?.stop();

  const t0 = performance.now();
  const step = (now: number) => {
    // A newer anchor click, or the user grabbing the wheel, wins.
    if (id !== running) return;

    const p = Math.min(1, (now - t0) / DURATION);
    window.scrollTo(0, start + (targetNow() - start) * ease(p));
    // Lenis is paused, so nothing else is publishing — keep the nav in sync.
    publishScroll(window.scrollY);

    if (p < 1) {
      requestAnimationFrame(step);
      return;
    }

    // Land exactly, in case the last frame's layout differed.
    window.scrollTo(0, targetNow());
    publishScroll(window.scrollY);
    running = 0;
    scroller?.start();
  };

  requestAnimationFrame(step);
  return true;
}

/** Cancels an in-flight anchor scroll — the user taking over always wins. */
export function cancelScrollTo() {
  if (!running) return;
  running++;
  scroller?.start();
}
