import React, { useEffect } from "react";
import { Routes, Route, useParams, Navigate } from "react-router-dom";
import PepBoxAdminDashboard from "../../features/Dashboard/home/Layout.jsx";
import History from "../../features/Dashboard/history/History.jsx";
import GameHistory from "../../features/Dashboard/gameHistory/GameHistory.jsx";
import LeaderBoard from "../../features/Dashboard/LeaderBoard/LeaderBoard.jsx";
import AdminLogin from "../../features/login.jsx";
import {
  connectSocket,
  disconnectSocket,
} from "../../services/sockets/admin.js";
import AuthWrapper from "../../features/auth/AuthWrapper.jsx";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setAdmin } from "../../redux/admin/adminSlice.js";
import Loader from "../../components/Loader.jsx";

function AdminRoutes() {
  const { sessionId } = useParams();
  const dispatch = useDispatch();
  const { isLoading, authenticated } = useSelector((state) => state.admin);

  const handleValidateAdminSession = async () => {
    console.log("Validating admin session with ID:", sessionId);
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_BASE_URL
        }/api/v1/admin/validate-admin-session/`,
        { params: { sessionId: sessionId }, withCredentials: true }
      );
      if (response.data.success) {
        dispatch(
          setAdmin({
            isLoading: false,
            authenticated: true,
            sessionId: sessionId,
          })
        );
      }
    } catch (error) {
      console.error("Error validating admin session:", error);
      dispatch(
        setAdmin({ isLoading: false, authenticated: false, sessionId: null })
      );
    }
  };

  useEffect(() => {
    handleValidateAdminSession();
    connectSocket();
    return () => disconnectSocket();
  }, []);

  if (isLoading) {
    return <Loader />;
  }
  return (
    <Routes>
      <Route
        path="login"
        element={
          !authenticated ? (
            <AdminLogin />
          ) : (
            <Navigate to={`/admin/${sessionId}`} />
          )
        }
      />
      <Route
        path=""
        element={
          <AuthWrapper role={"admin"}>
            <PepBoxAdminDashboard />
          </AuthWrapper>
        }
      />
      <Route path="history" element={<History />} />
      <Route path="gamehistory" element={<GameHistory />} />
      <Route path="leaderboard" element={<LeaderBoard />} />
    </Routes>
  );
}

export default AdminRoutes;

//
