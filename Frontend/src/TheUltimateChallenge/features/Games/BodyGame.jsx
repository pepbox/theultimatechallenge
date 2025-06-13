import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, Camera, X, Video } from "lucide-react";
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
  const [fileUploaded, setFileUploaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const socket = getSocket();

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

    socket.on("session-pause-updated", onPauseUpdated);
    socket.on("team-data", onTeamData);
    socket.on("question-status-changed-by-admin", onQuestionStatusChanged);
    socket.on("admin-updated-total-score", onAdminUpdatedTotalScore);

    return () => {
      if (socket && cardData?.id) {
        socket.emit("reset-question-status", { questionId: cardData.id });
        socket.off("error");
        socket.off("team-data", onTeamData);
        socket.off("session-pause-updated", onPauseUpdated);
        socket.off("question-status-changed-by-admin", onQuestionStatusChanged);
        socket.off("admin-updated-total-score", onAdminUpdatedTotalScore);
      }
    };
  }, [
    socket,
    cardData?.id,
    navigate,
    sessionId,
    selectedFile,
    isAnswerSubmitted,
    isSubmitting,
  ]);

  // Validate card data on load
  useEffect(() => {
    if (
      !cardData ||
      !cardData.questionImageUrl ||
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
    handleNavigation(resetQuestionStatus);
  };

  const handlePlayLater = () => {
    handleNavigation(resetQuestionStatus);
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
      className="mx-[26px] flex flex-col justify-between font-mono"
      style={{ minHeight: `${window.innerHeight}px` }}
    >
      <div className="mb-[26px] flex flex-col h-[100%] pt-[26px]">
        {/* Header */}
        <UserTimer sessionId={sessionId} />

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
          className="w-full h-[40px] bg-[#BA2732] rounded-[12px] mb-2 disabled:opacity-50 flex items-center justify-center gap-2"
          onClick={
            fileUploaded ? handleSubmit : () => fileInputRef.current.click()
          }
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="text-white">Uploading... {uploadProgress}%</span>
          ) : fileUploaded ? (
            <>
              {cardData.answerType === "image" ? (
                <Camera className="text-white" />
              ) : (
                <Video className="text-white" />
              )}
              <span className="text-white">Submit Answer</span>
            </>
          ) : (
            <>
              {cardData.answerType === "image" ? (
                <Camera className="text-white" />
              ) : (
                <Video className="text-white" />
              )}
              <span className="text-white">
                Upload {cardData.answerType === "image" ? "Image" : "Video"}
              </span>
            </>
          )}
        </button>

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
              : null
          }
        />
      </div>
    </div>
  );
}

export default BodyGame;
