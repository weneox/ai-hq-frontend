import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/layout/Shell.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Proposals from "./pages/Proposals.jsx";
import Executions from "./pages/Executions.jsx";
import Agents from "./pages/Agents.jsx";
import Threads from "./pages/Threads.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/executions" element={<Executions />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/threads" element={<Threads />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}