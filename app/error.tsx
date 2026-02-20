"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-layout py-16">
      <h2 className="text-2xl font-semibold text-stone-900">Noe gikk galt</h2>
      <p className="mt-3 text-stone-700">
        {error.message || "En uventet feil oppstod."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white"
      >
        Prøv igjen
      </button>
    </div>
  );
}
