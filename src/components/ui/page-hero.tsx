import Link from "next/link";

/**
 * The header band for inner pages: the campaign sunset, floating glass panels at different
 * depths (they drift with the pointer via .ph-panels in site CSS), a breadcrumb and a big title.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs = [],
  images = [],
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  crumbs?: { href: string; label: string }[];
  images?: string[];
  children?: React.ReactNode;
}) {
  return (
    <section className="ph" aria-labelledby="ph-title">
      <div className="ph-sun" aria-hidden="true" />
      <div className="ph-panels" aria-hidden="true">
        {images.slice(0, 4).map((src, i) => (
          <div key={src} className={`ph-pan p${i}`} style={{ backgroundImage: `url(${src})` }} />
        ))}
      </div>
      <div className="wrap ph-in">
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.href}>
                <Link href={c.href}>{c.label}</Link>
              </li>
            ))}
          </ol>
        </nav>
        <span className="lab">{eyebrow}</span>
        <h1 id="ph-title" className="split">
          {title}
        </h1>
        {lead ? (
          <p className="ph-lead" data-r="up">
            {lead}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
