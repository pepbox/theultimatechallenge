import { useLocation, useNavigate, useParams } from "react-router-dom";
import Background from "../../assets/images/Background.jpg";
import UserTimer from "../../features/user/timer/components/UserTimer.jsx";

import TheUltimateChallengeRouter from "../../TheUltimateChallenge/pages/TheUltimateChallengeRouter.jsx";
import { useEffect, useState } from "react";
import axios from "axios";

function UserRoutes() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const location = useLocation();

  const restoreCookie = async (token) => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_BASE_URL
        }/api/v1/theultimatechallenge/restore-cookie`,
        {
          token,
        },{
          withCredentials:true
        }
      );
      console.log("Response from restore-cookie:", response.data);
      if (response.status === 200 && response.data.success) {
        navigate(`/theultimatechallenge/quizsection/${response.data.sessionId}`);
      } else {
        console.error("Failed to restore cookie:", response.data.error);
      }
    } catch (error) {
      console.error("Error restoring cookie:", error);
    }
    finally{
      setLoading(false);
    }
  };
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    console.log("Token from URL:", token);
    if (!token) {
      setLoading(false);
      return;
    }
    restoreCookie(token);
  }, [location.search]);

  if (loading) {
    return <>Loading...</>;
  }

  return (
    <div
      style={{
        position: "relative",
        maxWidth: "480px",
        margin: "0 auto",
        minHeight: `${window.innerHeight}px`,
        backgroundColor: "#23203E",
      }}
      className=""
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.2,
          zIndex: 0,
        }}
      ></div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <TheUltimateChallengeRouter />
      </div>
    </div>
  );
}

export default UserRoutes;
