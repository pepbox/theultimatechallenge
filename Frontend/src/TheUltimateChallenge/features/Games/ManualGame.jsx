import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ClipboardCheck, CheckCircle, XCircle } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getSocket } from "../../../services/sockets/theUltimateChallenge";
import UserTimer from "../../../features/user/timer/components/UserTimer";

import axios from "axios";

function ManualGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams();
  const cardData = location.state;
  const socket = getSocket();

  const [imageError, setImageError] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isRequested, setIsRequestedState] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [requestError, setRequestError] = useState(null);

  // Use a ref so the cleanup closure always has the latest value
  const isRequestedRef = useRef(false);
  const setIsRequested = (val) => {
    isRequestedRef.current = val;
    setIsRequestedState(val);
  };

  // ─── Socket listeners ────────────────────────────────────────────────────────
  useEffect(() => {
    const onPauseUpdated = (data) => {
      if (data.isPaused) navigate(`/theultimatechallenge/quizsection/${sessionId}`);
    };

    const onTeamData = (data) => {
      if (data.teamInfo.currentLevel !== cardData?.level) {
        navigate(`/theultimatechallenge/quizsection/${sessionId}`);
        return;
      }

      const currentQ = data.questions?.find(q => q.id?.toString() === cardData?.id?.toString());
      if (currentQ) {
        if (currentQ.status === "done") {
          navigate(`/theultimatechallenge/taskcomplete/${sessionId}`, {
            state: {
              pointsEarned: currentQ.pointsEarned || cardData.points,
              message: "Manual verification approved!",
              isCorrect: true,
            },
          });
        } else if (currentQ.status === "attending" && isRequestedRef.current) {
          setIsRequested(false);
          setIsRejected(true);
          setRequestError(null);
        }
      }
    };

    const onApproved = (data) => {
      if (data.questionId?.toString() === cardData?.id?.toString()) {
        navigate(`/theultimatechallenge/taskcomplete/${sessionId}`, {
          state: {
            pointsEarned: data.pointsEarned,
            message: "Manual verification approved!",
            isCorrect: true,
          },
        });
      }
    };

    const onRejected = (data) => {
      if (data.questionId?.toString() === cardData?.id?.toString()) {
        setIsRequested(false);
        setIsRejected(true);
        setRequestError(null);
      }
    };

    const onGameEnded = ({ sessionId: endedId }) => {
      if (endedId === sessionId && !location.pathname.includes("/completion/")) {
        navigate(`/theultimatechallenge/completion/${sessionId}`);
      }
    };

    const onScorecardUpdated = (data) => {
      if (data.showScorecard) {
        navigate(`/theultimatechallenge/quizsection/${sessionId}`);
      }
    };

    socket.on("session-pause-updated", onPauseUpdated);
    socket.on("team-data", onTeamData);
    socket.on("manual-verification-approved", onApproved);
    socket.on("manual-verification-rejected", onRejected);
    socket.on("scorecard-visibility-updated", onScorecardUpdated);
    socket.on("game-ended", onGameEnded);

    return () => {
      socket.off("session-pause-updated", onPauseUpdated);
      socket.off("team-data", onTeamData);
      socket.off("manual-verification-approved", onApproved);
      socket.off("manual-verification-rejected", onRejected);
      socket.off("scorecard-visibility-updated", onScorecardUpdated);
      socket.off("game-ended", onGameEnded);
      // Only reset status if player never sent a verification request.
      // isRequestedRef.current is always fresh — no stale closure.
      if (cardData?.id && !isRequestedRef.current) {
        socket.emit("reset-question-status", { questionId: cardData.id });
      }
    };
  }, [socket, cardData?.id, navigate, sessionId]);

  // Validate card data
  useEffect(() => {
    if (!cardData || !cardData.text || !cardData.id) {
      navigate(`/theultimatechallenge/quizsection/${sessionId}`);
    }
  }, [cardData, navigate, sessionId]);

  const resetQuestionStatus = () => {
    if (socket && cardData?.id) {
      socket.emit("reset-question-status", { questionId: cardData.id }, () => {
        navigate(`/theultimatechallenge/quizsection/${sessionId}`);
      });
    } else {
      navigate(`/theultimatechallenge/quizsection/${sessionId}`);
    }
  };

  const handleBackClick = () => {
    if (isRequested) {
      // If already requested, just navigate back — status stays pending
      navigate(`/theultimatechallenge/quizsection/${sessionId}`);
    } else {
      resetQuestionStatus();
    }
  };

  const handlePlayLater = () => {
    if (isRequested) {
      navigate(`/theultimatechallenge/quizsection/${sessionId}`);
    } else {
      resetQuestionStatus();
    }
  };

  const handleRequestVerification = async () => {
    if (isRequesting || isRequested) return;

    setIsRequesting(true);
    setRequestError(null);
    setIsRejected(false);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/theultimatechallenge/request-manual-verification`,
        { questionId: cardData.id },
        { withCredentials: true }
      );
      setIsRequesting(false);
      if (response.data?.success) {
        setIsRequested(true);
      } else {
        setRequestError(response.data?.error || "Failed to send request. Please try again.");
      }
    } catch (err) {
      setIsRequesting(false);
      setRequestError(err.response?.data?.error || "Failed to send request. Please try again.");
    }
  };

  if (!cardData) return null;

  return (
    <div
      className="mx-[26px] flex flex-col justify-between font-mono pb-32"
      style={{ minHeight: `${window.innerHeight}px` }}
    >
      <div className="mb-[26px] flex flex-col h-[100%] pt-[26px]">
        {/* Header */}
        <div className="text-white w-full h-[36px] flex justify-between items-center">
          <div className="flex gap-1.5 cursor-pointer" onClick={handleBackClick}>
            <ChevronLeft className="text-white text-2xl" />
            <h1 className="text-[16px] font-mono">{cardData.category} Game</h1>
          </div>
          <button
            className="text-white border-[1px] rounded-[12px] w-[108px] h-[32px] border-white text-[14px]"
            onClick={handlePlayLater}
          >
            Play Later
          </button>
        </div>

        {/* Question Image (if any) */}
        {cardData.questionImageUrl && (
          <div className="w-[100%] h-[206px] mx-auto mt-3">
            {imageError ? (
              <div className="w-full h-full rounded-[20px] bg-gray-500 flex items-center justify-center text-white">
                Image Failed to Load
              </div>
            ) : (
              <img
                src={cardData.questionImageUrl}
                className="rounded-[20px] w-full h-full object-cover"
                alt="question"
                onError={() => setImageError(true)}
              />
            )}
          </div>
        )}

        {/* Question Text */}
        <div className="w-full mx-auto border-2 border-[#5B2DC899]/60 bg-[#D4B8FF4D]/85 rounded-[20px] backdrop-blur-[53px] mt-4">
          <div className="m-3 text-white">
            <h1 className="text-[16px] flex justify-center leading-[20px] text-center font-mono">
              {cardData.text}
            </h1>
          </div>
        </div>

        {/* Points Display */}
        <div className="w-full mx-auto flex justify-center mt-4">
          <div className="w-[157px] h-[20px]">
            <h1 className="text-[20px] text-white text-center">
              Points: {cardData.points}
            </h1>
          </div>
        </div>

        {/* Info label */}
        <div className="w-full flex justify-center mt-6">
          <div className="bg-white/10 rounded-[16px] px-4 py-2 border border-white/20 max-w-[300px]">
            <p className="text-white/70 text-[12px] text-center font-mono leading-5">
              This question requires admin review. Click the button below to request manual verification.
            </p>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="w-full flex flex-col items-center justify-center mb-4 gap-3">

        {/* Rejection notice */}
        {isRejected && !isRequested && (
          <div className="w-full border-2 border-red-500/60 bg-red-500/15 rounded-[16px] backdrop-blur-[53px] p-3 flex items-center gap-3">
            <XCircle className="text-red-400 flex-shrink-0" size={20} />
            <div>
              <p className="text-red-300 text-sm font-mono font-semibold">Verification Rejected</p>
              <p className="text-red-300/70 text-xs font-mono">Admin rejected your request. You can request again.</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {requestError && (
          <div className="text-red-400 text-center text-sm font-mono">{requestError}</div>
        )}

        {/* Main request button */}
        <button
          className={`w-full h-[52px] rounded-[16px] flex items-center justify-center gap-3 transition-all duration-300 font-mono font-semibold text-[15px] ${
            isRequested
              ? "bg-amber-500/30 border-2 border-amber-400/50 cursor-not-allowed"
              : isRequesting
              ? "bg-purple-700/60 border-2 border-purple-400/40 cursor-not-allowed"
              : "bg-[#5B2DC8] border-2 border-purple-400/40 hover:bg-[#4a22a8] active:scale-95 cursor-pointer"
          }`}
          onClick={handleRequestVerification}
          disabled={isRequesting || isRequested}
        >
          {isRequested ? (
            <>
              <CheckCircle className="text-amber-400" size={22} />
              <span className="text-amber-300">Verification Requested ✓</span>
            </>
          ) : isRequesting ? (
            <>
              <div className="w-5 h-5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
              <span className="text-purple-200">Sending Request...</span>
            </>
          ) : (
            <>
              <ClipboardCheck className="text-white" size={22} />
              <span className="text-white">
                {isRejected ? "Request Verification Again" : "Request Manual Verification"}
              </span>
            </>
          )}
        </button>

        {isRequested && (
          <p className="text-amber-300/70 text-[11px] font-mono text-center">
            Waiting for admin to review your request...
          </p>
        )}
      </div>

      <UserTimer sessionId={sessionId} />
    </div>
  );
}

export default ManualGame;
