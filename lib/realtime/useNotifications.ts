"use client";

import * as React from "react";

export type NotificationPayload =
  | {
      type: "TASK_ASSIGNED";
      taskId: string;
      title: string;
      projectId: string;
      byUserId: string;
    }
  | {
      type: "TASK_UNASSIGNED";
      taskId: string;
      title: string;
      projectId: string;
      byUserId: string;
    }
  | {
      type: "TASK_UPDATED";
      taskId: string;
      title: string;
      projectId: string;
      message?: string;
      byUserId: string;
    }
  | {
      type: "TASK_DELETED";
      taskId: string;
      title: string;
      projectId: string;
      byUserId: string;
    }
  | {
      type: string;
      [k: string]: any;
    };

type NotifItem = {
  id: string;
  at: number;
  payload: NotificationPayload;
};

function safeJsonParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

export function useNotifications() {
  const [items, setItems] = React.useState<NotifItem[]>([]);
  const [unread, setUnread] = React.useState(0);

  React.useEffect(() => {
    let closed = false;
    let es: EventSource | null = null;
    let retry = 0;
    let retryTimer: any = null;

    const connect = () => {
      if (closed) return;

      es = new EventSource("/api/notifications/stream");

      es.addEventListener("notif", (evt: MessageEvent) => {
        const payload = safeJsonParse(evt.data);
        if (!payload) return;

        const item: NotifItem = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          at: Date.now(),
          payload,
        };

        setItems((prev) => [item, ...prev].slice(0, 30));
        setUnread((u) => u + 1);
      });

      es.addEventListener("error", () => {
        // EventSource auto-retries, but in dev/turbopack it can get stuck.
        // We do a manual close + backoff reconnect.
        try {
          es?.close();
        } catch {}
        es = null;

        retry += 1;
        const wait = Math.min(2000 * retry, 15000);
        retryTimer = setTimeout(connect, wait);
      });

      es.addEventListener("open", () => {
        retry = 0;
      });
    };

    connect();

    return () => {
      closed = true;
      if (retryTimer) clearTimeout(retryTimer);
      try {
        es?.close();
      } catch {}
    };
  }, []);

  function markAllRead() {
    setUnread(0);
  }

  function clearAll() {
    setItems([]);
    setUnread(0);
  }

  return { items, unread, markAllRead, clearAll };
}
