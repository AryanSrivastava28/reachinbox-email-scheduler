import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "brand" | "sky" | "emerald" | "amber" | "rose" | "slate";
  footer?: ReactNode;
}

const tones = {
  brand: "bg-brand-50 text-brand-700",
  sky: "bg-sky-50 text-sky-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  slate: "bg-slate-100 text-slate-700",
};

export function DashboardCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "brand",
  footer,
}: DashboardCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}
