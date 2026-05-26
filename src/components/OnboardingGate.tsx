import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../lib/db";

export function OnboardingGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    db.settings
      .get("onboarded")
      .then((s) => {
        if (!mounted) return;
        const onboarded = Boolean(s?.value);
        if (!onboarded && location.pathname !== "/corpo/onboarding") {
          navigate("/corpo/onboarding", { replace: true });
        }
        setReady(true);
      })
      .catch(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, [navigate, location.pathname]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-muted text-sm">Carregando…</span>
      </div>
    );
  }
  return <>{children}</>;
}
