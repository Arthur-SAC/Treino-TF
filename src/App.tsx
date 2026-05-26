import { Outlet } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
