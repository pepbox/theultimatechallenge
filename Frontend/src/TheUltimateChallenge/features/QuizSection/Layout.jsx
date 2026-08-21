import { useEffect, useState } from "react";
import Header from "./Header";
import Overlay from "./Overlay";
import Card from "./Card";
import { getSocket } from "../../../services/sockets/theUltimateChallenge";
import { useNavigate, useParams } from "react-router-dom";
import UserTimer from "../../../features/user/timer/components/UserTimer";
import PlayerScorecard from "./PlayerScorecard";
import axios from "axios";

function Layout() {
  const [overlayToggle, setOverlayToggle] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [teamData, setTeamData] = useState(null);
  const [showScorecard, setShowScorecard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);
  const socket = getSocket();
  const { sessionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    console.log("Session ID from params:", sessionId);

    const onTeamData = (data) => {
      console.log("Team data received:", data);
      setTeamData(data);
      setOverlayToggle(data.teamInfo.isPaused);
      if (typeof data.teamInfo.showScorecard === "boolean") {
        setShowScorecard(data.teamInfo.showScorecard);
      }
    };
    const onGameEnded = ({ sessionId: endedId }) => {
      console.log("Game ended for session:", endedId, "  ", sessionId);
      if (endedId === sessionId) {
        console.log(
          "Game ended for current session, redirecting to completion page"
        );
        if (!location.pathname.includes("/completion/")) {
          console.log("Redirecting to completion page for session:", sessionId);
          navigate(`/theultimatechallenge/completion/${sessionId}`);
        }
      }
    };

    const onError = (err) => {
      console.error("Socket error:", err);
      const errMsg = err?.message || err || "";
      if (errMsg === "Player not found" || errMsg.includes("Player not found")) {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate(`/theultimatechallenge/login/${sessionId}`);
        return;
      }
      setError(errMsg || "Socket error occurred");
    };

    const onPauseUpdated = (data) => {
      console.log("Session pause status updated:", data.isPaused);
      setOverlayToggle(data.isPaused);
    };

    const onScorecardUpdated = (data) => {
      console.log("Scorecard status updated:", data);
      setShowScorecard(data.showScorecard);
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    };

    // Emit request for team data
    socket.emit("request-team-data", (response) => {
      if (response.success) {
        setTeamData(response.data);
        if (typeof response.data.teamInfo.showScorecard === "boolean") {
          setShowScorecard(response.data.teamInfo.showScorecard);
        }
      } else {
        if (response.error === "Player not found" || (response.error && response.error.includes("Player not found"))) {
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          navigate(`/theultimatechallenge/login/${sessionId}`);
          return;
        }
        setError(response.error || "Failed to fetch team data");
      }
    });

    // Register event listeners
    socket.on("team-data", onTeamData);
    socket.on("error", onError);
    socket.on("session-pause-updated", onPauseUpdated);
    socket.on("scorecard-visibility-updated", onScorecardUpdated);
    socket.on("game-ended", onGameEnded);

    return () => {
      // Cleanup all listeners
      socket.off("team-data", onTeamData);
      socket.off("error", onError);
      socket.off("session-pause-updated", onPauseUpdated);
      socket.off("scorecard-visibility-updated", onScorecardUpdated);
      socket.off("game-ended", onGameEnded);
      window.removeEventListener("resize", handleResize);
    };
  }, [socket]);

  // Fetch leaderboard when scorecard is toggled on
  useEffect(() => {
    if (showScorecard) {
      const fetchLeaderboard = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/theultimatechallenge/leaderboard`,
            {
              params: { sessionId },
              withCredentials: true,
            }
          );
          if (res.data && res.data.success) {
            setLeaderboard(res.data.leaderboard);
          }
        } catch (err) {
          console.error("Error fetching leaderboard:", err);
        }
      };
      fetchLeaderboard();
    }
  }, [showScorecard, sessionId]);

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!teamData) {
    return <div className="p-4">Loading team data...</div>;
  }

  return (
    <div
      className="relative flex justify-center font-mono"
      style={{ minHeight: `${windowHeight}px` }}
    >
      {showScorecard ? (
        <PlayerScorecard
          leaderboard={leaderboard}
          ownTeamName={teamData.teamName}
        />
      ) : (
        <>
          {overlayToggle && <Overlay />}
          <Header teamData={teamData} />
          <Card teamData={teamData} socket={socket} />
          <UserTimer sessionId={sessionId} />
        </>
      )}
    </div>
  );
}

export default Layout;
