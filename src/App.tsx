import { Outlet } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { OnboardingGate } from "./components/OnboardingGate";

function App() {
  return (
    <OnboardingGate>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </OnboardingGate>
  );
}

export default App;
