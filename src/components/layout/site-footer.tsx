import type { Dealer } from "@/payload-types";

export function SiteFooter({ dealer }: { dealer: Dealer }) {
  const year = new Date().getFullYear();
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="big" aria-hidden="true">
          CHANGAN
        </div>
        <div className="cols">
          <div>
            {/* biome-ignore lint/performance/noImgElement: static brand asset */}
            <img
              src="/brand/changan-logo-white.webp"
              alt="Changan"
              width={204}
              height={22}
              style={{ height: 22, width: "auto", marginBottom: 18 }}
            />
            <p style={{ opacity: 0.75, maxWidth: "36ch", margin: 0 }}>
              {dealer.name}, {dealer.street}, {dealer.suburb}, {dealer.city}. New and demo Changan
              vehicles, finance, trade-ins and service.
            </p>
            <p style={{ opacity: 0.9, marginTop: 14 }}>
              <a href={`tel:${dealer.phone.replace(/\s/g, "")}`}>{dealer.phone}</a>
              <br />
              <a href={`mailto:${dealer.email}`}>{dealer.email}</a>
            </p>
          </div>
          <div>
            <h4>Vehicles</h4>
            <ul>
              <li>
                <a href="/#range">Uni-S</a>
              </li>
              <li>
                <a href="/#range">Deepal S07</a>
              </li>
              <li>
                <a href="/#range">Hunter</a>
              </li>
              <li>
                <a href="/#range">CS75 Pro</a>
              </li>
              <li>
                <a href="/#range">Alsvin</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Buy</h4>
            <ul>
              <li>
                <a href="/stock">In stock</a>
              </li>
              <li>
                <a href="/#finance">Finance</a>
              </li>
              <li>
                <a href="/#visit">Sell or trade in</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Trading hours</h4>
            <ul>
              {(dealer.hours ?? []).map((h) => (
                <li key={h.id ?? h.days}>
                  {h.days}: {h.time}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="legal">
          <span>
            © {year} {dealer.name}. Prices include VAT and are subject to change. *T&amp;Cs apply.
          </span>
          <span>Your information is handled in line with POPIA.</span>
        </div>
      </div>
    </footer>
  );
}
