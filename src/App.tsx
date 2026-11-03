import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { OnboardingGate } from "./components/OnboardingGate";
import { startScheduler, stopScheduler } from "./lib/notification-scheduler";
import { useLembretes } from "./lib/lembretes/useLembretes";
import { isNativo } from "./lib/plataforma";
import { useRolagemPorTela } from "./hooks/useRolagemPorTela";

function App() {
  useLembretes();
  useEffect(() => {
    // No APK quem agenda é o Android (useLembretes); o setInterval da página
    // não roda com o app fechado e o `new Notification` não existe no WebView.
    if (isNativo()) return;
    startScheduler();
    return () => stopScheduler();
  }, []);

  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  useRolagemPorTela(main);

  // 100dvh, não 100vh: no Chrome do celular o 100vh conta a barra de endereço
  // e empurrava a barra de abas pra baixo da borda da tela.
  return (
    <OnboardingGate>
      <div className="h-screen h-[100dvh] flex flex-col">
        <main ref={main} className="flex-1 overflow-y-auto overscroll-contain pt-seguro">
          <div key={pathname} className="tela-entra">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </OnboardingGate>
  );
}

export default App;
