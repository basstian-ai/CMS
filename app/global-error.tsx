"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="no">
      <body>
        <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
          <h1>Det oppstod en kritisk feil</h1>
          <p>{error.message || "Prøv igjen."}</p>
          <button type="button" onClick={() => reset()}>
            Last på nytt
          </button>
        </main>
      </body>
    </html>
  );
}
