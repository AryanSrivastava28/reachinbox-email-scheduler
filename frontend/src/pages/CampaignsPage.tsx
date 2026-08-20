import { Link } from "react-router-dom";
import { MailPlus } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { campaignStore } from "../utils/campaignStore";
import { formatDateTime } from "../utils/format";

export function CampaignsPage() {
  const campaigns = campaignStore.list();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Campaigns
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            The backend has no campaign index endpoint. This list is built from
            campaigns created or opened in this browser, then loaded with{" "}
            <code className="font-mono text-xs">GET /api/campaigns/:id</code>.
          </p>
        </div>
        <Link
          to="/campaigns/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          <MailPlus className="h-4 w-4" />
          Create campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <EmptyState
            title="No campaigns in this browser yet"
            description="Create a campaign or open one by ID. Failed jobs are only visible on campaign detail — there is no failed-email list API."
            action={
              <Link
                to="/campaigns/new"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Create campaign
              </Link>
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {campaigns.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/campaigns/${c.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{c.subject}</p>
                    <p className="font-mono text-xs text-slate-400">{c.id}</p>
                  </div>
                  <div className="shrink-0 text-right text-sm text-slate-500">
                    <p>{c.totalEmails} emails</p>
                    <p className="text-xs">{formatDateTime(c.createdAt)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
