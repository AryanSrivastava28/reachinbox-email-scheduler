import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCampaign } from "../services/campaigns";
import { ApiError } from "../services/api";
import { campaignStore } from "../utils/campaignStore";
import { formatDateTime, formatDelayMs } from "../utils/format";
import { EmailJobTable } from "../components/EmailJobTable";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { PageLoader } from "../components/Loading";
import { StatusBadge } from "../components/StatusBadge";
import type { EmailCampaign, EmailJobStatus } from "../types/api";

export function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCampaign(id);
      setCampaign(data);
      campaignStore.upsert({
        id: data.id,
        subject: data.subject,
        totalEmails: data.totalEmails,
        createdAt: data.createdAt,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load campaign");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  const counts = useMemo(() => {
    const base: Record<EmailJobStatus, number> = {
      scheduled: 0,
      processing: 0,
      sent: 0,
      failed: 0,
    };
    if (!campaign) return base;
    for (const job of campaign.emailJobs) {
      base[job.status] += 1;
    }
    return base;
  }, [campaign]);

  if (loading) return <PageLoader label="Loading campaign…" />;
  if (error)
    return (
      <ErrorState
        title="Campaign unavailable"
        message={error}
        onRetry={() => void load()}
      />
    );
  if (!campaign) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Link to="/campaigns" className="text-sm text-brand-700 hover:underline">
          ← Campaigns
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          {campaign.subject}
        </h1>
        <p className="mt-1 font-mono text-xs text-slate-400">{campaign.id}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(
          [
            ["scheduled", counts.scheduled],
            ["processing", counts.processing],
            ["sent", counts.sent],
            ["failed", counts.failed],
          ] as const
        ).map(([status, n]) => (
          <div
            key={status}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <StatusBadge status={status} />
            <span className="text-lg font-semibold text-slate-900">{n}</span>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Campaign details</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Item label="Start time" value={formatDateTime(campaign.startTime)} />
          <Item
            label="Delay between emails"
            value={formatDelayMs(campaign.delayBetweenEmails)}
          />
          <Item label="Hourly limit" value={String(campaign.hourlyLimit)} />
          <Item label="Total emails" value={String(campaign.totalEmails)} />
          <Item label="Created" value={formatDateTime(campaign.createdAt)} />
        </dl>
        <div className="mt-5">
          <p className="text-sm font-medium text-slate-700">Body</p>
          <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-sans text-sm text-slate-700">
            {campaign.body}
          </pre>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Email jobs</h2>
          <p className="mt-1 text-xs text-slate-500">
            The API returns at most 200 jobs on this endpoint. Failed jobs are only
            visible here — there is no dedicated failed-email list.
          </p>
        </header>
        {campaign.emailJobs.length === 0 ? (
          <EmptyState
            title="No jobs on this campaign"
            description="Jobs should appear after the campaign is created."
          />
        ) : (
          <EmailJobTable jobs={campaign.emailJobs} />
        )}
      </section>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
