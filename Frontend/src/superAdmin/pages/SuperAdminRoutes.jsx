import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./home";
import Login from "./Login.jsx";
import GameManager from "./GameManager";
import QuestionForm from "./QuestionForm";
import { useEffect } from "react";
import AuthWrapper from "../../features/auth/AuthWrapper.jsx";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader.jsx";
import { setSuperAdmin } from "../../redux/superadmin/superAdminSlice.js";
import axios from "axios";

function SuperAdminRoutes() {
  const dispatch = useDispatch();
  const { isLoading, authenticated } = useSelector((state) => state.superadmin);
  const handleValidateSuperadmin = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_BASE_URL
        }/api/v1/superadmin/validate-superadmin/`,
        { withCredentials: true }
      );
      if (response.data.success) {
        dispatch(
          setSuperAdmin({
            isLoading: false,
            authenticated: true,
          })
        );
      }
    } catch (error) {
      console.error("Error validating admin session:", error);
      dispatch(setSuperAdmin({ isLoading: false, authenticated: false }));
    }
  };

  useEffect(() => {
    handleValidateSuperadmin();
  }, []);

  if (isLoading) {
    return <Loader />;
  }
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <AuthWrapper role="superadmin">
              <Home />
            </AuthWrapper>
          }
        />
        <Route path="/login" element={!authenticated?<Login />:<Navigate to="/superadmin"/>} />
        <Route path="/gamemanager" element={<GameManager />} />
        <Route path="/questionform" element={<QuestionForm />} />
      </Routes>
    </div>
  );
}

export default SuperAdminRoutes;
