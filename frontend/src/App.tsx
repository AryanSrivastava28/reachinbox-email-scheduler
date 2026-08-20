import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { AppLayout } from "./layouts/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CreateCampaignPage } from "./pages/CreateCampaignPage";
import { CampaignsPage } from "./pages/CampaignsPage";
import { CampaignDetailPage } from "./pages/CampaignDetailPage";
import { ScheduledEmailsPage } from "./pages/ScheduledEmailsPage";
import { SentEmailsPage } from "./pages/SentEmailsPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CreateCampaignPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CampaignsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CampaignDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/emails/scheduled"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ScheduledEmailsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/emails/sent"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SentEmailsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
