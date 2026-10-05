"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger, SplitText);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * One place for page-wide motion:
 *  - Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis share a clock.
 *  - Entrance reveals: [data-r] elements get `.in` when they scroll into view; `.split`
 *    headings are split into words with GSAP SplitText and rise through a mask.
 *  - Magnetic buttons (.mag) and the contextual cursor ([data-cur] labels).
 * With prefers-reduced-motion everything is shown at rest and nothing moves.
 */
export function MotionProvider() {
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on route change
  useEffect(() => {
    const reduce = prefersReducedMotion();
    const cleanups: (() => void)[] = [];

    if (!reduce) {
      const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      const onAnchor = (e: MouseEvent) => {
        const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
        if (!a || a.getAttribute("href") === "#") return;
        const target = document.querySelector(a.getAttribute("href") as string);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target as HTMLElement, { offset: -20 });
        }
      };
      document.addEventListener("click", onAnchor);
      cleanups.push(() => {
        document.removeEventListener("click", onAnchor);
        gsap.ticker.remove(raf);
        lenis.destroy();
      });
    }

    // Split headings into words that rise through a mask.
    const splits: SplitText[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(".split:not([data-split])")) {
      el.dataset.split = "1";
      if (reduce) continue;
      const split = SplitText.create(el, { type: "words", mask: "words", wordsClass: "sw" });
      splits.push(split);
      gsap.set(split.words, { yPercent: 105 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () =>
          gsap.to(split.words, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.045 }),
      });
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of document.querySelectorAll("[data-r]")) {
      if (reduce) el.classList.add("in");
      else io.observe(el);
    }

    // Magnetic buttons
    if (!reduce) {
      for (const b of document.querySelectorAll<HTMLElement>(".mag")) {
        const move = (e: PointerEvent) => {
          const r = b.getBoundingClientRect();
          b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
        };
        const leave = () => {
          b.style.transform = "";
        };
        b.addEventListener("pointermove", move);
        b.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          b.removeEventListener("pointermove", move);
          b.removeEventListener("pointerleave", leave);
        });
      }
    }

    // Contextual cursor
    if (!reduce && window.matchMedia("(hover:hover)").matches) {
      const c = document.createElement("div");
      c.className = "cursor";
      c.setAttribute("aria-hidden", "true");
      document.body.appendChild(c);
      let x = -100;
      let y = -100;
      let cx = x;
      let cy = y;
      let raf = 0;
      const move = (e: PointerEvent) => {
        x = e.clientX;
        y = e.clientY;
        const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cur]");
        c.classList.toggle("big", Boolean(t));
        c.textContent = t?.dataset.cur ?? "";
      };
      const tick = () => {
        cx += (x - cx) * 0.22;
        cy += (y - cy) * 0.22;
        c.style.transform = `translate(${cx}px,${cy}px)`;
        raf = requestAnimationFrame(tick);
      };
      tick();
      window.addEventListener("pointermove", move);
      cleanups.push(() => {
        window.removeEventListener("pointermove", move);
        cancelAnimationFrame(raf);
        c.remove();
      });
    }

    ScrollTrigger.refresh();
    return () => {
      io.disconnect();
      for (const s of splits) s.revert();
      for (const fn of cleanups) fn();
    };
  }, [pathname]);

  return null;
}
