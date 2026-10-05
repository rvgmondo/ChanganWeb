"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "@/components/layout/motion-provider";
import type { ModelView } from "@/lib/data";
import { rand } from "@/lib/format";

const MAX_SLATS = 9;
const DEPTH = [0.2, -0.7, 0.5, -0.3, 0.9, -0.5, 0.3, -0.9, 0.6];
const AUTO_MS = 6500;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

type Slat = { ang: number; from: number; to: number; t0: number; dur: number };

const small = () => window.innerWidth < 900;

/**
 * The glass-slat hero. The current model's world photo is split across tall glass slats that
 * float at different depths: they assemble on load, spread apart as the pointer moves away
 * from the centre, scatter on scroll, and flip in a wave to the next model while its car
 * drives in on the reflecting floor. Clicking steps into that model's world.
 */
export function Hero({ models }: { models: ModelView[] }) {
  const [cur, setCur] = useState(0);
  const [open, setOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const state = useRef({
    slats: Array.from(
      { length: MAX_SLATS },
      (): Slat => ({ ang: 0, from: 0, to: 0, t0: 0, dur: 1100 }),
    ),
    n: MAX_SLATS,
    sw: 0,
    lastSwitch: 0,
    prev: -1,
    openFrom: "",
    paused: false,
  });

  const photo = useCallback((m: ModelView) => (small() ? m.portrait.url : m.world.url), []);

  /* Lay the slats out so together they form one picture. */
  const layout = useCallback(() => {
    const rig = rigRef.current;
    if (!rig) return;
    const s = state.current;
    const W = window.innerWidth;
    const H = window.innerHeight;
    s.n = small() ? 5 : MAX_SLATS;
    let cw = small() ? W * 0.86 : Math.min(W * 0.7, 1320);
    const ch = small() ? Math.min(cw * 1.38, H * 0.44) : Math.min(cw / 2.23, H * 0.46);
    if (!small()) cw = Math.min(cw, ch * 2.23);
    s.sw = cw / s.n;
    rig.querySelectorAll<HTMLElement>(".slat").forEach((el, i) => {
      el.style.display = i < s.n ? "" : "none";
      el.style.width = `${s.sw - (small() ? 5 : 8)}px`;
      el.style.height = `${ch}px`;
      for (const f of el.querySelectorAll<HTMLElement>(".f")) {
        f.style.backgroundSize = `${cw}px ${ch}px`;
        f.style.backgroundPosition = `${-i * s.sw}px 0`;
      }
    });
  }, []);

  /* Model change: flip slats in a wave onto their hidden faces, swap the car. */
  useEffect(() => {
    const model = models[cur];
    const rig = rigRef.current;
    if (!model || !rig) return;
    const s = state.current;
    const reduce = prefersReducedMotion();
    const first = s.prev === -1;
    const dir = first ? 1 : cur > s.prev || (s.prev === models.length - 1 && cur === 0) ? 1 : -1;
    s.prev = cur;
    s.lastSwitch = performance.now();
    const now = performance.now();
    rig.querySelectorAll<HTMLElement>(".slat").forEach((el, i) => {
      const slat = s.slats[i];
      if (!slat) return;
      const facingA = Math.round(slat.to / 180) % 2 === 0;
      const face = el.querySelector<HTMLElement>(first ? ".f.a" : facingA ? ".f.b" : ".f.a");
      if (face) face.style.backgroundImage = `url(${photo(model)})`;
      if (first) return;
      slat.from = slat.ang;
      slat.to += 180 * dir;
      slat.t0 = now + (dir > 0 ? i : s.n - 1 - i) * 75;
      slat.dur = reduce ? 1 : 1100;
    });

    const box = carRef.current;
    if (box) {
      const old = box.querySelector("img");
      const im = new Image();
      im.src = model.cutout.url;
      im.alt = `Changan ${model.name}`;
      if (model.cutout.width) im.width = model.cutout.width;
      if (model.cutout.height) im.height = model.cutout.height;
      box.style.width = /hunter/i.test(model.name)
        ? "min(30vw,520px)"
        : /alsvin/i.test(model.name)
          ? "min(38vw,660px)"
          : "";
      box.appendChild(im);
      if (old && !reduce) {
        old
          .animate(
            [
              { transform: "none", filter: "blur(0)" },
              { transform: `translateX(${-dir * 90}vw)`, filter: "blur(8px)" },
            ],
            { duration: 750, easing: "cubic-bezier(.6,0,.9,.4)", fill: "forwards" },
          )
          .finished.then(() => old.remove())
          .catch(() => old.remove());
      } else old?.remove();
      if (!reduce) {
        im.animate(
          [
            { transform: `translateX(${dir * 90}vw)`, filter: "blur(8px)" },
            { transform: "translateX(-2.5%)", filter: "blur(0)", offset: 0.82 },
            { transform: "none" },
          ],
          {
            duration: 1300,
            delay: first ? 900 : 350,
            easing: "cubic-bezier(.16,1,.3,1)",
            fill: "backwards",
          },
        );
      }
    }

    if (!first && !reduce) {
      for (const [j, c] of Array.from(nameRef.current?.children ?? []).entries()) {
        c.animate([{ transform: "translateY(105%)" }, { transform: "none" }], {
          duration: 900,
          delay: 250 + j * 30,
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "backwards",
        });
      }
      for (const [j, el] of Array.from(
        copyRef.current?.querySelectorAll(".h-line,.h-specs>div,.h-price") ?? [],
      ).entries()) {
        el.animate(
          [
            { opacity: 0, transform: "translateY(14px)" },
            { opacity: 1, transform: "none" },
          ],
          {
            duration: 700,
            delay: 400 + j * 60,
            easing: "cubic-bezier(.16,1,.3,1)",
            fill: "backwards",
          },
        );
      }
    }
  }, [cur, models, photo]);

  /* Pointer, scroll and the animation loop. */
  useEffect(() => {
    const hero = heroRef.current;
    const rig = rigRef.current;
    const word = wordRef.current;
    if (!hero || !rig || !word) return;
    const s = state.current;
    const reduce = prefersReducedMotion();
    layout();
    // Paint the first model's photo onto the A faces at the right size for this screen.
    const first = models[0];
    if (first)
      for (const f of rig.querySelectorAll<HTMLElement>(".f.a"))
        f.style.backgroundImage = `url(${photo(first)})`;

    let mx = 0.5;
    let my = 0.5;
    let tx = 0.5;
    let ty = 0.5;
    let spread = 4;
    let raf = 0;
    let visible = true;
    const t0 = performance.now();
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth;
      ty = e.clientY / window.innerHeight;
      const hint = hero.querySelector<HTMLElement>(".h-hint");
      if (hint) hint.style.opacity = "0";
    };
    const onLeave = () => {
      tx = 0.5;
      ty = 0.5;
    };
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", layout);
    const io = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting);
    });
    io.observe(hero);

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const intro = reduce ? 1 : clamp((t - t0 - 200) / 1800);
      const ie = 1 - (1 - intro) ** 4;
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;
      const sp = clamp(window.scrollY / window.innerHeight);
      const dist = Math.hypot(mx - 0.5, (my - 0.5) * 0.7) * 2;
      const target =
        0.08 + dist * 1.25 + sp * 3 + (1 - ie) * 5 + (reduce ? 0 : Math.sin(t * 0.0006) * 0.04);
      spread += (target - spread) * 0.08;
      rig.style.transform = `rotateY(${(mx - 0.5) * 14}deg) rotateX(${(0.5 - my) * 7 + sp * 10}deg) translateY(${-sp * 18}vh)`;
      rig.querySelectorAll<HTMLElement>(".slat").forEach((el, i) => {
        if (i >= s.n) return;
        const slat = s.slats[i] as Slat;
        if (slat.to !== slat.from) {
          const p = clamp((t - slat.t0) / slat.dur);
          slat.ang = slat.from + (slat.to - slat.from) * ease(p);
          if (p >= 1) slat.from = slat.to;
        }
        const c = i - (s.n - 1) / 2;
        const d = DEPTH[i] ?? 0;
        const flipping = slat.ang % 180 !== 0;
        const pop = flipping ? Math.sin((Math.PI * (Math.abs(slat.ang) % 180)) / 180) * 90 : 0;
        const x = c * s.sw * (1 + spread * 0.32);
        const z = d * spread * 240 - (1 - ie) * 900 + pop;
        const y =
          (reduce ? 0 : Math.sin(t * 0.0008 + i * 1.31) * (4 + spread * 10)) +
          d * spread * 26 -
          sp * (60 + i * 18);
        el.style.transform = `translate(-50%,-50%) translate3d(${x}px,${y}px,${z}px) rotateY(${slat.ang + c * spread * 5}deg) rotateZ(${d * spread * 2}deg)`;
        el.style.opacity = String(clamp(ie * 1.4 - Math.abs(c) * 0.06));
      });
      word.style.transform = `translate3d(${(mx - 0.5) * -40}px,${(1 - ie) * 80 - sp * 140}px,0)`;
      word.style.opacity = String(ie * (1 - sp * 0.8));
      const p = clamp((t - s.lastSwitch) / AUTO_MS);
      tabsRef.current
        ?.querySelector<HTMLElement>("button.on i")
        ?.style.setProperty("--p", String(p));
      if (!reduce && p >= 1 && sp < 0.3 && !s.paused && models.length > 1) {
        s.lastSwitch = t;
        setCur((c) => (c + 1) % models.length);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", layout);
    };
  }, [layout, models, photo]);

  /* Step into the world: the slat bounds grow into a full-screen view of the model. */
  const stepIn = () => {
    const rig = rigRef.current;
    const el = openRef.current;
    if (!rig || !el) return;
    const rects = Array.from(rig.querySelectorAll<HTMLElement>(".slat"))
      .filter((s) => s.style.display !== "none")
      .map((s) => s.getBoundingClientRect());
    const r = {
      left: Math.min(...rects.map((x) => x.left)),
      right: Math.max(...rects.map((x) => x.right)),
      top: Math.min(...rects.map((x) => x.top)),
      bottom: Math.max(...rects.map((x) => x.bottom)),
    };
    const ins = `inset(${Math.max(0, r.top)}px ${Math.max(0, window.innerWidth - r.right)}px ${Math.max(0, window.innerHeight - r.bottom)}px ${Math.max(0, r.left)}px round 6px)`;
    state.current.openFrom = ins;
    state.current.paused = true;
    setOpen(true);
    requestAnimationFrame(() => {
      if (prefersReducedMotion()) return;
      el.animate([{ clipPath: ins }, { clipPath: "inset(0px 0px 0px 0px round 0px)" }], {
        duration: 1000,
        easing: "cubic-bezier(.7,0,.2,1)",
      });
      el.querySelector("img")?.animate([{ transform: "scale(1.2)" }, { transform: "scale(1)" }], {
        duration: 1400,
        easing: "cubic-bezier(.16,1,.3,1)",
      });
    });
  };
  const close = useCallback(() => {
    const el = openRef.current;
    const done = () => {
      setOpen(false);
      state.current.paused = false;
      state.current.lastSwitch = performance.now();
    };
    if (!el || prefersReducedMotion() || !state.current.openFrom) return done();
    el.animate(
      [{ clipPath: "inset(0px 0px 0px 0px round 0px)" }, { clipPath: state.current.openFrom }],
      {
        duration: 800,
        easing: "cubic-bezier(.7,0,.2,1)",
      },
    ).onfinish = done;
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const model = models[cur];
  if (!model) return null;

  return (
    <section
      className="hero"
      id="top"
      ref={heroRef}
      aria-roledescription="carousel"
      aria-label="The Changan range"
    >
      <link rel="preload" as="image" href={models[0]?.world.url} />
      <div className="h-sun" />
      <div className="h-floor" />
      <div className="h-word" ref={wordRef} aria-hidden="true">
        <small>Driven to</small>EVOLVE
      </div>
      <div className="h-scene">
        {/* biome-ignore lint/a11y/useSemanticElements: a 3D transform container for the slats; a <button> cannot hold the preserve-3d layout reliably across browsers */}
        <div
          className="h-rig"
          ref={rigRef}
          role="button"
          tabIndex={0}
          aria-label={`Step into the world of the ${model.name}`}
          onClick={stepIn}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              stepIn();
            }
          }}
        >
          {Array.from({ length: MAX_SLATS }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed set of slats
            <div className="slat" data-cur="STEP IN" key={i}>
              <div className="f a" />
              <div className="f b" />
              <div className="sh" />
            </div>
          ))}
        </div>
      </div>
      <div className="h-car" ref={carRef} />
      <div className="h-copy" ref={copyRef} aria-live="polite">
        <h1 className="h-name" ref={nameRef} aria-label={`Changan ${model.name}`}>
          {model.name.split("").map((ch, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: letters of a word
            <span key={`${model.id}-${i}`} aria-hidden="true">
              {ch === " " ? " " : ch}
            </span>
          ))}
        </h1>
        <p className="h-line">{model.tagline}</p>
        <div className="h-specs">
          {model.specs.map((s) => (
            <div key={s.label}>
              <span>{s.label}</span>
              <b>{s.value}</b>
            </div>
          ))}
        </div>
        <div className="h-price">
          From<b>{rand(model.fromPrice)}</b>
          {model.monthlyFrom ? <small>{model.monthlyFrom}</small> : null}
        </div>
        <div className="h-row">
          <a className="btn pri mag" href="#range">
            Discover <i>→</i>
          </a>
          <a className="btn ghost mag" href="#visit" style={{ color: "var(--blue-deep)" }}>
            Book a test drive
          </a>
        </div>
      </div>
      <div className="h-tabs" ref={tabsRef} role="tablist" aria-label="Models">
        {models.map((m, i) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={i === cur}
            className={i === cur ? "on" : ""}
            onClick={() => setCur(i)}
          >
            {m.name}
            <i />
          </button>
        ))}
      </div>
      <div className="h-hint">Move to break the world apart · click to step in</div>

      <div
        className={`open${open ? " on" : ""}`}
        ref={openRef}
        role="dialog"
        aria-modal="true"
        aria-label={model.name}
        hidden={!open}
      >
        {/* biome-ignore lint/performance/noImgElement: full-bleed world photo from the media library */}
        <img src={model.world.url} alt={model.world.alt} />
        <div className="sh" />
        <button className="x" type="button" aria-label="Close" onClick={close}>
          ✕
        </button>
        <div className="tx">
          <h2
            className="disp"
            style={{ margin: 0, fontSize: "clamp(48px,7vw,120px)", lineHeight: 0.92 }}
          >
            {model.name}
          </h2>
          <p>{model.tagline}</p>
          <div className="specs">
            {model.specs.map((s) => (
              <div key={s.label}>
                <b>{s.value}</b>
                {s.label}
              </div>
            ))}
            <div>
              <b>{rand(model.fromPrice)}</b>From
            </div>
          </div>
          <button
            className="btn wht"
            type="button"
            onClick={() => {
              close();
              document.getElementById("visit")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Book a test drive <i>→</i>
          </button>
        </div>
      </div>
    </section>
  );
}
