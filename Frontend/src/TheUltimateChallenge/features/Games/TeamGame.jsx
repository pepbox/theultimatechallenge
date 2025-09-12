import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, Camera, X, Video } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import UserTimer from "../../../features/user/timer/components/UserTimer";
import { getSocket } from "../../../services/sockets/theUltimateChallenge";

function TeamGames() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const imageCameraRef = useRef(null);
  const videoCameraRef = useRef(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { sessionId } = useParams();
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const socket = getSocket();

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

  useEffect(() => {
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
    socket.on("game-ended", onGameEnded);
  }, [socket]);

  const handleClick = () => {
    if (fileUploaded) {
      navigate("/theultimatechallenge/mindgame");
    } else {
      setShowUploadMenu((v) => !v);
    }
  };

  const handleClickPhoto = () => {
    setShowUploadMenu(false);
    if (imageCameraRef.current) imageCameraRef.current.click();
  };

  const handleRecordVideo = () => {
    setShowUploadMenu(false);
    if (videoCameraRef.current) videoCameraRef.current.click();
  };

  const handleUploadFromDevice = () => {
    setShowUploadMenu(false);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileUploaded(true);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileUploaded(false);
    setPreviewUrl(null);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (imageCameraRef.current) {
      imageCameraRef.current.value = "";
    }
    if (videoCameraRef.current) {
      videoCameraRef.current.value = "";
    }
  };

  const isVideo = (file) => {
    return file && file.type.startsWith("video/");
  };

  return (
    <div
      className="mx-[26px] flex flex-col justify-between font-mono"
      style={{ minHeight: `${window.innerHeight}px` }}
    >
      <div className="mb-[26px] flex flex-col h-[100%] pt-[26px]">
        <UserTimer sessionId={sessionId} />
        <div className="text-white w-full h-[36px] flex justify-between items-center">
          <div
            className="flex gap-1.5"
            onClick={() => navigate("/quizsection")}
          >
            <ChevronLeft className="text-white text-2xl" />
            <h1
              className="text-[16px]"
              style={{ fontFamily: '"B612 Mono", monospace' }}
            >
              Team Game
            </h1>
          </div>
          <button className="text-white border-[1px] rounded-[12px] w-[108px] h-[32px] border-white text-[14px]">
            Play Later
          </button>
        </div>

        <div className="w-full mx-auto border-2 border-[#D4871199]/60 bg-[#FFD89B4D]/85 rounded-[20px] backdrop-blur-[53px] mt-4">
          <div className="m-3 text-white">
            <h1 className="text-[16px] flex justify-center leading-[20px] text-center font-mono font-normal">
              Get your team to take a picture with the tallest person in this
              room. Person should be from another team. They should hold a tag
              which says "Tallest in the room".
            </h1>
          </div>
        </div>

        <div className="w-full mx-auto flex justify-center mt-4">
          <div className="w-[157px] h-[20px]">
            <h1 className="text-[20px] text-white text-center">Points : 300</h1>
          </div>
        </div>
      </div>

      {/* File Preview */}
      {selectedFile && previewUrl && (
        <div className="w-full mb-4">
          <div className="w-full border-2 border-[#D4871199]/60 bg-[#FFD89B4D]/85 rounded-[20px] backdrop-blur-[53px] p-3 relative">
            {/* Remove button */}
            <button
              onClick={handleRemoveFile}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
            >
              <X className="text-white w-4 h-4" />
            </button>

            <h2 className="text-white text-center text-sm mb-2 font-mono">
              Your Photo Preview:
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

      <div className="w-full flex items-center justify-center mb-4">
        <button
          className="w-full h-[40px] bg-[#95400E] rounded-[12px]"
          onClick={handleClick}
        >
          <div className="flex justify-center gap-[7px]">
            <Camera className="text-white" />
            <h1 className="text-white">
              {fileUploaded ? "Submit" : "Capture"}
            </h1>
          </div>
        </button>
      </div>

      {/* Upload options menu */}
      {!fileUploaded && showUploadMenu && (
        <div className="w-full mb-4">
          <div className="w-full border-2 border-[#D4871199]/60 bg-[#FFD89B4D]/85 rounded-[12px] backdrop-blur-[53px] p-2 flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 h-[40px] bg-[#95400E] rounded-[10px] flex items-center justify-center gap-2 text-white"
                onClick={handleClickPhoto}
              >
                <span>Click Photo</span>
              </button>
              <button
                type="button"
                className="flex-1 h-[40px] bg-[#95400E] rounded-[10px] flex items-center justify-center gap-2 text-white"
                onClick={handleRecordVideo}
              >
                <span>Record Video</span>
              </button>
            </div>
            <button
              type="button"
              className="w-full h-[40px] border border-white/70 text-white rounded-[10px] flex items-center justify-center gap-2"
              onClick={handleUploadFromDevice}
            >
              <span>Upload from device</span>
            </button>
          </div>
        </div>
      )}

      <div className="w-full flex items-center justify-center mb-8">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*"
        />
        {/* Hidden camera inputs */}
        <input
          type="file"
          ref={imageCameraRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          type="file"
          ref={videoCameraRef}
          accept="video/*"
          capture
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default TeamGames;
