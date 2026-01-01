

type Listener = (payload: any) => void;

const channels = new Map<string, Set<Listener>>();

export function subscribe(channel: string, cb: Listener) {
  if (!channels.has(channel)) channels.set(channel, new Set());
  channels.get(channel)!.add(cb);

  return () => {
    const set = channels.get(channel);
    if (!set) return;
    set.delete(cb);
    if (set.size === 0) channels.delete(channel);
  };
}

export function publish(channel: string, payload: any) {
  const set = channels.get(channel);
  if (!set) return;
  for (const cb of set) cb(payload);
}
