import type { EmailJobStatus } from "../types/api";

const styles: Record<EmailJobStatus, string> = {
  scheduled:
    "bg-sky-50 text-sky-800 ring-sky-200",
  processing:
    "bg-amber-50 text-amber-800 ring-amber-200",
  sent: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  failed: "bg-rose-50 text-rose-800 ring-rose-200",
};

export function StatusBadge({ status }: { status: EmailJobStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${styles[status]}`}
    >
      {status}
    </span>
  );
}
