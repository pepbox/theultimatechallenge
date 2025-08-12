import React, { useEffect } from "react";
import Check from "../../assets/images/Result/Check.png";
import Star from "../../assets/images/Result/star.png";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getSocket } from "../../../services/sockets/theUltimateChallenge";

function TaskComplete() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const location = useLocation();
  const socket = getSocket();

  useEffect(() => {
    // Handle socket events if needed
    const onGameEnded = ({ sessionId: endedId }) => {
      if (endedId === sessionId) {
        if (!location.pathname.includes("/completion/")) {
          navigate(`/theultimatechallenge/completion/${sessionId}`);
        }
      }
    };
    socket.on("game-ended", onGameEnded);
  }, [sessionId, navigate, location.pathname, socket]);

  // Destructure the passed state from navigate
  const {
    pointsEarned = 0,
    message = "Well done!",
    isCorrect = true,
  } = location.state || {};

  return (
    <div
      className="relative flex justify-center items-center font-mono"
      style={{ height: `${window.innerHeight}px` }}
    >
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-white text-2xl mb-4 font-mono text-center">
          {message}
        </h1>

        <img src={Check} className="" />

        <div className="flex space-x-2 mb-6 items-center">
          <img src={Star} className="w-[32px] h-[32px]" />
          <img src={Star} className="w-[52px] h-[52px]" />
          <img src={Star} className="w-[32px] h-[32px]" />
        </div>

        <div className="text-center mb-20">
          <p className="text-white text-sm">You Earned</p>
          <p className="text-white text-2xl font-bold">{pointsEarned} pts</p>
        </div>
      </div>

      <div className="absolute bottom-[40px] w-full flex items-center justify-center">
        <button
          className="w-[327px] h-[40px] bg-[#FCA61E] rounded-[12px]"
          onClick={() =>
            navigate(`/theultimatechallenge/quizsection/${sessionId}`)
          }
        >
          <div className="flex justify-center gap-[7px] z-10">
            <h1 className="text-[#111111] font-bold text-[16px]">
              Continue with Tasks
            </h1>
          </div>
        </button>
      </div>
    </div>
  );
}

export default TaskComplete;
