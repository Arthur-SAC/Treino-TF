import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";

export function OnboardingGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  // Wrap in array so undefined-loading is distinguishable from undefined-no-row.
  const result = useLiveQuery(async () => {
    const s = await db.settings.get("onboarded");
    return [s] as const;
  }, []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (result === undefined) return; // ainda carregando
    setReady(true);
    const onboarded = Boolean(result[0]?.value);
    if (!onboarded && location.pathname !== "/corpo/onboarding") {
      navigate("/corpo/onboarding", { replace: true });
    }
  }, [result, navigate, location.pathname]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-muted text-sm">Carregando…</span>
      </div>
    );
  }
  return <>{children}</>;
}
