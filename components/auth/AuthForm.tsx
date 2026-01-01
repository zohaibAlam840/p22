"use client";

import React from "react";
import { useAuth } from "@/lib/auth/auth-store";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const init = useAuth((s) => s.init);

  React.useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, [init]);

  return <>{children}</>;
}
