// app/api/notifications/stream/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { subscribe } from "@/lib/realtime/bus";

export const dynamic = "force-dynamic"; 
function sseFormat(event: string, data: any) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(req: NextRequest) {
  const userId = await requireAuth(req);

  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();


      controller.enqueue(enc.encode(sseFormat("ready", { ok: true })));


      const unsubscribe = subscribe(`user:${userId}`, (payload) => {
        controller.enqueue(enc.encode(sseFormat("notif", payload)));
      });

      const keepAlive = setInterval(() => {
        controller.enqueue(enc.encode(sseFormat("ping", { t: Date.now() })));
      }, 25000);


      req.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
