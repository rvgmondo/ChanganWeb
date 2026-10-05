"use client";

import { useActionState } from "react";

import { type LeadState, submitLead } from "@/app/actions/lead";
import type { Dealer } from "@/payload-types";

const initial: LeadState = { ok: false, message: "" };

export function Visit({ dealer, models }: { dealer: Dealer; models: string[] }) {
  const [state, action, pending] = useActionState(submitLead, initial);
  const err = (k: string) => state.errors?.[k];
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${dealer.name}, ${dealer.street}, ${dealer.suburb}, ${dealer.city}`)}`;

  return (
    <section className="visit" id="visit" aria-labelledby="visit-h">
      <div className="wrap v-grid">
        <div className="v-img" data-r="scale">
          {/* biome-ignore lint/performance/noImgElement: static brand photograph */}
          <img
            src="/brand/l_dealer.webp"
            alt="A Changan Hunter outside a Changan dealership"
            loading="lazy"
            width={1200}
            height={900}
          />
          <div className="card2 glass">
            <div>
              <b>Showroom</b>
              {dealer.street}, {dealer.suburb}, {dealer.city}
              <br />
              <a href={map} target="_blank" rel="noopener">
                Get directions ↗
              </a>
            </div>
            <div>
              <b>Hours</b>
              {(dealer.hours ?? []).slice(0, 2).map((h) => (
                <span key={h.id ?? h.days} style={{ display: "block" }}>
                  {h.days}: {h.time}
                </span>
              ))}
            </div>
            <div>
              <b>Call</b>
              <a href={`tel:${dealer.phone.replace(/\s/g, "")}`}>{dealer.phone}</a>
              <br />
              <a href={`mailto:${dealer.email}`}>{dealer.email}</a>
            </div>
          </div>
        </div>
        <form className="v-form" data-r="up" action={action} noValidate>
          <span className="lab" style={{ color: "var(--blue)" }}>
            Test drive · Trade-in · Service
          </span>
          <h2 id="visit-h">Book a test drive</h2>
          <input type="hidden" name="type" value="test-drive" />
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ display: "none" }}
          />
          <div className="two">
            <div className="field">
              <label htmlFor="v-name">Name</label>
              <input
                id="v-name"
                name="name"
                placeholder="Thandi Mokoena"
                autoComplete="name"
                aria-invalid={Boolean(err("name"))}
                required
              />
              {err("name") ? <span className="err">{err("name")}</span> : null}
            </div>
            <div className="field">
              <label htmlFor="v-phone">Mobile</label>
              <input
                id="v-phone"
                name="phone"
                placeholder="082 123 4567"
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={Boolean(err("phone"))}
                required
              />
              {err("phone") ? <span className="err">{err("phone")}</span> : null}
            </div>
          </div>
          <div className="field">
            <label htmlFor="v-email">Email (optional)</label>
            <input
              id="v-email"
              name="email"
              type="email"
              placeholder="thandi@email.co.za"
              autoComplete="email"
              aria-invalid={Boolean(err("email"))}
            />
            {err("email") ? <span className="err">{err("email")}</span> : null}
          </div>
          <div className="two">
            <div className="field">
              <label htmlFor="v-model">Model</label>
              <select id="v-model" name="interest">
                {models.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="v-date">Preferred date</label>
              <input id="v-date" name="preferredDate" type="date" />
            </div>
          </div>
          <label className="consent">
            <input type="checkbox" name="consent" defaultChecked />
            <span>
              I agree that {dealer.name} may contact me about my enquiry, in line with POPIA.
            </span>
          </label>
          {err("consent") ? <span className="err">{err("consent")}</span> : null}
          {state.message ? (
            <p className={`form-msg ${state.ok ? "ok" : "err"}`} role="status">
              {state.message}
            </p>
          ) : null}
          <div className="acts">
            <button className="btn pri mag" type="submit" disabled={pending}>
              {pending ? "Sending…" : "Book my drive"} <i>→</i>
            </button>
            {dealer.whatsapp ? (
              <a
                className="btn wa mag"
                href={`https://wa.me/${dealer.whatsapp}`}
                target="_blank"
                rel="noopener"
              >
                WhatsApp us
              </a>
            ) : (
              <a
                className="btn ghost mag"
                href={`tel:${dealer.phone.replace(/\s/g, "")}`}
                style={{ color: "var(--blue-deep)" }}
              >
                Call {dealer.phone}
              </a>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
