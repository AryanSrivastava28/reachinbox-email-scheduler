import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CalendarClock,
  MailPlus,
  Send,
  Inbox,
} from "lucide-react";
import { DashboardCard } from "../components/DashboardCard";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { PageLoader } from "../components/Loading";
import { StatusBadge } from "../components/StatusBadge";
import { listScheduledEmails, listSentEmails } from "../services/emails";
import { getCampaign } from "../services/campaigns";
import { ApiError } from "../services/api";
import { campaignStore } from "../utils/campaignStore";
import { formatDateTime } from "../utils/format";
import type { EmailJob, StoredCampaign } from "../types/api";

export function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduledTotal, setScheduledTotal] = useState(0);
  const [sentTotal, setSentTotal] = useState(0);
  const [recentScheduled, setRecentScheduled] = useState<EmailJob[]>([]);
  const [recentSent, setRecentSent] = useState<EmailJob[]>([]);
  const [campaigns, setCampaigns] = useState<StoredCampaign[]>([]);
  const [failedFromDetails, setFailedFromDetails] = useState<number | null>(null);
  const [processingFromDetails, setProcessingFromDetails] = useState<number | null>(
    null,
  );
  const [detailCoverage, setDetailCoverage] = useState(0);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const known = campaignStore.list();
      setCampaigns(known);

      const [scheduled, sent] = await Promise.all([
        listScheduledEmails(1, 8),
        listSentEmails(1, 8),
      ]);
      setScheduledTotal(scheduled.total);
      setSentTotal(sent.total);
      setRecentScheduled(scheduled.items);
      setRecentSent(sent.items);

      if (known.length === 0) {
        setFailedFromDetails(null);
        setProcessingFromDetails(null);
        setDetailCoverage(0);
      } else {
        let failed = 0;
        let processing = 0;
        let loaded = 0;
        await Promise.all(
          known.map(async (c) => {
            try {
              const campaign = await getCampaign(c.id);
              loaded += 1;
              for (const job of campaign.emailJobs) {
                if (job.status === "failed") failed += 1;
                if (job.status === "processing") processing += 1;
              }
            } catch {
              /* Campaign may belong to another session or be missing */
            }
          }),
        );
        setFailedFromDetails(failed);
        setProcessingFromDetails(processing);
        setDetailCoverage(loaded);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <PageLoader label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  const recent = [...recentScheduled, ...recentSent]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Counts come from list endpoints and campaigns you have opened or created
            in this browser. There is no dedicated statistics API.
          </p>
        </div>
        <Link
          to="/campaigns/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-800"
        >
          <MailPlus className="h-4 w-4" />
          Create campaign
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Known campaigns"
          value={campaigns.length}
          hint="Tracked locally after create/open — backend has no campaign list."
          icon={Inbox}
          tone="brand"
        />
        <DashboardCard
          title="Scheduled"
          value={scheduledTotal}
          hint="GET /api/emails/scheduled total"
          icon={CalendarClock}
          tone="sky"
        />
        <DashboardCard
          title="Sent"
          value={sentTotal}
          hint="GET /api/emails/sent total"
          icon={Send}
          tone="emerald"
        />
        <DashboardCard
          title="Failed (from details)"
          value={failedFromDetails === null ? "—" : failedFromDetails}
          hint={
            failedFromDetails === null
              ? "Open or create a campaign to see failed jobs."
              : `From ${detailCoverage} campaign detail fetch${detailCoverage === 1 ? "" : "es"} (max 200 jobs each). Processing: ${processingFromDetails ?? 0}.`
          }
          icon={AlertTriangle}
          tone="rose"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent activity</h2>
            <div className="flex gap-3 text-sm">
              <Link to="/emails/scheduled" className="text-brand-700 hover:underline">
                Scheduled
              </Link>
              <Link to="/emails/sent" className="text-brand-700 hover:underline">
                Sent
              </Link>
            </div>
          </header>
          {recent.length === 0 ? (
            <EmptyState
              title="No email jobs yet"
              description="Create a campaign to queue scheduled emails. Activity will appear here from the scheduled and sent lists."
              action={
                <Link
                  to="/campaigns/new"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  New campaign
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {job.recipient}
                    </p>
                    <p className="truncate text-xs text-slate-500">{job.subject}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={job.status} />
                    <span className="text-xs text-slate-400">
                      {formatDateTime(job.updatedAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <header className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent campaigns
            </h2>
          </header>
          {campaigns.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-6 w-6" />}
              title="None tracked yet"
              description="The API does not list campaigns. IDs are stored in this browser after you create or open one."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {campaigns.slice(0, 8).map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/campaigns/${c.id}`}
                    className="block px-5 py-3 hover:bg-slate-50"
                  >
                    <p className="truncate text-sm font-medium text-slate-900">
                      {c.subject}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.totalEmails} emails · {formatDateTime(c.createdAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
