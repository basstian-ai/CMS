"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/admin`
      : undefined;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const { error: signInError } = await supabaseBrowserClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setStatus("idle");
      return;
    }

    setStatus("sent");
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Logg inn</p>
        <h2 className="text-2xl font-semibold text-slate-100">Bykirken CMS</h2>
        <p className="text-sm text-slate-300">
          Bruk e-postadressen din for å få en magic link til admin.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm text-slate-200">
          E-post
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100"
            placeholder="navn@bykirken.no"
          />
        </label>
        <Button
          type="submit"
          disabled={status === "loading" || status === "sent"}
          className="w-full justify-center"
        >
          {status === "loading" ? "Sender..." : "Send magic link"}
        </Button>
      </form>

      {status === "sent" && (
        <p className="text-sm text-emerald-400">
          Sjekk e-posten din for en innloggingslenke.
        </p>
      )}

      {error && <p className="text-sm text-rose-400">{error}</p>}
    </div>
  );
}
