import { Link } from "react-router-dom";
import type { EmailJob } from "../types/api";
import { formatDateTime } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

interface EmailJobTableProps {
  jobs: EmailJob[];
  showCampaignLink?: boolean;
}

export function EmailJobTable({ jobs, showCampaignLink }: EmailJobTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Recipient</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Scheduled</th>
              <th className="px-4 py-3">Sent</th>
              <th className="px-4 py-3">Attempts</th>
              {showCampaignLink ? <th className="px-4 py-3">Campaign</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {job.recipient}
                  {job.errorMessage ? (
                    <p className="mt-1 max-w-xs text-xs font-normal text-rose-600">
                      {job.errorMessage}
                    </p>
                  ) : null}
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 text-slate-600">
                  {job.subject}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={job.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatDateTime(job.scheduledAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatDateTime(job.sentAt)}
                </td>
                <td className="px-4 py-3 text-slate-600">{job.attempts}</td>
                {showCampaignLink ? (
                  <td className="px-4 py-3">
                    <Link
                      to={`/campaigns/${job.campaignId}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {jobs.map((job) => (
          <article
            key={job.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-slate-900">{job.recipient}</p>
              <StatusBadge status={job.status} />
            </div>
            <p className="mt-1 truncate text-sm text-slate-500">{job.subject}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div>
                <dt className="uppercase tracking-wide">Scheduled</dt>
                <dd className="mt-0.5 text-slate-800">
                  {formatDateTime(job.scheduledAt)}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wide">Sent</dt>
                <dd className="mt-0.5 text-slate-800">
                  {formatDateTime(job.sentAt)}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wide">Attempts</dt>
                <dd className="mt-0.5 text-slate-800">{job.attempts}</dd>
              </div>
            </dl>
            {job.errorMessage ? (
              <p className="mt-2 text-xs text-rose-600">{job.errorMessage}</p>
            ) : null}
            {showCampaignLink ? (
              <Link
                to={`/campaigns/${job.campaignId}`}
                className="mt-3 inline-block text-sm font-medium text-brand-700"
              >
                Open campaign
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </>
  );
}
