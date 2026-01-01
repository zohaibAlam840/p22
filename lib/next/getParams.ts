export async function getParam(ctx: any, key: string): Promise<string | null> {
  const p = ctx?.params;
  if (!p) return null;

  const paramsObj = typeof p?.then === "function" ? await p : p;
  const v = paramsObj?.[key];

  return typeof v === "string" && v.length ? v : null;
}
export async function readRouteParams(ctx: any): Promise<Record<string, string>> {
  const p = ctx?.params;
  if (!p) return {};
  return typeof p?.then === "function" ? await p : p;
}

export async function readParam(ctx: any, key: string): Promise<string | null> {
  const params = await readRouteParams(ctx);
  return params[key] ?? null;
}
