import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { OnboardingGate } from "./components/OnboardingGate";
import { startScheduler, stopScheduler } from "./lib/notification-scheduler";
import { useLembretes } from "./lib/lembretes/useLembretes";
import { isNativo } from "./lib/plataforma";

function App() {
  useLembretes();
  useEffect(() => {
    // No APK quem agenda é o Android (useLembretes); o setInterval da página
    // não roda com o app fechado e o `new Notification` não existe no WebView.
    if (isNativo()) return;
    startScheduler();
    return () => stopScheduler();
  }, []);

  return (
    <OnboardingGate>
      <div className="h-screen flex flex-col">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </OnboardingGate>
  );
}

export default App;
