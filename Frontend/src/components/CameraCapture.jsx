import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Video, RotateCcw, Check } from 'lucide-react';

const CameraCapture = ({ 
  isOpen, 
  onClose, 
  onCapture, 
  modes = ["picture", "video"] // Available modes
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  
  const [currentMode, setCurrentMode] = useState(modes[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back
  const [error, setError] = useState(null);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeCamera();
    } else {
      cleanup();
    }
  }, [isOpen, facingMode]);

  const initializeCamera = async () => {
    try {
      setError(null);
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: modes.includes('video')
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    setCapturedMedia(null);
    setMediaType(null);
    setIsRecording(false);
    setRecordingTime(0);
    setError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setCapturedMedia(URL.createObjectURL(blob));
      setMediaType('image');
      onCapture(file);
    }, 'image/jpeg', 0.9);
  };

  const startVideoRecording = () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
        setCapturedMedia(URL.createObjectURL(blob));
        setMediaType('video');
        onCapture(file);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Unable to start recording');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCapture = () => {
    if (currentMode === 'picture') {
      capturePhoto();
    } else if (currentMode === 'video') {
      if (isRecording) {
        stopVideoRecording();
      } else {
        startVideoRecording();
      }
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4">
        <div className="flex justify-between items-center text-white">
          <button onClick={handleClose} className="p-2">
            <X size={24} />
          </button>
          
          {/* Mode switcher - only show if multiple modes available */}
          {modes.length > 1 && (
            <div className="flex bg-black/50 rounded-full p-1">
              {modes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCurrentMode(mode)}
                  className={`px-4 py-2 rounded-full text-sm capitalize ${
                    currentMode === mode 
                      ? 'bg-white text-black' 
                      : 'text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}
          
          <button onClick={switchCamera} className="p-2">
            <RotateCcw size={24} />
          </button>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative w-full h-full">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center p-4">
              <p className="mb-4">{error}</p>
              <button 
                onClick={initializeCamera}
                className="bg-white text-black px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span>{formatTime(recordingTime)}</span>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex justify-center items-center">
          <button
            onClick={handleCapture}
            disabled={!!error}
            className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center ${
              isRecording 
                ? 'bg-red-600' 
                : 'bg-white/20 hover:bg-white/30'
            } disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
          >
            {currentMode === 'picture' ? (
              <Camera size={32} className="text-white" />
            ) : (
              <Video size={32} className="text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;