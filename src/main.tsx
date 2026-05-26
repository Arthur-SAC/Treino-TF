import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { Today } from "./pages/Today";
import { WorkoutHome } from "./pages/workout/WorkoutHome";
import { WeeklyPlan } from "./pages/workout/WeeklyPlan";
import { ExerciseLibrary } from "./pages/workout/ExerciseLibrary";
import { ExerciseDetail } from "./pages/workout/ExerciseDetail";
import { SessionDetail } from "./pages/workout/SessionDetail";
import { ProgressionHistory } from "./pages/workout/ProgressionHistory";
import { BodyHome } from "./pages/body/BodyHome";
import { Measurements } from "./pages/body/Measurements";
import { Photos } from "./pages/body/Photos";
import { Comparison } from "./pages/body/Comparison";
import { Onboarding } from "./pages/body/Onboarding";
import { Beauty } from "./pages/Beauty";
import { Path } from "./pages/Path";
import { Settings } from "./pages/Settings";
import { seedDatabase } from "./lib/seed";
import { seedBeauty } from "./lib/beauty-seed";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Today /> },
      { path: "treino", element: <WorkoutHome /> },
      { path: "treino/plano", element: <WeeklyPlan /> },
      { path: "treino/biblioteca", element: <ExerciseLibrary /> },
      { path: "treino/exercicio/:id", element: <ExerciseDetail /> },
      { path: "treino/sessao/:templateId", element: <SessionDetail /> },
      { path: "treino/progressao", element: <ProgressionHistory /> },
      { path: "corpo", element: <BodyHome /> },
      { path: "corpo/medidas", element: <Measurements /> },
      { path: "corpo/fotos", element: <Photos /> },
      { path: "corpo/comparacao", element: <Comparison /> },
      { path: "corpo/onboarding", element: <Onboarding /> },
      { path: "beleza", element: <Beauty /> },
      { path: "trilha", element: <Path /> },
      { path: "configuracoes", element: <Settings /> },
    ],
  },
]);

Promise.all([seedDatabase(), seedBeauty()]).then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
});
