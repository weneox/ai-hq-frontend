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

    async function checkAuth() {
      try {
        const j = await getAuthMe();
        if (!alive) return;

        setState({
          loading: false,
          ok: !!j?.authenticated,
        });
      } catch {
        if (!alive) return;

        setState({
          loading: false,
          ok: false,
        });
      }
    }

    checkAuth();

    return () => {
      alive = false;
    };
  }, [location.pathname]);

  if (state.loading) return null;

  if (!state.ok) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}