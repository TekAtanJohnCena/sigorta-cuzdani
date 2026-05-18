export function getToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("emre_admin_token") || "";
}

export function adminHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-admin-token": getToken(),
  };
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("emre_admin_token");
  document.cookie = "admin_token=; path=/; max-age=0";
}
