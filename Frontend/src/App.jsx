import { Routes, Route } from "react-router-dom";
import "./App.css";
import TheUltimateChallengeRoutes from "./pages/users/TheUltimateChallengeRoutes.jsx";
import AdminRoutes from "./pages/admin/AdminRoutes.jsx";
import QuestionLibraryPage from "./features/Dashboard/QuestionLibrary/QuestionLibraryPage.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/theultimatechallenge/*"
          element={<TheUltimateChallengeRoutes />}
        />
        <Route path="/admin/questions" element={<QuestionLibraryPage />} />
        <Route path="/admin/:sessionId/*" element={<AdminRoutes />} />
      </Routes>
    </>
  );
}

export default App;
