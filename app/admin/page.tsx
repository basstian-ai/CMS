
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminPage() {
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  const handleSignOut = async () => {
    setStatus("loading");
    await supabaseBrowserClient.auth.signOut();
    window.location.href = "/admin/login";
  };


  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Velkommen!</h2>
      <p className="text-sm text-slate-300">
        Dette er startpunktet for admin. Neste steg er å koble til Supabase Auth
        og sette opp CRUD-visninger for innhold.
      </p>
      <Button
        variant="secondary"
        onClick={handleSignOut}
        disabled={status === "loading"}
      >
        Logg ut
      </Button>

    </div>
  );
}
