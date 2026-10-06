import { previewClient } from "@/lib/preview";

export const dynamic = "force-dynamic";

export default async function PreviewGate({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const client = previewClient();
  return (
    <main className="gate">
      <div className="gate-sun" aria-hidden="true" />
      <div className="gate-card">
        {/* biome-ignore lint/performance/noImgElement: static brand asset */}
        <img src="/brand/changan-logo-blue.webp" alt="Changan" width={160} height={33} />
        <span className="lab">Private preview</span>
        <h1>Prepared for {client}</h1>
        {p.expired ? (
          <p className="gate-msg">
            This preview link has expired. Please contact Mondobase for a new one.
          </p>
        ) : (
          <>
            <p>
              This is a confidential design preview by Mondobase. Please use the personal link you
              were sent, or enter your access code.
            </p>
            {p.denied ? <p className="gate-msg">That code was not recognised.</p> : null}
            <form method="post" action="/preview/enter" className="gate-form">
              <label htmlFor="code" className="sr-only">
                Access code
              </label>
              <input
                id="code"
                name="code"
                placeholder="Access code"
                autoComplete="off"
                autoCapitalize="characters"
                required
              />
              <button className="btn pri" type="submit">
                Open preview <i>→</i>
              </button>
            </form>
          </>
        )}
        <small>
          © {new Date().getFullYear()} Mondobase. This preview and its designs are confidential and
          remain the property of Mondobase until agreed otherwise. Please do not copy, share, record
          or distribute it.
        </small>
      </div>
    </main>
  );
}
