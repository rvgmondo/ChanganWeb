"use client";

import Link from "next/link";
import { ViewTransition } from "react";

import { prefersReducedMotion } from "@/components/layout/motion-provider";
import type { VehicleView } from "@/lib/data";
import { monthlyRepayment } from "@/lib/finance";
import { km, rand } from "@/lib/format";

/**
 * One stock car. The photo carries a view-transition name, so opening the car morphs this image
 * into the hero of the detail page instead of cutting to a new page.
 */
export function VehicleCard({
  v,
  rate = 11.75,
  layout = "grid",
  saved,
  onSave,
  linkToDetail = false,
}: {
  v: VehicleView;
  linkToDetail?: boolean;
  rate?: number;
  layout?: "grid" | "list";
  saved?: boolean;
  onSave?: (id: string) => void;
}) {
  const tilt = (e: React.PointerEvent<HTMLElement>) => {
    if (layout === "list" || prefersReducedMotion()) return;
    const c = e.currentTarget;
    const r = c.getBoundingClientRect();
    c.style.transform = `perspective(900px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 8}deg) rotateX(${(0.5 - (e.clientY - r.top) / r.height) * 6}deg) translateY(-6px)`;
  };
  return (
    <article
      className={`card${layout === "list" ? " is-list" : ""}`}
      data-flip-id={v.id}
      data-cur="VIEW"
      style={{ "--tint": `${v.colourHex}33` } as React.CSSProperties}
      onPointerMove={tilt}
      onPointerLeave={(e) => {
        e.currentTarget.style.transform = "";
      }}
    >
      {linkToDetail ? (
        <Link
          href={`/stock/${v.slug}`}
          className="card-link"
          aria-label={`${v.year} Changan ${v.model} ${v.variant}, ${rand(v.price)}`}
        />
      ) : null}
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
          {v.status === "reserved" ? <span className="res">Reserved</span> : null}
        </div>
        {onSave ? (
          <button
            type="button"
            className={`heart${saved ? " on" : ""}`}
            aria-label={saved ? "Remove from saved" : "Save this car"}
            aria-pressed={Boolean(saved)}
            onClick={() => onSave(v.id)}
          >
            {saved ? "♥" : "♡"}
          </button>
        ) : null}
        {v.photo ? (
          <ViewTransition name={`car-${v.id}`} share="morph" default="none">
            {/* biome-ignore lint/performance/noImgElement: pre-sized rendition from the media library */}
            <img
              src={v.photo.url}
              alt={v.photo.alt}
              loading="lazy"
              width={v.photo.width}
              height={v.photo.height}
            />
          </ViewTransition>
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
  );
}
