"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthState = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  init: () => () => void; // returns unsubscribe cleanup
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  refresh: async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      set({ user: null, loading: false });
      return;
    }
    set({ user: data.user ?? null, loading: false });
  },

  init: () => {
    const supabase = createSupabaseBrowserClient();

    // initial fetch
    supabase.auth.getUser().then(({ data }) => {
      set({ user: data.user ?? null, loading: false });
    });

    // keep in sync
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, loading: false });
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  },
}));
