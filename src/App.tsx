import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { OnboardingGate } from "./components/OnboardingGate";
import { startScheduler, stopScheduler } from "./lib/notification-scheduler";

function App() {
  useEffect(() => {
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
