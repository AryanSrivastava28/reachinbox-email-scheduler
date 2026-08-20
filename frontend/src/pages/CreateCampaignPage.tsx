import { CampaignForm } from "../components/CampaignForm";

export function CreateCampaignPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Create campaign
      </h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Posts to <code className="font-mono text-xs">/api/campaigns</code> with your
        session cookie. Delay is submitted in milliseconds.
      </p>
      <CampaignForm />
    </div>
  );
}
