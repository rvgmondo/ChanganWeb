"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "@/components/layout/motion-provider";
import type { ModelView } from "@/lib/data";
import { rand } from "@/lib/format";

gsap.registerPlugin(ScrollTrigger);

/**
 * "Five worlds. One evolution." A pinned 3D coverflow of the models' world photos. Scroll
 * moves through the range; the active model's car drives onto the floor and its details card
 * updates. The ticks jump straight to a model.
 */
export function Range({ models }: { models: ModelView[] }) {
  const secRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const prev = useRef(-1);
  const st = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const sec = secRef.current;
    const stage = stageRef.current;
    if (!sec || !stage) return;
    const pans = Array.from(stage.querySelectorAll<HTMLElement>(".r-pan"));
    const place = (p: number) => {
      const small = window.innerWidth < 900;
      pans.forEach((el, i) => {
        const d = i - p;
        const a = Math.abs(d);
        el.style.transform = `translate(-50%,-50%) translateX(${d * (small ? 70 : 40)}vw) translateZ(${-a * 320}px) rotateY(${-Math.max(-1.5, Math.min(1.5, d)) * 32}deg)`;
        el.style.opacity = String(Math.max(0, Math.min(1, 1.6 - a * 0.55)));
        el.style.zIndex = String(10 - Math.round(a * 2));
      });
      setActive(Math.round(p));
    };
    st.current = ScrollTrigger.create({
      trigger: sec,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => place(self.progress * (models.length - 1)),
    });
    place(0);
    return () => st.current?.kill();
  }, [models.length]);

  // Swap the car and animate the info card when the active model changes.
  useEffect(() => {
    const model = models[active];
    const box = carRef.current;
    if (!model || !box) return;
    const reduce = prefersReducedMotion();
    const dir = active >= prev.current ? 1 : -1;
    const first = prev.current === -1;
    prev.current = active;
    const old = box.querySelector("img");
    const im = new Image();
    im.src = model.cutout.url;
    im.alt = `Changan ${model.name}`;
    box.appendChild(im);
    if (old && !reduce) {
      old
        .animate(
          [
            { transform: "none", opacity: 1 },
            { transform: `translateX(${-dir * 70}vw)`, opacity: 0 },
          ],
          {
            duration: 700,
            easing: "cubic-bezier(.6,0,.9,.4)",
            fill: "forwards",
          },
        )
        .finished.then(() => old.remove())
        .catch(() => old.remove());
    } else old?.remove();
    if (!reduce && !first) {
      im.animate(
        [
          { transform: `translateX(${dir * 70}vw)`, filter: "blur(6px)" },
          { transform: "none", filter: "blur(0)" },
        ],
        {
          duration: 1000,
          delay: 150,
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "backwards",
        },
      );
      for (const [k, c] of Array.from(infoRef.current?.children ?? []).entries()) {
        c.animate(
          [
            { opacity: 0, transform: "translateY(16px)" },
            { opacity: 1, transform: "none" },
          ],
          {
            duration: 700,
            delay: k * 50,
            easing: "cubic-bezier(.16,1,.3,1)",
            fill: "backwards",
          },
        );
      }
    }
  }, [active, models]);

  const jump = (i: number) => {
    const t = st.current;
    if (!t) return;
    const y = t.start + (i / Math.max(1, models.length - 1)) * (t.end - t.start) + 2;
    window.scrollTo({ top: y, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  const m = models[active];
  return (
    <section className="range" id="range" ref={secRef} aria-label="The range">
      <div className="pin">
        <div className="r-head">
          <span className="lab">The range</span>
          <h2>
            Five worlds.
            <br />
            One evolution.
          </h2>
        </div>
        <div className="r-stage" ref={stageRef}>
          {models.map((model) => (
            <figure className="r-pan" data-cur="VIEW" key={model.id}>
              <div className="g">
                {/* biome-ignore lint/performance/noImgElement: pre-sized rendition from the media library */}
                <img
                  src={model.world.url}
                  alt={model.world.alt}
                  loading="lazy"
                  width={model.world.width}
                  height={model.world.height}
                />
              </div>
              <span className="nm">{model.name}</span>
            </figure>
          ))}
        </div>
        <div className="r-car" ref={carRef} />
        {m ? (
          <div className="r-info glass" ref={infoRef}>
            <div className="n">{m.name}</div>
            <div className="ty">
              {m.type} · {m.fuel}
            </div>
            <p>{m.tagline}</p>
            <div className="sp">
              {m.specs.map((s) => (
                <div key={s.label}>
                  <b>{s.value}</b>
                  {s.label}
                </div>
              ))}
            </div>
            <div className="pr">
              <strong>
                From {rand(m.fromPrice)}
                {m.monthlyFrom ? <small>{m.monthlyFrom}</small> : null}
              </strong>
              <a className="btn pri sm" href="#visit">
                Test drive <i>→</i>
              </a>
            </div>
          </div>
        ) : null}
        <div className="r-ticks">
          {models.map((model, i) => (
            <button
              key={model.id}
              type="button"
              className={i === active ? "on" : ""}
              onClick={() => jump(i)}
            >
              {model.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
