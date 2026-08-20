import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { listSentEmails } from "../services/emails";
import { ApiError } from "../services/api";
import type { EmailJob, Paginated } from "../types/api";
import { EmailJobTable } from "../components/EmailJobTable";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Pagination } from "../components/Pagination";
import { TableSkeleton } from "../components/Loading";

const LIMIT = 50;

export function SentEmailsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<EmailJob> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(nextPage: number) {
    setLoading(true);
    setError(null);
    try {
      const result = await listSentEmails(nextPage, LIMIT);
      setData(result);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load sent emails");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(page);
  }, [page]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Sent emails
      </h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Only jobs with status <code className="font-mono text-xs">sent</code>. There
        is no failed-email list on the API.
      </p>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <TableSkeleton /> : null}
        {!loading && error ? (
          <ErrorState message={error} onRetry={() => void load(page)} />
        ) : null}
        {!loading && !error && data && data.items.length === 0 ? (
          <EmptyState
            icon={<Send className="h-6 w-6" />}
            title="No sent emails yet"
            description="After the worker delivers a job, it will show up here."
            action={
              <Link
                to="/emails/scheduled"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800"
              >
                View scheduled
              </Link>
            }
          />
        ) : null}
        {!loading && !error && data && data.items.length > 0 ? (
          <>
            <EmailJobTable jobs={data.items} showCampaignLink />
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              limit={data.limit}
              onPageChange={setPage}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
