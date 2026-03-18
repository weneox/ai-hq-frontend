import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuthMe } from "../../api/auth.js";
import { getAppBootstrap } from "../../api/app.js";

function isSetupPath(pathname = "") {
  return pathname === "/setup" || pathname.startsWith("/setup/");
}

export default function UserRouteGuard({ children }) {
  const location = useLocation();

  const [state, setState] = useState({
    loading: true,
    ok: false,
    redirectTo: "",
  });

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const auth = await getAuthMe();
        if (!alive) return;

        if (!auth?.authenticated) {
          setState({
            loading: false,
            ok: false,
            redirectTo: "",
          });
          return;
        }

        let redirectTo = "";

        try {
          const boot = await getAppBootstrap();
          const workspace = boot?.workspace || {};
          const setupCompleted = !!workspace.setupCompleted;
          const setupTarget =
            workspace.nextSetupRoute ||
            workspace.initialRoute ||
            "/setup/business";

          const onSetup = isSetupPath(location.pathname);

          if (!setupCompleted && !onSetup) {
            redirectTo = setupTarget;
          } else if (setupCompleted && onSetup) {
            redirectTo = "/";
          }
        } catch {
          redirectTo = "";
        }

        if (!alive) return;

        setState({
          loading: false,
          ok: true,
          redirectTo,
        });
      } catch {
        if (!alive) return;

        setState({
          loading: false,
          ok: false,
          redirectTo: "",
        });
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, [location.pathname]);

  if (state.loading) return null;

  if (!state.ok) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (state.redirectTo && state.redirectTo !== location.pathname) {
    return <Navigate to={state.redirectTo} replace />;
  }

  return children;
}