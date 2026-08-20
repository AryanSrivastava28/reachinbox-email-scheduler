import type { ApiFailure, ApiSuccess, ValidationDetail } from "../types/api";

export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  status: number;
  details?: ValidationDetail[];

  constructor(
    message: string,
    status: number,
    details?: ValidationDetail[],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type JsonBody = unknown;

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers,
    });
  } catch {
    throw new ApiError(
      "Unable to reach the API. Confirm the backend is running on localhost:5000.",
      0,
    );
  }

  let payload: ApiSuccess<T> | ApiFailure | null = null;

  try {
    payload = (await response.json()) as ApiSuccess<T> | ApiFailure;
  } catch {
    payload = null;
  }

  if (response.status === 401) {
    throw new ApiError(
      payload && "error" in payload
        ? payload.error
        : "Authentication required",
      401,
    );
  }

  if (!response.ok) {
    const message =
      payload && "error" in payload
        ? payload.error
        : `Request failed (${response.status})`;

    const details =
      payload && "details" in payload ? payload.details : undefined;

    throw new ApiError(message, response.status, details);
  }

  if (!payload || !("success" in payload) || payload.success !== true) {
    const message =
      payload && "error" in payload
        ? payload.error
        : "Unexpected API response";

    throw new ApiError(message, response.status);
  }

  return payload.data;
}

export function toJsonBody(body: JsonBody): string {
  return JSON.stringify(body);
}