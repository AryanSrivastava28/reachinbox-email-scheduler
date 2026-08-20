import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Gauge,
  Mail,
  Users,
} from "lucide-react";
import { RecipientInput } from "./RecipientInput";
import { Spinner } from "./Loading";
import { createCampaign } from "../services/campaigns";
import { ApiError } from "../services/api";
import { campaignStore } from "../utils/campaignStore";
import {
  datetimeLocalToIso,
  delayToMilliseconds,
  formatDateTime,
  formatDelayMs,
  toDatetimeLocalValue,
} from "../utils/format";

const STEPS = [
  { id: 1, label: "Details", icon: Mail },
  { id: 2, label: "Recipients", icon: Users },
  { id: 3, label: "Schedule", icon: Clock },
  { id: 4, label: "Limits", icon: Gauge },
  { id: 5, label: "Review", icon: Check },
] as const;

type DelayUnit = "ms" | "s" | "min";

export function CampaignForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [startLocal, setStartLocal] = useState(() =>
    toDatetimeLocalValue(new Date(Date.now() + 5 * 60 * 1000)),
  );
  const [delayValue, setDelayValue] = useState(2000);
  const [delayUnit, setDelayUnit] = useState<DelayUnit>("ms");
  const [hourlyLimit, setHourlyLimit] = useState(50);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    campaignId: string;
    totalEmails: number;
  } | null>(null);

  const delayMs = useMemo(
    () => delayToMilliseconds(Number(delayValue) || 0, delayUnit),
    [delayValue, delayUnit],
  );

  function validateStep(current: number): boolean {
    const next: Record<string, string> = {};
    if (current === 1) {
      if (!subject.trim()) next.subject = "Subject is required.";
      else if (subject.trim().length > 200)
        next.subject = "Subject must be 200 characters or fewer.";
      if (!body.trim()) next.body = "Email body is required.";
    }
    if (current === 2) {
      if (recipients.length === 0)
        next.recipients = "Add at least one valid recipient.";
    }
    if (current === 3) {
      if (!startLocal) next.startTime = "Start time is required.";
      else {
        const parsed = new Date(startLocal);
        if (Number.isNaN(parsed.getTime()))
          next.startTime = "Start time must be a valid date.";
      }
      if (!Number.isFinite(delayMs) || delayMs < 0 || !Number.isInteger(delayMs)) {
        next.delay = "Delay must convert to an integer number of milliseconds ≥ 0.";
      }
    }
    if (current === 4) {
      if (!Number.isInteger(hourlyLimit) || hourlyLimit < 1) {
        next.hourlyLimit = "Hourly limit must be an integer of at least 1.";
      }
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(5, s + 1));
  }

  function goBack() {
    setFieldErrors({});
    setStep((s) => Math.max(1, s - 1));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!subject.trim()) next.subject = "Subject is required.";
    else if (subject.trim().length > 200)
      next.subject = "Subject must be 200 characters or fewer.";
    if (!body.trim()) next.body = "Email body is required.";
    if (recipients.length === 0)
      next.recipients = "Add at least one valid recipient.";
    if (!startLocal) next.startTime = "Start time is required.";
    else if (Number.isNaN(new Date(startLocal).getTime()))
      next.startTime = "Start time must be a valid date.";
    if (!Number.isFinite(delayMs) || delayMs < 0 || !Number.isInteger(delayMs)) {
      next.delay = "Delay must convert to an integer number of milliseconds ≥ 0.";
    }
    if (!Number.isInteger(hourlyLimit) || hourlyLimit < 1) {
      next.hourlyLimit = "Hourly limit must be an integer of at least 1.";
    }
    if (Object.keys(next).length > 0) {
      setFieldErrors(next);
      setSubmitError("Please fix the form errors before creating the campaign.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const startTime = datetimeLocalToIso(startLocal);
      const created = await createCampaign({
        subject: subject.trim(),
        body: body.trim(),
        recipients,
        startTime,
        delayBetweenEmails: delayMs,
        hourlyLimit,
      });
      campaignStore.upsert({
        id: created.campaignId,
        subject: subject.trim(),
        totalEmails: created.totalEmails,
        createdAt: new Date().toISOString(),
      });
      setResult(created);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        const detail = err.details?.map((d) => d.message).join(" ");
        setSubmitError(detail ? `${err.message}. ${detail}` : err.message);
      } else {
        setSubmitError("Campaign creation failed.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <Check className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            Campaign queued
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Emails are scheduled in the backend worker. You can inspect individual
            jobs on the campaign page.
          </p>
          <dl className="mt-6 space-y-3 rounded-xl bg-slate-50 p-4 text-left text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Campaign ID</dt>
              <dd className="font-mono text-xs text-slate-800">{result.campaignId}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Total emails</dt>
              <dd className="font-semibold text-slate-900">{result.totalEmails}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => navigate(`/campaigns/${result.campaignId}`)}
            className="mt-6 w-full rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
          >
            View campaign details
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {STEPS.map((item) => {
          const active = step === item.id;
          const done = step > item.id;
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  if (item.id < step || validateStep(step)) setStep(item.id);
                }}
                className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm ${
                  active
                    ? "border-brand-200 bg-brand-50 text-brand-800"
                    : done
                      ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {step === 1 ? (
          <section className="space-y-5">
            <header>
              <h2 className="text-lg font-semibold text-slate-900">
                Campaign details
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                This subject and body are sent to every recipient in the campaign.
              </p>
            </header>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Subject</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Follow-up from ReachInbox"
              />
              <span className="mt-1 block text-xs text-slate-400">
                {subject.length}/200
              </span>
              {fieldErrors.subject ? (
                <p className="mt-1 text-sm text-rose-600">{fieldErrors.subject}</p>
              ) : null}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email body</span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Write the message that will be sent…"
              />
              {fieldErrors.body ? (
                <p className="mt-1 text-sm text-rose-600">{fieldErrors.body}</p>
              ) : null}
            </label>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="space-y-5">
            <header>
              <h2 className="text-lg font-semibold text-slate-900">Recipients</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add addresses one at a time or import a CSV/TXT file.
              </p>
            </header>
            <RecipientInput
              recipients={recipients}
              onChange={setRecipients}
              error={fieldErrors.recipients}
            />
          </section>
        ) : null}

        {step === 3 ? (
          <section className="space-y-5">
            <header>
              <h2 className="text-lg font-semibold text-slate-900">Scheduling</h2>
              <p className="mt-1 text-sm text-slate-500">
                The first email is queued at the start time. Each following email is
                delayed by the amount you set.
              </p>
            </header>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Start time</span>
              <input
                type="datetime-local"
                value={startLocal}
                onChange={(e) => setStartLocal(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              {fieldErrors.startTime ? (
                <p className="mt-1 text-sm text-rose-600">{fieldErrors.startTime}</p>
              ) : null}
            </label>
            <div>
              <span className="text-sm font-medium text-slate-700">
                Delay between emails
              </span>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="number"
                  min={0}
                  step={delayUnit === "ms" ? 1 : delayUnit === "s" ? 1 : 0.1}
                  value={delayValue}
                  onChange={(e) => setDelayValue(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <select
                  value={delayUnit}
                  onChange={(e) => setDelayUnit(e.target.value as DelayUnit)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm"
                >
                  <option value="ms">milliseconds</option>
                  <option value="s">seconds</option>
                  <option value="min">minutes</option>
                </select>
              </div>
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                The API field <code className="font-mono">delayBetweenEmails</code> is
                sent as <strong>{delayMs} milliseconds</strong>
                {delayUnit !== "ms" ? ` (converted from ${delayValue} ${delayUnit})` : ""}
                . This conversion is shown here so the unit is never implicit.
              </p>
              {fieldErrors.delay ? (
                <p className="mt-1 text-sm text-rose-600">{fieldErrors.delay}</p>
              ) : null}
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="space-y-5">
            <header>
              <h2 className="text-lg font-semibold text-slate-900">
                Sending limits
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Hourly limit is required by the API and stored on the campaign. The
                current backend does not enforce it when enqueueing jobs.
              </p>
            </header>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Hourly sending limit
              </span>
              <input
                type="number"
                min={1}
                step={1}
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              {fieldErrors.hourlyLimit ? (
                <p className="mt-1 text-sm text-rose-600">
                  {fieldErrors.hourlyLimit}
                </p>
              ) : null}
            </label>
          </section>
        ) : null}

        {step === 5 ? (
          <section className="space-y-5">
            <header>
              <h2 className="text-lg font-semibold text-slate-900">Review</h2>
              <p className="mt-1 text-sm text-slate-500">
                Confirm the payload that will be posted to{" "}
                <code className="font-mono text-xs">POST /api/campaigns</code>.
              </p>
            </header>
            <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              <Row label="Subject" value={subject || "—"} />
              <Row
                label="Body preview"
                value={body.slice(0, 180) || "—"}
              />
              <Row label="Recipients" value={String(recipients.length)} />
              <Row
                label="Start time"
                value={
                  startLocal
                    ? formatDateTime(new Date(startLocal).toISOString())
                    : "—"
                }
              />
              <Row label="Delay" value={formatDelayMs(delayMs)} />
              <Row label="Hourly limit" value={String(hourlyLimit)} />
            </dl>
            {recipients.length > 0 ? (
              <p className="text-xs text-slate-400">
                First recipients: {recipients.slice(0, 8).join(", ")}
                {recipients.length > 8 ? "…" : ""}
              </p>
            ) : null}
            {submitError ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {submitError}
              </p>
            ) : null}
          </section>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1 || submitting}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          {step < 5 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Spinner className="h-4 w-4 text-white" /> : null}
              {submitting ? "Creating campaign…" : "Create campaign"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:justify-between">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="max-w-xl text-sm font-medium text-slate-900 sm:text-right">
        {value}
      </dd>
    </div>
  );
}
