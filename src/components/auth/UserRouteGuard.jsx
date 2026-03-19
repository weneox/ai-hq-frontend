import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuthMe } from "../../api/auth.js";
import { getAppBootstrap } from "../../api/app.js";

function isSetupPath(pathname = "") {
  return pathname === "/setup" || pathname.startsWith("/setup/");
}

function normalizeSetupRoute(target = "") {
  const value = String(target || "").trim();

  if (!value) return "/setup/studio";
  if (value === "/setup") return "/setup/studio";
  if (value.startsWith("/setup/")) return "/setup/studio";

  return value;
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
          const onSetup = isSetupPath(location.pathname);

          if (setupCompleted) {
            if (onSetup) {
              redirectTo = "/";
            }
          } else {
            if (location.pathname === "/setup") {
              redirectTo = "/setup/studio";
            } else if (
              onSetup &&
              location.pathname !== normalizeSetupRoute(location.pathname)
            ) {
              redirectTo = "/setup/studio";
            } else {
              redirectTo = "";
            }
          }
        } catch {
          const onSetup = isSetupPath(location.pathname);

          if (location.pathname === "/setup") {
            redirectTo = "/setup/studio";
          } else if (onSetup && location.pathname !== "/setup/studio") {
            redirectTo = "/setup/studio";
          } else {
            redirectTo = "";
          }
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