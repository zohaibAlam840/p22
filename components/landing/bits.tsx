"use client";

import React from "react";

export function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-background/70 backdrop-blur px-4 py-3 shadow-sm">
      <div className="h-10 w-10 rounded-xl bg-muted grid place-items-center">{icon}</div>
      <div className="leading-tight">
        <div className="text-sm font-medium">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export function MiniChart() {
  const bars = [28, 40, 18, 55, 30, 45];
  return (
    <div className="mt-3 flex items-end gap-2 h-20">
      {bars.map((h, i) => (
        <div key={i} className="w-6 rounded-lg bg-muted" style={{ height: `${h}%` }} />
      ))}
      <div className="w-6 rounded-lg bg-foreground" style={{ height: "70%" }} />
      <div className="w-6 rounded-lg bg-muted" style={{ height: "35%" }} />
    </div>
  );
}
