import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, Camera, X, Video, ClipboardCheck, CheckCircle, XCircle } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getSocket } from "../../../services/sockets/theUltimateChallenge";
import axios from "axios";
import Modal from "react-modal";
import Overlay from "../QuizSection/Overlay";
import UserTimer from "../../../features/user/timer/components/UserTimer";

// Set modal root for accessibility
Modal.setAppElement("#root");

function BodyGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams();
  const cardData = location.state;
  const fileInputRef = useRef(null);
  const cameraImageRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmittedState] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [verificationRequested, setVerificationRequestedState] = useState(false);
  const [verificationRejected, setVerificationRejected] = useState(false);
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);
  const socket = getSocket();

  // Refs to avoid stale closures in useEffect cleanup
  const verificationRequestedRef = useRef(false);
  const isAnswerSubmittedRef = useRef(false);
  const setVerificationRequested = (val) => {
    verificationRequestedRef.current = val;
    setVerificationRequestedState(val);
  };
  const setIsAnswerSubmitted = (val) => {
    isAnswerSubmittedRef.current = val;
    setIsAnswerSubmittedState(val);
  };

  // Function to check if there's an unsaved answer
  const hasUnsavedAnswer = () => {
    return selectedFile && !isAnswerSubmitted && !isSubmitting;
  };

  // Function to show confirmation dialog
  const showUnsavedAlert = () => {
    return window.confirm(
      "You have an unsaved answer. Are you sure you want to leave? Your uploaded file will be lost."
    );
  };

  // Handle navigation with unsaved changes check
  const handleNavigation = (navigationFn) => {
    if (hasUnsavedAnswer()) {
      if (showUnsavedAlert()) {
        navigationFn();
      }
    } else {
      navigationFn();
    }
  };

  // Prevent page refresh/close with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedAnswer()) {
        e.preventDefault();
        e.returnValue =
          "You have an unsaved answer. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [selectedFile, isAnswerSubmitted, isSubmitting]);

  // Clean up socket on unmount
  useEffect(() => {
    const onPauseUpdated = (data) => {
      if (data.isPaused) {
        handleNavigation(() =>
          navigate(`/theultimatechallenge/quizsection/${sessionId}`)
        );
      }
    };

    const onTeamData = (data) => {
      if (data.teamInfo.currentLevel !== location.state.level) {
        handleNavigation(() =>
          navigate(`/theultimatechallenge/quizsection/${sessionId}`)
        );
        return;
      }

      const currentQ = data.questions?.find(q => q.id?.toString() === cardData?.id?.toString());
      if (currentQ) {
        if (currentQ.status === "done") {
          handleNavigation(() =>
            navigate(`/theultimatechallenge/taskcomplete/${sessionId}`, {
              state: { pointsEarned: currentQ.pointsEarned || cardData.points, message: "Verification approved!", isCorrect: true },
            })
          );
        } else if (currentQ.status === "attending" && verificationRequestedRef.current) {
          setVerificationRequested(false);
          setVerificationRejected(true);
          setIsRequestingVerification(false);
        }
      }
    };

    const onQuestionStatusChanged = (data) => {
      if (data.questionId === cardData?.id) {
        handleNavigation(() =>
          navigate(`/theultimatechallenge/quizsection/${sessionId}`)
        );
      }
    };

    const onAdminUpdatedTotalScore = (data) => {
      handleNavigation(() =>
        navigate(`/theultimatechallenge/quizsection/${sessionId}`)
      );
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

    const onScorecardUpdated = (data) => {
      if (data.showScorecard) {
        handleNavigation(() =>
          navigate(`/theultimatechallenge/quizsection/${sessionId}`)
        );
      }
    };

    socket.on("session-pause-updated", onPauseUpdated);
    socket.on("team-data", onTeamData);
    socket.on("question-status-changed-by-admin", onQuestionStatusChanged);
    socket.on("admin-updated-total-score", onAdminUpdatedTotalScore);
    socket.on("scorecard-visibility-updated", onScorecardUpdated);
    socket.on("game-ended", onGameEnded);

    // Manual verification events for video questions
    const onVerificationApproved = (data) => {
      if (data.questionId?.toString() === cardData?.id?.toString()) {
        navigate(`/theultimatechallenge/taskcomplete/${sessionId}`, {
          state: { pointsEarned: data.pointsEarned, message: "Verification approved!", isCorrect: true },
        });
      }
    };
    const onVerificationRejected = (data) => {
      if (data.questionId?.toString() === cardData?.id?.toString()) {
        setVerificationRequested(false);
        setVerificationRejected(true);
        setIsRequestingVerification(false);
      }
    };
    socket.on("manual-verification-approved", onVerificationApproved);
    socket.on("manual-verification-rejected", onVerificationRejected);

    return () => {
      if (socket && cardData?.id) {
        socket.off("error");
        socket.off("team-data", onTeamData);
        socket.off("session-pause-updated", onPauseUpdated);
        socket.off("question-status-changed-by-admin", onQuestionStatusChanged);
        socket.off("admin-updated-total-score", onAdminUpdatedTotalScore);
        socket.off("scorecard-visibility-updated", onScorecardUpdated);
        socket.off("manual-verification-approved", onVerificationApproved);
        socket.off("manual-verification-rejected", onVerificationRejected);
        // Only reset if the player hasn't submitted or requested verification.
        // Refs are always fresh — no stale closure issue.
        if (!isAnswerSubmittedRef.current && !verificationRequestedRef.current) {
          socket.emit("reset-question-status", { questionId: cardData.id });
        }
      }
    };
  }, [
    socket,
    cardData?.id,
    navigate,
    sessionId,
  ]);

  // Validate card data on load
  useEffect(() => {
    if (
      !cardData ||
      !cardData.text ||
      !cardData.id
    ) {
      navigate(`/theultimatechallenge/quizsection/${sessionId}`);
    }
  }, [cardData, navigate, sessionId]);

  // Generate preview for selected file
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const resetQuestionStatus = () => {
    if (socket && cardData?.id) {
      socket.emit(
        "reset-question-status",
        { questionId: cardData.id },
        (response) => {
          navigate(`/theultimatechallenge/quizsection/${sessionId}`);
        }
      );
    } else {
      navigate(`/theultimatechallenge/quizsection/${sessionId}`);
    }
  };

  const handleBackClick = () => {
    if (verificationRequested) {
      navigate(`/theultimatechallenge/quizsection/${sessionId}`);
    } else {
      handleNavigation(resetQuestionStatus);
    }
  };

  const handlePlayLater = () => {
    if (verificationRequested) {
      navigate(`/theultimatechallenge/quizsection/${sessionId}`);
    } else {
      handleNavigation(resetQuestionStatus);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/quicktime",
    ];
    if (!validTypes.includes(file.type)) {
      setSubmitError(
        "Please upload an image (JPEG, PNG, GIF) or video (MP4, MOV)"
      );
      return;
    }

    setSelectedFile(file);
    setFileUploaded(true);
    setSubmitError(null);
    setIsAnswerSubmitted(false);
    setUploadProgress(0); // Reset progress when new file is selected
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileUploaded(false);
    setPreviewUrl(null);
    setSubmitError(null);
    setIsAnswerSubmitted(false);
    setUploadProgress(0);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraImageRef.current) {
      cameraImageRef.current.value = "";
    }
    if (cameraVideoRef.current) {
      cameraVideoRef.current.value = "";
    }
  };

  // Upload image options
  const openUploadOptions = () => {
    if (cardData.answerType === "fileUpload") {
      if (fileInputRef.current) fileInputRef.current.click();
    } else {
      setShowUploadMenu((v) => !v);
    }
  };
  const handleClickPhoto = () => {
    setShowUploadMenu(false);
    if (cameraImageRef.current) cameraImageRef.current.click();
  };
  const handleUploadImage = () => {
    setShowUploadMenu(false);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleRecordVideo = () => {
    setShowUploadMenu(false);
    if (cameraVideoRef.current) cameraVideoRef.current.click();
  };
  const handleUploadVideo = () => {
    setShowUploadMenu(false);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setSubmitError("Please select a file first");
      return;
    }

    const fileLimit = cardData.answerType === "image" ? 20 : 50;

    if (selectedFile.size > fileLimit * 1024 * 1024) {
      setSubmitError(`File size exceeds ${fileLimit} MB limit`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("answerFile", selectedFile);
      formData.append("questionId", cardData.id);

      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_BASE_URL
        }/api/v1/theultimatechallenge/uploadanswer`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (response.data.success) {
        setIsAnswerSubmitted(true);
        setUploadProgress(100);
        navigate(`/theultimatechallenge/taskcomplete/${sessionId}`, {
          state: {
            pointsEarned: response.data.pointsEarned,
            message: "File uploaded successfully!",
            isCorrect: true,
          },
        });
      } else {
        setSubmitError(response.data.error || "File upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setSubmitError(error.response?.data?.error || "Failed to upload file");
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVideo = (file) => {
    return file && file.type.startsWith("video/");
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
          <div
            className="flex gap-1.5 cursor-pointer"
            onClick={handleBackClick}
          >
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

        {/* Question Image */}
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

        {/* Question Text */}
        <div className="w-full mx-auto border-2 border-[#BA273299]/60 bg-[#FFA8AE4D]/85 rounded-[20px] backdrop-blur-[53px] mt-4">
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
      </div>

      {/* Submit Area */}
      <div className="w-full flex flex-col items-center justify-center mb-4">
        {submitError && (
          <div className="text-red-500 text-center mb-2 text-sm">
            {submitError}
          </div>
        )}

        {/* Progress Bar */}
        {isSubmitting && (
          <div className="w-full mb-4">
            <div className="w-full border-2 border-[#BA273299]/60 bg-[#FFA8AE4D]/85 rounded-[20px] backdrop-blur-[53px] p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white text-sm font-mono">
                  Uploading...
                </span>
                <span className="text-white text-sm font-mono">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-[#BA2732] h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* File Preview */}
        {selectedFile && previewUrl && (
          <div className="w-full mb-4">
            <div className="w-full border-2 border-[#BA273299]/60 bg-[#FFA8AE4D]/85 rounded-[20px] backdrop-blur-[53px] p-3 relative">
              {/* Remove button */}
              <button
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                disabled={isSubmitting}
              >
                <X className="text-white w-4 h-4" />
              </button>

              <h2 className="text-white text-center text-sm mb-2 font-mono">
                Your Answer Preview:
              </h2>
              <div className="w-full h-[120px] rounded-[12px] overflow-hidden bg-black/20">
                {isVideo(selectedFile) ? (
                  <video
                    src={previewUrl}
                    className="w-full h-full object-contain"
                    controls
                    muted
                  />
                ) : (
                  <img
                    src={previewUrl}
                    className="w-full h-full object-contain"
                    alt="Preview"
                  />
                )}
              </div>
              <p className="text-white text-xs text-center mt-2 opacity-75">
                {selectedFile.name} (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          </div>
        )}

        <button
          className={`w-full h-[40px] bg-[#BA2732] rounded-[12px] mb-2 disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity ${
            verificationRequested ? 'opacity-30 cursor-not-allowed' : ''
          }`}
          onClick={!verificationRequested ? (fileUploaded ? handleSubmit : () => openUploadOptions()) : undefined}
          disabled={isSubmitting || verificationRequested}
        >
          {isSubmitting ? (
            <span className="text-white">Uploading... {uploadProgress}%</span>
          ) : fileUploaded ? (
            <>
              {cardData.answerType === "image" ? (
                <Camera className="text-white" />
              ) : cardData.answerType === "video" ? (
                <Video className="text-white" />
              ) : (
                <ClipboardCheck className="text-white" />
              )}
              <span className="text-white">Submit Answer</span>
            </>
          ) : (
            <>
              {cardData.answerType === "image" ? (
                <Camera className="text-white" />
              ) : cardData.answerType === "video" ? (
                <Video className="text-white" />
              ) : (
                <ClipboardCheck className="text-white" />
              )}
              <span className="text-white">
                Upload {cardData.answerType === "image" ? "Image" : cardData.answerType === "video" ? "Video" : "File"}
              </span>
            </>
          )}
        </button>

        {/* Upload options menu for images */}
        {!fileUploaded && showUploadMenu && cardData.answerType === "image" && (
          <div className="w-full mb-2">
            <div className="w-full border-2 border-[#BA273299]/60 bg-[#FFA8AE4D]/85 rounded-[12px] backdrop-blur-[53px] p-2 flex gap-2">
              <button
                type="button"
                className="flex-1 h-[40px] bg-[#BA2732] rounded-[10px] flex items-center justify-center gap-2 text-white"
                onClick={handleClickPhoto}
                disabled={isSubmitting}
              >
                <span>Click Photo</span>
              </button>
              <button
                type="button"
                className="flex-1 h-[40px] border border-white/70 text-white rounded-[10px] flex items-center justify-center gap-2"
                onClick={handleUploadImage}
                disabled={isSubmitting}
              >
                <span>Upload Image</span>
              </button>
            </div>
          </div>
        )}

        {/* Upload options menu for videos */}
        {!fileUploaded && showUploadMenu && cardData.answerType === "video" && (
          <div className="w-full mb-2">
            <div className="w-full border-2 border-[#BA273299]/60 bg-[#FFA8AE4D]/85 rounded-[12px] backdrop-blur-[53px] p-2 flex gap-2">
              <button
                type="button"
                className="flex-1 h-[40px] bg-[#BA2732] rounded-[10px] flex items-center justify-center gap-2 text-white"
                onClick={handleRecordVideo}
                disabled={isSubmitting}
              >
                <span>Record Video</span>
              </button>
              <button
                type="button"
                className="flex-1 h-[40px] border border-white/70 text-white rounded-[10px] flex items-center justify-center gap-2"
                onClick={handleUploadVideo}
                disabled={isSubmitting}
              >
                <span>Upload Video</span>
              </button>
            </div>
          </div>
        )}

        {/* Manual Verification button — for video, image, or fileUpload answerType */}
        {(cardData.answerType === "video" || cardData.answerType === "image" || cardData.answerType === "fileUpload") && (
          <div className="w-full mt-3 flex flex-col gap-2">
            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/40 text-xs font-mono">or</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            {/* Rejection notice */}
            {verificationRejected && !verificationRequested && (
              <div className="w-full border-2 border-red-500/60 bg-red-500/15 rounded-[14px] p-3 flex items-center gap-3">
                <XCircle className="text-red-400 flex-shrink-0" size={18} />
                <div>
                  <p className="text-red-300 text-xs font-mono font-semibold">Verification Rejected</p>
                  <p className="text-red-300/70 text-xs font-mono">
                    Admin rejected your request. You can try again or{" "}
                    {cardData.answerType === "image"
                      ? "upload an image."
                      : cardData.answerType === "video"
                      ? "upload a video."
                      : "upload a file."}
                  </p>
                </div>
              </div>
            )}

            <button
              className={`w-full h-[44px] rounded-[12px] flex items-center justify-center gap-2 transition-all duration-300 font-mono text-sm ${
                verificationRequested
                  ? 'bg-amber-500/30 border-2 border-amber-400/50 cursor-not-allowed'
                  : isRequestingVerification
                  ? 'bg-purple-700/60 border-2 border-purple-400/40 cursor-not-allowed'
                  : 'bg-[#5B2DC8] border-2 border-purple-400/30 hover:bg-[#4a22a8] active:scale-95 cursor-pointer'
              }`}
              onClick={async () => {
                if (verificationRequested || isRequestingVerification) return;
                setIsRequestingVerification(true);
                setVerificationRejected(false);
                try {
                  const response = await axios.post(
                    `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/theultimatechallenge/request-manual-verification`,
                    { questionId: cardData.id },
                    { withCredentials: true }
                  );
                  setIsRequestingVerification(false);
                  if (response.data?.success) {
                    setVerificationRequested(true);
                  } else {
                    alert(response.data?.error || "Failed to request verification.");
                  }
                } catch (err) {
                  setIsRequestingVerification(false);
                  alert(err.response?.data?.error || "Failed to request verification.");
                }
              }}
              disabled={verificationRequested || isRequestingVerification}
            >
              {verificationRequested ? (
                <><CheckCircle className="text-amber-400" size={18} /><span className="text-amber-300">Verification Requested ✓</span></>
              ) : isRequestingVerification ? (
                <><div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" /><span className="text-purple-200">Sending...</span></>
              ) : (
                <><ClipboardCheck className="text-white" size={18} /><span className="text-white">{verificationRejected ? 'Request Verification Again' : 'Request Manual Verification'}</span></>
              )}
            </button>

            {verificationRequested && (
              <p className="text-amber-300/60 text-[11px] font-mono text-center">
                Waiting for admin to review... Upload is disabled.
              </p>
            )}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept={
            cardData.answerType === "image"
              ? "image/*"
              : cardData.answerType === "video"
              ? "video/*"
              : "*/*"
          }
        />

        {/* Hidden camera input to invoke native camera */}
        {cardData.answerType === "image" && (
          <input
            type="file"
            ref={cameraImageRef}
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        )}
        {cardData.answerType === "video" && (
          <input
            type="file"
            ref={cameraVideoRef}
            accept="video/*"
            capture
            onChange={handleFileChange}
            className="hidden"
          />
        )}
      </div>
      <UserTimer sessionId={sessionId} />
    </div>
  );
}

export default BodyGame;
