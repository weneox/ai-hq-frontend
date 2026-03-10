import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/layout/Shell.jsx";
import AdminShell from "./components/admin/AdminShell.jsx";
import AdminRouteGuard from "./components/admin/AdminRouteGuard.jsx";

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

import AdminLogin from "./pages/AdminLogin.jsx";
import AdminTenants from "./pages/AdminTenants.jsx";
import AdminTeam from "./pages/AdminTeam.jsx";
import AdminSecrets from "./pages/AdminSecrets.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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

        <Route element={<Shell />}>
          <Route index element={<CommandPage />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="proposals" element={<Proposals />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="leads" element={<Leads />} />
          <Route path="comments" element={<Comments />} />
          <Route path="executions" element={<Executions />} />
          <Route path="agents" element={<Agents />} />
          <Route path="threads" element={<Threads />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}