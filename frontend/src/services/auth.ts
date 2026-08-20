import type { User } from "../types/api";
import { API_URL, apiFetch } from "./api";

export function startGoogleLogin(redirectPath = "/"): void {
  const redirect = `${window.location.origin}${redirectPath}`;
  const url = new URL("/api/auth/google", API_URL);
  url.searchParams.set("redirect", redirect);
  window.location.href = url.toString();
}

export function getMe(): Promise<User> {
  return apiFetch<User>("/api/auth/me");
}

export function logout(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
}
