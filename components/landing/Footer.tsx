"use client";

import Link from "next/link";
import { toast } from "sonner";

export default function Footer() {
  return (
    <footer className="mt-14 border-t pt-8 text-sm text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>© {new Date().getFullYear()} Workspace Task Manager</div>
      <div className="flex gap-4">
        <Link className="hover:underline" href="/login">Login</Link>
        <Link className="hover:underline" href="/signup">Sign up</Link>
        <button
          className="hover:underline"
          onClick={() => toast.message("Tip: Use Dashboard → Create workspace to begin.")}
        >
          Help
        </button>
      </div>
    </footer>
  );
}
