"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";
import {
  cancelScrollTo,
  publishScroll,
  registerScroller,
  scrollToHash,
} from "@/lib/scroll";

/**
 * Lenis interpolates the scroll position itself, which is what makes every
 * GSAP scrub read as smooth rather than stepped. It also has to drive
 * ScrollTrigger's update loop, or the two run on different clocks and the
 * pinned cinematic judders.
 *
 * Disabled entirely under prefers-reduced-motion — hijacking scroll is
 * exactly what that setting is asking us not to do.
 */
export default function SmoothScroll() {
  /**
   * A reload should start at the top. The browser otherwise restores the old
   * offset asynchronously, which lands mid-cinematic and leaves every pinned
   * ScrollTrigger reading a position it never animated into.
   */
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // Only on a bare load — an explicit #hash is still a request to go there.
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);

  /**
   * One delegated listener for every in-page anchor on the site.
   *
   * Registered outside the Lenis effect so it also works under reduced motion,
   * where there is no Lenis and `scrollToHash` falls back to a plain jump.
   */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      const href = a?.getAttribute("href");
      if (!href?.startsWith("#") || href === "#") return;

      if (href === "#top") {
        e.preventDefault();
        scrollToHash("#top") || window.scrollTo({ top: 0 });
        return;
      }
      if (scrollToHash(href)) e.preventDefault();
    };

    // Touching the wheel or the screen mid-glide hands control straight back.
    document.addEventListener("click", onClick);
    window.addEventListener("wheel", cancelScrollTo, { passive: true });
    window.addEventListener("touchstart", cancelScrollTo, { passive: true });
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("wheel", cancelScrollTo);
      window.removeEventListener("touchstart", cancelScrollTo);
    };
  }, []);

  useEffect(() => {
    // Reduced motion turns Lenis off, so the native event is the signal there.
    if (prefersReducedMotion()) {
      const native = () => publishScroll(window.scrollY);
      native();
      window.addEventListener("scroll", native, { passive: true });
      return () => window.removeEventListener("scroll", native);
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      // `lerp` rather than `duration`: duration mode restarts a fresh eased
      // tween on every wheel tick toward a target that has already moved on,
      // so a short flick compounds into a launch down the page. Lerp eases
      // toward the target at a fixed rate per frame instead — the glide stays
      // proportional to how much was actually scrolled.
      lerp: 0.09,
      smoothWheel: true,
      // A notch below 1 so a single detent travels a readable distance
      // instead of overshooting the section it was aimed at.
      wheelMultiplier: 0.85,
      // Touch devices already have momentum scrolling; doubling it feels wrong.
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);
    lenis.on("scroll", ({ scroll }: { scroll: number }) => publishScroll(scroll));

    registerScroller(lenis);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      registerScroller(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
