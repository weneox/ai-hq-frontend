import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/layout/Shell.jsx";
import AdminShell from "./components/admin/AdminShell.jsx";
import AdminRouteGuard from "./components/admin/AdminRouteGuard.jsx";
import UserRouteGuard from "./components/auth/UserRouteGuard.jsx";
import GuestRouteGuard from "./components/guards/GuestRouteGuard.jsx";

const CommandPage = lazy(() => import("./pages/CommandPage.jsx"));
const Proposals = lazy(() => import("./pages/Proposals.jsx"));
const Executions = lazy(() => import("./pages/Executions.jsx"));
const Agents = lazy(() => import("./pages/Agents.jsx"));
const Threads = lazy(() => import("./pages/Threads.jsx"));
const Analytics = lazy(() => import("./pages/Analytics.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const Inbox = lazy(() => import("./pages/Inbox.jsx"));
const Leads = lazy(() => import("./pages/Leads.jsx"));
const Comments = lazy(() => import("./pages/Comments.jsx"));
const Voice = lazy(() => import("./pages/Voice.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const TruthViewerPage = lazy(() => import("./pages/Truth/TruthViewerPage.jsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.jsx"));
const AdminTenants = lazy(() => import("./pages/AdminTenants.jsx"));
const AdminTeam = lazy(() => import("./pages/AdminTeam.jsx"));
const AdminSecrets = lazy(() => import("./pages/AdminSecrets.jsx"));
const SetupStudioRoute = lazy(() => import("./pages/SetupStudio/index.jsx"));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-6 py-10">
      <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 backdrop-blur-xl">
        Loading...
      </div>
    </div>
  );
}

function withSuspense(element) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRouteGuard>
              {withSuspense(<Login />)}
            </GuestRouteGuard>
          }
        />

        <Route path="/admin/login" element={withSuspense(<AdminLogin />)} />

        <Route
          path="/admin"
          element={
            <AdminRouteGuard>
              <AdminShell />
            </AdminRouteGuard>
          }
        >
          <Route index element={<Navigate to="/admin/tenants" replace />} />
          <Route path="tenants" element={withSuspense(<AdminTenants />)} />
          <Route path="team" element={withSuspense(<AdminTeam />)} />
          <Route path="secrets" element={withSuspense(<AdminSecrets />)} />
        </Route>

        <Route
          path="/setup/studio"
          element={
            <UserRouteGuard>
              {withSuspense(<SetupStudioRoute />)}
            </UserRouteGuard>
          }
        />

        <Route
          path="/setup"
          element={
            <UserRouteGuard>
              <Navigate to="/setup/studio" replace />
            </UserRouteGuard>
          }
        />

        <Route
          path="/setup/business"
          element={
            <UserRouteGuard>
              <Navigate to="/setup/studio" replace />
            </UserRouteGuard>
          }
        />

        <Route
          path="/setup/channels"
          element={
            <UserRouteGuard>
              <Navigate to="/setup/studio" replace />
            </UserRouteGuard>
          }
        />

        <Route
          path="/setup/knowledge"
          element={
            <UserRouteGuard>
              <Navigate to="/setup/studio" replace />
            </UserRouteGuard>
          }
        />

        <Route
          path="/setup/services"
          element={
            <UserRouteGuard>
              <Navigate to="/setup/studio" replace />
            </UserRouteGuard>
          }
        />

        <Route
          path="/setup/playbooks"
          element={
            <UserRouteGuard>
              <Navigate to="/setup/studio" replace />
            </UserRouteGuard>
          }
        />

        <Route
          path="/setup/runtime"
          element={
            <UserRouteGuard>
              <Navigate to="/setup/studio" replace />
            </UserRouteGuard>
          }
        />

        <Route
          path="/"
          element={
            <UserRouteGuard>
              <Shell />
            </UserRouteGuard>
          }
        >
          <Route index element={withSuspense(<CommandPage />)} />
          <Route path="proposals" element={withSuspense(<Proposals />)} />
          <Route path="inbox" element={withSuspense(<Inbox />)} />
          <Route path="leads" element={withSuspense(<Leads />)} />
          <Route path="comments" element={withSuspense(<Comments />)} />
          <Route path="voice" element={withSuspense(<Voice />)} />
          <Route path="truth" element={withSuspense(<TruthViewerPage />)} />
          <Route path="executions" element={withSuspense(<Executions />)} />
          <Route path="settings" element={withSuspense(<Settings />)} />
          <Route path="analytics" element={withSuspense(<Analytics />)} />
          <Route path="agents" element={withSuspense(<Agents />)} />
          <Route path="threads" element={withSuspense(<Threads />)} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
