import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ParallaxHeader from "./components/ParallaxHeader";
import SelectionDialog from "./components/SelectionDialog";
import AboutPage from "./pages/AboutPage";
import AiRecommendationPage from "./pages/AiRecommendationPage";
import HomePage from "./pages/HomePage";
import ReportsPage from "./pages/ReportsPage";
import { loadCoins } from "./store/coinsSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";

function App() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.coins.status);

  useEffect(() => {
    if (status === "idle") {
      dispatch(loadCoins());
    }
  }, [dispatch, status]);

  return (
    <div className="app-shell">
      <div className="ambient-glow ambient-glow--one" aria-hidden="true" />
      <div className="ambient-glow ambient-glow--two" aria-hidden="true" />
      <Navbar />
      <ParallaxHeader />
      <main className="page-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/ai" element={<AiRecommendationPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <SelectionDialog />
    </div>
  );
}

export default App;
