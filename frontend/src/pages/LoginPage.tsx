import { Navigate, useSearchParams } from "react-router-dom";
import { Send } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { startGoogleLogin } from "../services/auth";
import { PageLoader } from "../components/Loading";

export function LoginPage() {
  const { user, ready, bootstrapError } = useAuth();
  const [params] = useSearchParams();
  const oauthFailed = params.get("error") === "oauth_failed";

  if (!ready) {
    return <PageLoader label="Checking session…" />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-700/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Send className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold text-white">ReachInbox</span>
        </div>
        <div className="relative max-w-md">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-200">
            Email job scheduler
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white">
            Schedule outreach with precision, then let the worker send it.
          </h1>
          <p className="mt-4 text-slate-400">
            Create a campaign, stagger recipients, and watch scheduled jobs move to
            sent — backed by the existing API, Redis queue, and session auth.
          </p>
        </div>
        <p className="relative text-xs text-slate-500">
          Google sign-in uses a full-page redirect to the backend OAuth flow.
        </p>
      </div>
      <div className="flex items-center justify-center bg-[#f4f6fb] px-6 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in with Google to manage campaigns. Sessions are stored in a
            backend cookie — this app never stores auth tokens.
          </p>
          {oauthFailed ? (
            <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              Google sign-in failed. Please try again.
            </p>
          ) : null}
          {bootstrapError ? (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {bootstrapError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => startGoogleLogin("/")}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            <GoogleMark />
            Continue with Google
          </button>
          <p className="mt-6 text-center text-xs text-slate-400">
            You will leave this page and return after Google confirms your account.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.86-.07-1.49-.22-2.14H12v3.89h6.47c-.13 1.05-.83 2.63-2.39 3.69l-.02.14 3.47 2.69.24.02c2.2-2.03 3.47-5.02 3.47-8.29z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.79-2.93c-1.02.71-2.39 1.21-4.16 1.21-3.18 0-5.88-2.09-6.84-4.99l-.14.01-3.7 2.87-.05.13C3.24 21.41 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.16 14.38c-.24-.71-.38-1.47-.38-2.38s.14-1.67.36-2.38l-.01-.16-3.75-2.91-.12.06C.44 8.34 0 10.11 0 12s.44 3.66 1.26 5.39l3.9-3.01z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c2.25 0 3.77.97 4.64 1.78l3.39-3.31C17.95 1.19 15.24 0 12 0 7.31 0 3.24 2.59 1.26 6.61l3.9 3.01C6.12 6.84 8.82 4.75 12 4.75z"
      />
    </svg>
  );
}
