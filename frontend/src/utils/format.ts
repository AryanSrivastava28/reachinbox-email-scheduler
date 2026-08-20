export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDelayMs(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  if (ms % 60000 === 0) return `${ms / 60000} min (${ms} ms)`;
  if (ms % 1000 === 0) return `${ms / 1000} s (${ms} ms)`;
  return `${ms} ms`;
}

export function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function datetimeLocalToIso(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid start time");
  }
  return date.toISOString();
}

export function delayToMilliseconds(
  value: number,
  unit: "ms" | "s" | "min",
): number {
  if (unit === "ms") return Math.round(value);
  if (unit === "s") return Math.round(value * 1000);
  return Math.round(value * 60 * 1000);
}

export function plural(count: number, singular: string, pluralForm?: string): string {
  return count === 1 ? singular : (pluralForm ?? `${singular}s`);
}
