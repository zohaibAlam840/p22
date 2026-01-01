"use client";

import React from "react";

export type MeUser = { id: string; name: string; email: string } | null;

export function useMe() {
  const [user, setUser] = React.useState<MeUser>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = (await res.json()) as { user: MeUser };
        if (mounted) setUser(data.user ?? null);
      } catch {
        // silent
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading };
}
