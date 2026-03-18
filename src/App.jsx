import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/layout/Shell.jsx";
import AdminShell from "./components/admin/AdminShell.jsx";
import AdminRouteGuard from "./components/admin/AdminRouteGuard.jsx";
import UserRouteGuard from "./components/auth/UserRouteGuard.jsx";
import GuestRouteGuard from "./components/guards/GuestRouteGuard.jsx";

import CommandPage from "./pages/CommandPage.jsx";
import Proposals from "./pages/Proposals.jsx";
import Executions from "./pages/Executions.jsx";
import Agents from "./pages/Agents.jsx";
import Threads from "./pages/Threads.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";
import Inbox from "./pages/Inbox.jsx";
import Leads from "./pages/Leads.jsx";
import Comments from "./pages/Comments.jsx";
import Voice from "./pages/Voice.jsx";
import Login from "./pages/Login.jsx";
import SetupStudio from "./pages/SetupStudio.jsx";

import AdminLogin from "./pages/AdminLogin.jsx";
import AdminTenants from "./pages/AdminTenants.jsx";
import AdminTeam from "./pages/AdminTeam.jsx";
import AdminSecrets from "./pages/AdminSecrets.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRouteGuard>
              <Login />
            </GuestRouteGuard>
          }
        />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <AdminRouteGuard>
              <AdminShell />
            </AdminRouteGuard>
          }
        >
          <Route index element={<Navigate to="/admin/tenants" replace />} />
          <Route path="tenants" element={<AdminTenants />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="secrets" element={<AdminSecrets />} />
        </Route>

        <Route
          path="/"
          element={
            <UserRouteGuard>
              <Shell />
            </UserRouteGuard>
          }
        >
          <Route path="setup" element={<Navigate to="/setup/studio" replace />} />
          <Route path="setup/studio" element={<SetupStudio />} />

          {/*
            Backend hələ klassik nextSetupRoute qaytara bilər:
            /setup/business
            /setup/knowledge
            /setup/services
            və s.
            Ona görə bunların hamısını studio-ya redirect edirik ki
            backend dəyişmədən yeni onboarding işləsin.
          */}
          <Route path="setup/business" element={<Navigate to="/setup/studio" replace />} />
          <Route path="setup/channels" element={<Navigate to="/setup/studio" replace />} />
          <Route path="setup/knowledge" element={<Navigate to="/setup/studio" replace />} />
          <Route path="setup/services" element={<Navigate to="/setup/studio" replace />} />
          <Route path="setup/playbooks" element={<Navigate to="/setup/studio" replace />} />
          <Route path="setup/runtime" element={<Navigate to="/setup/studio" replace />} />

          <Route index element={<CommandPage />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="proposals" element={<Proposals />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="leads" element={<Leads />} />
          <Route path="comments" element={<Comments />} />
          <Route path="voice" element={<Voice />} />
          <Route path="executions" element={<Executions />} />
          <Route path="agents" element={<Agents />} />
          <Route path="threads" element={<Threads />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}