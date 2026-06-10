import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { Today } from "./pages/Today";
import { WorkoutHome } from "./pages/workout/WorkoutHome";
import { WeeklyPlan } from "./pages/workout/WeeklyPlan";
import { Cycles } from "./pages/workout/Cycles";
import { ExerciseLibrary } from "./pages/workout/ExerciseLibrary";
import { ExerciseDetail } from "./pages/workout/ExerciseDetail";
import { SessionDetail } from "./pages/workout/SessionDetail";
import { ProgressionHistory } from "./pages/workout/ProgressionHistory";
import { MovementHome } from "./pages/workout/MovementHome";
import { SequenceDetail } from "./pages/workout/SequenceDetail";
import { PracticeHistory } from "./pages/workout/PracticeHistory";
import { BodyHome } from "./pages/body/BodyHome";
import { Measurements } from "./pages/body/Measurements";
import { Photos } from "./pages/body/Photos";
import { Comparison } from "./pages/body/Comparison";
import { Onboarding } from "./pages/body/Onboarding";
import { BeautyHome } from "./pages/beauty/BeautyHome";
import { PaletteView } from "./pages/beauty/style/PaletteView";
import { GarmentsView } from "./pages/beauty/style/GarmentsView";
import { GarmentDetail } from "./pages/beauty/style/GarmentDetail";
import { LooksView } from "./pages/beauty/style/LooksView";
import { LookNew } from "./pages/beauty/style/LookNew";
import { WishlistView } from "./pages/beauty/style/WishlistView";
import { IntimateView } from "./pages/beauty/style/IntimateView";
import { SkincareHome } from "./pages/beauty/SkincareHome";
import { SkincareNew } from "./pages/beauty/SkincareNew";
import { SkincareDetail } from "./pages/beauty/SkincareDetail";
import { HaircareHome } from "./pages/beauty/HaircareHome";
import { NailsHome } from "./pages/beauty/NailsHome";
import { ProductsHome } from "./pages/beauty/ProductsHome";
import { ProductNew } from "./pages/beauty/ProductNew";
import { DepilacaoHome } from "./pages/beauty/DepilacaoHome";
import { MakeupHome } from "./pages/beauty/makeup/MakeupHome";
import { MakeupDetail } from "./pages/beauty/makeup/MakeupDetail";
import { VoiceHome } from "./pages/beauty/voice/VoiceHome";
import { VoiceRecordings } from "./pages/beauty/voice/VoiceRecordings";
import { VoiceDetail } from "./pages/beauty/voice/VoiceDetail";
import { MilestonesView } from "./pages/path/MilestonesView";
import { MilestoneNew } from "./pages/path/MilestoneNew";
import { MealPlanView } from "./pages/path/MealPlanView";
import { MealPlanEdit } from "./pages/path/MealPlanEdit";
import { ShoppingList } from "./pages/path/ShoppingList";
import { MealsToday } from "./pages/path/MealsToday";
import { DiaryView } from "./pages/path/DiaryView";
import { LegalResources } from "./pages/path/LegalResources";
import { Settings } from "./pages/Settings";
import { seedDatabase } from "./lib/seed";
import { seedBeauty } from "./lib/beauty-seed";
import { seedStyle } from "./lib/style-seed";
import { seedPath } from "./lib/path-seed";
import { seedMovement } from "./lib/movement-seed";
import { seedMakeup } from "./lib/makeup-seed";
import { seedVoice } from "./lib/voice-seed";
import "./index.css";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        { index: true, element: <Today /> },
        { path: "treino", element: <WorkoutHome /> },
        { path: "treino/plano", element: <WeeklyPlan /> },
        { path: "treino/ciclos", element: <Cycles /> },
        { path: "treino/biblioteca", element: <ExerciseLibrary /> },
        { path: "treino/exercicio/:id", element: <ExerciseDetail /> },
        { path: "treino/sessao/:templateId", element: <SessionDetail /> },
        { path: "treino/progressao", element: <ProgressionHistory /> },
        { path: "treino/movimento", element: <MovementHome /> },
        { path: "treino/movimento/historico", element: <PracticeHistory /> },
        { path: "treino/movimento/:id", element: <SequenceDetail /> },
        { path: "corpo", element: <BodyHome /> },
        { path: "corpo/medidas", element: <Measurements /> },
        { path: "corpo/fotos", element: <Photos /> },
        { path: "corpo/comparacao", element: <Comparison /> },
        { path: "corpo/onboarding", element: <Onboarding /> },
        { path: "beleza", element: <BeautyHome /> },
        { path: "beleza/pele-cabelo", element: <BeautyHome /> },
        { path: "beleza/pele-cabelo/skincare", element: <SkincareHome /> },
        { path: "beleza/pele-cabelo/skincare/nova", element: <SkincareNew /> },
        { path: "beleza/pele-cabelo/skincare/:id", element: <SkincareDetail /> },
        { path: "beleza/pele-cabelo/haircare", element: <HaircareHome /> },
        { path: "beleza/pele-cabelo/unhas", element: <NailsHome /> },
        { path: "beleza/pele-cabelo/produtos", element: <ProductsHome /> },
        { path: "beleza/pele-cabelo/produtos/novo", element: <ProductNew /> },
        { path: "beleza/depilacao", element: <DepilacaoHome /> },
        { path: "beleza/estilo", element: <PaletteView /> },
        { path: "beleza/estilo/pecas", element: <GarmentsView /> },
        { path: "beleza/estilo/pecas/:id", element: <GarmentDetail /> },
        { path: "beleza/estilo/looks", element: <LooksView /> },
        { path: "beleza/estilo/looks/novo", element: <LookNew /> },
        { path: "beleza/estilo/wishlist", element: <WishlistView /> },
        { path: "beleza/estilo/intimo", element: <IntimateView /> },
        { path: "beleza/maquiagem", element: <MakeupHome /> },
        { path: "beleza/maquiagem/:id", element: <MakeupDetail /> },
        { path: "beleza/voz", element: <VoiceHome /> },
        { path: "beleza/voz/gravacoes", element: <VoiceRecordings /> },
        { path: "beleza/voz/:id", element: <VoiceDetail /> },
        { path: "trilha", element: <MilestonesView /> },
        { path: "trilha/marcos/novo", element: <MilestoneNew /> },
        { path: "trilha/alimentacao", element: <MealPlanView /> },
        { path: "trilha/alimentacao/editar", element: <MealPlanEdit /> },
        { path: "trilha/alimentacao/lista-compras", element: <ShoppingList /> },
        { path: "refeicoes-hoje", element: <MealsToday /> },
        { path: "trilha/diario", element: <DiaryView /> },
        { path: "trilha/direitos", element: <LegalResources /> },
        { path: "configuracoes", element: <Settings /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);

Promise.all([seedDatabase(), seedBeauty(), seedStyle(), seedPath(), seedMovement(), seedMakeup(), seedVoice()]).then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
});
