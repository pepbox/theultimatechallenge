import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useParams,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
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
  const [loading, setLoading] = useState(false);
  const { isLoading, authenticated } = useSelector((state) => state.admin);
  const [socketConnected, setSocketConnected] = useState(false);
  const [initializationError, setInitializationError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const restoreCookie = async (token) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/restore-cookie`,
        {
          token,
        },
        {
          withCredentials: true,
        }
      );
      console.log("Response from restore-cookie:", response.data);
      if (response.status === 200 && response.data.success) {
        dispatch(
          setAdmin({
            authenticated: true,
            sessionId: response.data.sessionId,
            isLoading: false,
          })
        );
        navigate(`/admin/${response.data.sessionId}/`);
      } else {
        console.error("Failed to restore cookie:", response.data.error);
      }
    } catch (error) {
      console.error("Error restoring cookie:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (!token) {
      setLoading(false);
      return;
    }
    restoreCookie(token);
  }, [location.search]);

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
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error validating admin session:", error);
      dispatch(
        setAdmin({ isLoading: false, authenticated: false, sessionId: null })
      );
      return false;
    }
  };

  const handleSocketConnection = async () => {
    try {
      // Wait for the socket to actually connect
      await connectSocket();
      setSocketConnected(true);
      console.log("Socket connected successfully");
      return true;
    } catch (error) {
      console.error("Error connecting socket:", error);
      setSocketConnected(false);
      setInitializationError("Failed to connect to server");
      return false;
    }
  };

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        const sessionValid = await handleValidateAdminSession();
        if (sessionValid) {
          await handleSocketConnection();
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setInitializationError("Failed to initialize connection");
      }
    };

    initializeConnection();

    return () => {
      disconnectSocket();
      setSocketConnected(false);
    };
  }, [sessionId, authenticated]);

  // Show error if initialization failed
  if (initializationError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{initializationError}</p>
          <button
            onClick={() => {
              setInitializationError(null);
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loader while validating session or connecting socket
  if (isLoading || loading || (authenticated && !socketConnected)) {
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
