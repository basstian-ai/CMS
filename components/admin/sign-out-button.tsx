"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export function AdminSignOutButton() {
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  const handleSignOut = async () => {
    setStatus("loading");
    await supabaseBrowserClient.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <Button
      variant="secondary"
      onClick={handleSignOut}
      disabled={status === "loading"}
    >
      Logg ut
    </Button>
  );
}
