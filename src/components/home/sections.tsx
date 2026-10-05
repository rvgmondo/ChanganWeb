"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "@/components/layout/motion-provider";
import type { ModelView, ReviewView } from "@/lib/data";
import { monthlyRepayment } from "@/lib/finance";
import { rand } from "@/lib/format";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ Inside */

/** A small floating panel grows into the full interior as you scroll; the words part around it. */
export function Inside({ model }: { model?: ModelView }) {
  const secRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const w1 = useRef<HTMLSpanElement>(null);
  const w2 = useRef<HTMLSpanElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = secRef.current;
    const fr = frameRef.current;
    if (!sec || !fr) return;
    const img = fr.querySelector("img");
    const apply = (p: number) => {
      const e = Math.min(1, p * 1.25);
      const s = e * e * (3 - 2 * e);
      const W = window.innerWidth;
      const H = window.innerHeight;
      const small = W < 900;
      const fw = small ? 0.7 : 0.34;
      const fh = small ? 0.3 : 0.38;
      const ix = (1 - s) * ((W * (1 - fw)) / 2);
      const iy = (1 - s) * ((H * (1 - fh)) / 2);
      fr.style.clipPath = `inset(${iy}px ${ix}px ${iy}px ${ix}px round ${(1 - s) * 10}px)`;
      if (img) img.style.transform = `scale(${1.25 - s * 0.25})`;
      if (w1.current) w1.current.style.transform = `translateX(${-s * W * 0.5}px)`;
      if (w2.current) w2.current.style.transform = `translateX(${s * W * 0.5}px)`;
      for (const w of [w1.current, w2.current]) if (w) w.style.opacity = String(1 - s * 0.9);
      const c = Math.max(0, Math.min(1, (p - 0.62) / 0.25));
      if (copyRef.current) {
        copyRef.current.style.opacity = String(c);
        copyRef.current.style.transform = `translateY(${(1 - c) * 40}px)`;
      }
    };
    if (prefersReducedMotion()) {
      apply(1);
      return;
    }
    const st = ScrollTrigger.create({
      trigger: sec,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
    });
    apply(0);
    return () => st.kill();
  }, []);

  if (!model?.interior) return null;
  return (
    <section className="inside" id="inside" ref={secRef} aria-label={`Inside the ${model.name}`}>
      <div className="pin">
        <div className="in-words" aria-hidden="true">
          <span ref={w1}>Unexpected</span>
          <span ref={w2}>luxury</span>
        </div>
        <div className="in-frame" ref={frameRef}>
          {/* biome-ignore lint/performance/noImgElement: pre-sized rendition from the media library */}
          <img src={model.interior.url} alt={model.interior.alt} loading="lazy" />
          <div className="sh" />
          <div className="in-copy" ref={copyRef}>
            <h3>
              Step inside
              <br />
              the {model.name}
            </h3>
            <ul>
              <li>
                <b>12.8″</b>HD centre screen
              </li>
              <li>
                <b>540°</b>HD pano view
              </li>
              <li>
                <b>7-spd</b>DCT transmission
              </li>
              <li>
                <b>Electric</b>seats with seat usher
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Finance */

export function Finance({
  models,
  defaults,
}: {
  models: ModelView[];
  defaults: { rate: number; deposit: number; term: number };
}) {
  const [price, setPrice] = useState(models[0]?.fromPrice ?? 389900);
  const [dep, setDep] = useState(defaults.deposit);
  const [term, setTerm] = useState(defaults.term);
  const [rate, setRate] = useState(defaults.rate);
  const [bal, setBal] = useState(0);
  const target = monthlyRepayment(price, dep, term, rate, bal);
  const [shown, setShown] = useState(target);
  const shownRef = useRef(shown);

  // Count to the new figure rather than jumping.
  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(target);
      shownRef.current = target;
      return;
    }
    const from = shownRef.current;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 500);
      const v = from + (target - from) * (1 - (1 - t) ** 3);
      shownRef.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const fill = (v: number, min: number, max: number) =>
    ({ "--fill": `${((v - min) / (max - min)) * 100}%` }) as React.CSSProperties;

  return (
    <section className="finance" id="finance" aria-labelledby="fin-h">
      <div
        className="bgp"
        style={{
          left: "6%",
          top: "12%",
          width: "14vw",
          height: "22vw",
          transform: "rotate(-8deg)",
        }}
      />
      <div
        className="bgp"
        style={{
          right: "4%",
          top: "8%",
          width: "10vw",
          height: "16vw",
          transform: "rotate(10deg)",
        }}
      />
      <div
        className="bgp"
        style={{
          right: "30%",
          bottom: "-6%",
          width: "18vw",
          height: "12vw",
          transform: "rotate(-4deg)",
        }}
      />
      <div className="wrap f-grid">
        <div className="f-copy">
          <span className="lab">Changan Finance, powered by WesBank</span>
          <h2 id="fin-h" className="split">
            Know your monthly before you visit.
          </h2>
          <p data-r="up">
            Move the sliders to see an estimated repayment. When it feels right, ask us for a
            pre-approval with no impact on your credit score.
          </p>
          <ol className="steps" data-r="up">
            <li>Tell us about you and the car you want</li>
            <li>Add your income and expenses</li>
            <li>Get a pre-approval decision, then book your test drive</li>
          </ol>
        </div>
        <form
          className="calc glass"
          data-r="scale"
          onSubmit={(e) => e.preventDefault()}
          aria-label="Finance calculator"
        >
          <div className="field">
            <label htmlFor="fin-model">Vehicle</label>
            <select id="fin-model" value={price} onChange={(e) => setPrice(Number(e.target.value))}>
              {models.map((m) => (
                <option key={m.id} value={m.fromPrice}>
                  {m.name} · from {rand(m.fromPrice)}
                </option>
              ))}
            </select>
          </div>
          <div className="rng">
            <div className="top">
              <label htmlFor="fin-dep">Deposit</label>
              <b>
                {dep}% · {rand((price * dep) / 100)}
              </b>
            </div>
            <input
              id="fin-dep"
              type="range"
              min={0}
              max={40}
              step={1}
              value={dep}
              style={fill(dep, 0, 40)}
              onChange={(e) => setDep(Number(e.target.value))}
            />
          </div>
          <div className="two">
            <div className="rng">
              <div className="top">
                <label htmlFor="fin-term">Term</label>
                <b>{term} months</b>
              </div>
              <input
                id="fin-term"
                type="range"
                min={12}
                max={84}
                step={12}
                value={term}
                style={fill(term, 12, 84)}
                onChange={(e) => setTerm(Number(e.target.value))}
              />
            </div>
            <div className="rng">
              <div className="top">
                <label htmlFor="fin-rate">Interest</label>
                <b>{rate.toFixed(2)}%</b>
              </div>
              <input
                id="fin-rate"
                type="range"
                min={7}
                max={18}
                step={0.25}
                value={rate}
                style={fill(rate, 7, 18)}
                onChange={(e) => setRate(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="rng">
            <div className="top">
              <label htmlFor="fin-bal">Balloon</label>
              <b>{bal}%</b>
            </div>
            <input
              id="fin-bal"
              type="range"
              min={0}
              max={35}
              step={5}
              value={bal}
              style={fill(bal, 0, 35)}
              onChange={(e) => setBal(Number(e.target.value))}
            />
          </div>
          <div className="out">
            <div>
              <small>Estimated monthly</small>
              <b className="num" aria-live="polite">
                {rand(shown)}
              </b>
            </div>
            <a className="btn pri mag" href="#visit">
              Get pre-approved <i>→</i>
            </a>
          </div>
          <p className="fine">
            Estimate only, excluding fees and insurance. Final terms depend on WesBank&apos;s credit
            assessment.
          </p>
        </form>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Legacy */

function Count({ to, sep = false }: { to: number; sep?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fmt = (v: number) =>
      sep
        ? Math.round(v)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
        : String(Math.round(v));
    if (prefersReducedMotion()) {
      el.textContent = fmt(to);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - t0) / 1600);
          el.textContent = fmt(to * (1 - (1 - t) ** 4));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, sep]);
  return <span ref={ref}>{sep ? String(to).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : to}</span>;
}

export function Legacy() {
  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const sec = secRef.current;
    if (!sec || prefersReducedMotion()) return;
    const bg = sec.querySelector<HTMLElement>(".bg");
    const stats = Array.from(sec.querySelectorAll<HTMLElement>(".stat"));
    const st = ScrollTrigger.create({
      trigger: sec,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const p = (0.5 - self.progress) * 2;
        if (bg) bg.style.transform = `translateY(${p * 12}%)`;
        for (const s of stats)
          s.style.transform = `translateY(${p * 90 * Number(s.dataset.depth)}px)`;
      },
    });
    return () => st.kill();
  }, []);
  return (
    <section className="legacy" id="legacy" ref={secRef} aria-labelledby="leg-h">
      <div className="bg" style={{ backgroundImage: "url(/brand/l_event.webp)" }} />
      <div className="wrap lg-wrap">
        <span className="lab" style={{ opacity: 0.8 }}>
          Since 1862
        </span>
        <h2 id="leg-h" className="split">
          Legacy you can trust. Innovation you deserve.
        </h2>
        <p data-r="up">
          Changan is one of China&apos;s &ldquo;Big Four&rdquo; automotive groups, with 21
          factories, 120 000 people and a DUBHE intelligent-mobility plan bringing 35 new smart
          models. Every model coming to South Africa is adapted and tested for our roads and
          climate.
        </p>
        <div className="stats">
          <div className="stat" data-depth=".5">
            <b>
              <Count to={160} />+
            </b>
            <span>Years of legacy</span>
          </div>
          <div className="stat" data-depth="1.1">
            <b>
              <Count to={30} />
              M+
            </b>
            <span>Customers worldwide</span>
          </div>
          <div className="stat" data-depth=".2">
            <b>
              <Count to={75} />+
            </b>
            <span>Regions</span>
          </div>
          <div className="stat" data-depth=".8">
            <b>
              <Count to={9000} sep />+
            </b>
            <span>Outlets worldwide</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Reviews */

export function Reviews({ reviews }: { reviews: ReviewView[] }) {
  if (reviews.length === 0) return null;
  const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  const card = (r: ReviewView, key: string) => (
    <figure className="rv glass" key={key} style={{ margin: 0 }}>
      <blockquote style={{ margin: 0 }}>
        <q>{r.quote}</q>
      </blockquote>
      <figcaption className="who">
        <b>{r.name}</b>
        <span>
          {r.suburb ? `${r.suburb} · ` : ""}
          {"★".repeat(r.rating)}
        </span>
      </figcaption>
    </figure>
  );
  const rev = [...reviews].reverse();
  return (
    <section className="reviews" id="reviews" aria-labelledby="rev-h">
      <div className="wrap sec-head">
        <div>
          <span className="lab">What Pretoria says</span>
          <h2 id="rev-h" className="split">
            Driven by our customers.
          </h2>
        </div>
        <div className="rv-rate" data-r="up">
          <b>{avg.toFixed(1)}</b>
          <span role="img" aria-label={`${avg.toFixed(1)} out of 5`}>
            ★★★★★
          </span>
        </div>
      </div>
      <div className="rv-row">
        <div className="mq" style={{ "--mqd": "70s" } as React.CSSProperties}>
          {reviews.map((r) => card(r, `a-${r.id}`))}
          {reviews.map((r) => card(r, `b-${r.id}`))}
        </div>
      </div>
      <div className="rv-row" aria-hidden="true">
        <div className="mq rev" style={{ "--mqd": "80s" } as React.CSSProperties}>
          {rev.map((r) => card(r, `c-${r.id}`))}
          {rev.map((r) => card(r, `d-${r.id}`))}
        </div>
      </div>
    </section>
  );
}
