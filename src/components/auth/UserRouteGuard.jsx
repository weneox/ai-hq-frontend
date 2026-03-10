// src/components/auth/UserRouteGuard.jsx

import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuthMe } from "../../api/auth.js";

export default function UserRouteGuard({ children }) {
  const location = useLocation();
  const [state, setState] = useState({
    loading: true,
    ok: false,
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const j = await getAuthMe();
        if (!alive) return;

        const userOk = !!j?.authenticated?.user;
        setState({
          loading: false,
          ok: userOk,
        });
      } catch {
        if (!alive) return;
        setState({
          loading: false,
          ok: false,
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [location.pathname]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center">
        <div className="text-sm text-slate-400">Loading workspace...</div>
      </div>
    );
  }

  if (!state.ok) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}