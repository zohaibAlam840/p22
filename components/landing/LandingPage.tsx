"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMe } from "@/lib/hooks/useMe";

import NavBar from "./NavBar";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import SecurityCTA from "./SecurityCTA";
import Footer from "./Footer";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useMe();

  const primaryHref = user ? "/dashboard" : "/login";
  const primaryLabel = user ? "Go to Dashboard" : "Get Started";

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-200/40 via-orange-200/20 to-transparent blur-3xl" />
        <div className="absolute top-40 -left-24 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-sky-200/35 via-indigo-200/15 to-transparent blur-3xl" />
        <div className="absolute top-72 -right-24 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-emerald-200/25 via-teal-200/10 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.04),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <NavBar user={user} loading={loading} />

      <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-10 pb-16">
        <Hero
          user={user}
          loading={loading}
          primaryLabel={primaryLabel}
          onPrimary={() => router.push(primaryHref)}
        />


        <section id="how" className="mt-14 sm:mt-20">
          <HowItWorks />
        </section>

        <section id="security" className="mt-14 sm:mt-20">
          <SecurityCTA
            primaryLabel={primaryLabel}
            loading={loading}
            onPrimary={() => router.push(primaryHref)}
          />
        </section>

        <Footer />
      </main>
    </div>
  );
}
