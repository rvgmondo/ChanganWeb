"use client";

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useMemo, useRef, useState } from "react";

import { prefersReducedMotion } from "@/components/layout/motion-provider";
import type { VehicleView } from "@/lib/data";
import { monthlyRepayment } from "@/lib/finance";
import { km, rand } from "@/lib/format";

gsap.registerPlugin(Flip);

const CATS = ["All", "SUV", "Electric", "Bakkie", "Sedan"] as const;
type Sort = "f" | "lo" | "hi" | "new";

/** Featured stock with category chips and sorting, animated with GSAP Flip. */
export function Stock({
  stock,
  total,
  rate,
}: {
  stock: VehicleView[];
  total: number;
  rate: number;
}) {
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [sort, setSort] = useState<Sort>("f");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);

  const shown = useMemo(() => {
    const list = stock.filter((v) => cat === "All" || v.body === cat);
    const sorted = [...list];
    if (sort === "lo") sorted.sort((a, b) => a.price - b.price);
    if (sort === "hi") sorted.sort((a, b) => b.price - a.price);
    if (sort === "new") sorted.sort((a, b) => b.year - a.year);
    return sorted;
  }, [stock, cat, sort]);

  // Capture card positions before React re-renders, then FLIP them into place.
  const animate = (change: () => void) => {
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion()) return change();
    const state = Flip.getState(grid.querySelectorAll(".card"));
    change();
    requestAnimationFrame(() =>
      Flip.from(state, {
        duration: 0.8,
        ease: "expo.out",
        absolute: true,
        onEnter: (els) =>
          gsap.fromTo(
            els,
            { opacity: 0, scale: 0.85 },
            { opacity: 1, scale: 1, duration: 0.7, ease: "expo.out" },
          ),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.4 }),
      }),
    );
  };

  const tilt = (e: React.PointerEvent<HTMLElement>) => {
    if (prefersReducedMotion()) return;
    const c = e.currentTarget;
    const r = c.getBoundingClientRect();
    c.style.transform = `perspective(900px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 8}deg) rotateX(${(0.5 - (e.clientY - r.top) / r.height) * 6}deg) translateY(-6px)`;
  };

  return (
    <section className="stock" id="stock" aria-labelledby="stock-h">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <span className="lab">In stock at Changan Silverton</span>
            <h2 id="stock-h" className="split">
              Ready when
              <br />
              you are.
            </h2>
          </div>
          <p data-r="up">
            New and demo stock on the floor today, every car backed by the factory warranty. Filter
            by body type or sort by price, and save the ones you like.
          </p>
        </div>
        <div className="filters" data-r="up">
          <fieldset className="chips">
            <legend className="sr-only">Filter by body type</legend>
            {CATS.map((c) => (
              <button
                key={c}
                type="button"
                className="chip"
                aria-pressed={cat === c}
                onClick={() => animate(() => setCat(c))}
              >
                {c}
                <b>{c === "All" ? stock.length : stock.filter((v) => v.body === c).length}</b>
              </button>
            ))}
          </fieldset>
          <label className="sort">
            <span className="lab" style={{ color: "var(--mute)" }}>
              Sort
            </span>
            <select
              value={sort}
              onChange={(e) => animate(() => setSort(e.target.value as Sort))}
              aria-label="Sort stock"
            >
              <option value="f">Featured</option>
              <option value="lo">Price: low to high</option>
              <option value="hi">Price: high to low</option>
              <option value="new">Newest</option>
            </select>
          </label>
        </div>
        <div className="grid" ref={gridRef}>
          {shown.map((v) => (
            <article
              key={v.id}
              className="card"
              data-flip-id={v.id}
              data-cur="VIEW"
              style={{ "--tint": `${v.colourHex}33` } as React.CSSProperties}
              onPointerMove={tilt}
              onPointerLeave={(e) => {
                e.currentTarget.style.transform = "";
              }}
            >
              <div className="top">
                <div className="badges">
                  {v.condition === "new" ? (
                    <span className="new">New</span>
                  ) : (
                    <span>
                      {v.condition === "demo" ? "Demo" : "Used"} · {km(v.mileage)}
                    </span>
                  )}
                  <span>{v.year}</span>
                </div>
                <button
                  type="button"
                  className={`heart${saved.has(v.id) ? " on" : ""}`}
                  aria-label={saved.has(v.id) ? "Remove from saved" : "Save this car"}
                  aria-pressed={saved.has(v.id)}
                  onClick={() =>
                    setSaved((s) => {
                      const next = new Set(s);
                      if (next.has(v.id)) next.delete(v.id);
                      else next.add(v.id);
                      return next;
                    })
                  }
                >
                  {saved.has(v.id) ? "♥" : "♡"}
                </button>
                {v.photo ? (
                  // biome-ignore lint/performance/noImgElement: pre-sized rendition from the media library
                  <img
                    src={v.photo.url}
                    alt={v.photo.alt}
                    loading="lazy"
                    width={v.photo.width}
                    height={v.photo.height}
                  />
                ) : null}
              </div>
              <div className="bd">
                <h3>{v.model}</h3>
                <div className="v">
                  {v.variant} · {v.colour}
                </div>
                <div className="meta">
                  <span>{v.fuel}</span>
                  <span>{v.transmission}</span>
                  <span>{v.body}</span>
                </div>
                <div className="pr">
                  <strong className="num">{rand(v.price)}</strong>
                  <small>≈ {rand(monthlyRepayment(v.price, 10, 72, rate, 0))} p/m</small>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="more">
          <a className="btn pri mag" href="/stock">
            View all {total} vehicles <i>→</i>
          </a>
        </div>
      </div>
    </section>
  );
}
