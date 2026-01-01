async function postJSON<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Request failed");
  return data as T;
}

export async function login(email: string, password: string) {
  return postJSON("/api/auth/login", { email, password });
}

export async function register(name: string, email: string, password: string) {
  return postJSON("/api/auth/register", { name, email, password });
}

export async function logout() {
  return postJSON("/api/auth/logout", {});
}

export async function forgotPassword(email: string) {
  return postJSON("/api/auth/forgot-password", { email });
}

export async function updatePassword(password: string) {
  return postJSON("/api/auth/update-password", { password });
}

// NEW: resend email confirmation
export async function resendConfirmation(email: string) {
  return postJSON("/api/auth/resend-confirmation", { email });
}

// OPTIONAL: current user
export async function me() {
  const res = await fetch("/api/auth/me", { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Request failed");
  return data as { user: any | null };
}
