import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, Camera } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getSocket } from '../../../services/sockets/theUltimateChallenge';
import axios from 'axios';
import Modal from 'react-modal';

// Set modal root for accessibility
Modal.setAppElement('#root');

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
  const socket = getSocket();

  // Clean up socket on unmount
  useEffect(() => {
    return () => {
      if (socket && cardData?.id) {
        socket.emit("reset-question-status", { questionId: cardData.id });
        socket.off('error');
      }
    };
  }, [socket, cardData?.id]);

  // Validate card data on load
  useEffect(() => {
    if (!cardData || !cardData.questionImageUrl || !cardData.text || !cardData.id) {
      navigate(`/quizsection/${sessionId}`);
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
      socket.emit("reset-question-status", { questionId: cardData.id }, (response) => {
        navigate(`/quizsection/${sessionId}`);
      });
    } else {
      navigate(`/quizsection/${sessionId}`);
    }
  };

  const handleBackClick = () => resetQuestionStatus();
  const handlePlayLater = () => resetQuestionStatus();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      setSubmitError('Please upload an image (JPEG, PNG, GIF) or video (MP4, MOV)');
      return;
    }

    

    setSelectedFile(file);
    setFileUploaded(true);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setSubmitError('Please select a file first');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('answerFile', selectedFile);
      formData.append('questionId', cardData.id);

      const response = await axios.post('http://localhost:3000/api/v1/theultimatechallenge/uploadanswer', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      if (response.data.success) {
        navigate(`/taskcomplete/${sessionId}`, {
          state: {
            pointsEarned: response.data.pointsEarned,
            message: 'File uploaded successfully!',
            isCorrect: true
          }
        });
      } else {
        setSubmitError(response.data.error || 'File upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setSubmitError(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cardData) return null;

  return (
    <div className='mx-[26px] flex flex-col justify-between font-mono' style={{ height: `${window.innerHeight}px` }}>
      <div className='mb-[26px] flex flex-col h-[100%] pt-[26px]'>
        {/* Header */}
        <div className='text-white w-full h-[36px] flex justify-between items-center'>
          <div className='flex gap-1.5 cursor-pointer' onClick={handleBackClick}>
            <ChevronLeft className='text-white text-2xl' />
            <h1 className='text-[16px] font-mono'>{cardData.category} Game</h1>
          </div>
          <button 
            className='text-white border-[1px] rounded-[12px] w-[108px] h-[32px] border-white text-[14px]'
            onClick={handlePlayLater}
          >
            Play Later
          </button>
        </div>

        {/* Question Image */}
        <div className='w-[100%] h-[206px] mx-auto mt-3'>
          {imageError ? (
            <div className='w-full h-full rounded-[20px] bg-gray-500 flex items-center justify-center text-white'>
              Image Failed to Load
            </div>
          ) : (
            <img 
              src={cardData.questionImageUrl}
              className='rounded-[20px] w-full h-full object-cover' 
              alt="question"
              onError={() => setImageError(true)}
            />
          )}
        </div>

        {/* Question Text */}
        <div className='w-full mx-auto border-2 border-[#BA273299]/60 bg-[#FFA8AE4D]/85 rounded-[20px] backdrop-blur-[53px] mt-4'>
          <div className='m-3 text-white'>
            <h1 className='text-[16px] flex justify-center leading-[20px] text-center font-mono'>
              {cardData.text}
            </h1>
          </div>
        </div>

        {/* Points Display */}
        <div className='w-full mx-auto flex justify-center mt-4'>
          <div className='w-[157px] h-[20px]'>
            <h1 className='text-[20px] text-white text-center'>Points: {cardData.points}</h1>
          </div>
        </div>

       
      </div>

      {/* Submit Area */}
      <div className='w-full flex flex-col items-center justify-center mb-4'>
        {submitError && (
          <div className="text-red-500 text-center mb-2 text-sm">
            {submitError}
          </div>
        )}
        
        <button 
          className='w-full h-[40px] bg-[#BA2732] rounded-[12px] mb-2 disabled:opacity-50 flex items-center justify-center gap-2'
          onClick={fileUploaded ? handleSubmit : () => fileInputRef.current.click()}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className='text-white'>Uploading...</span>
          ) : fileUploaded ? (
            <>
              <Camera className='text-white' />
              <span className='text-white'>Submit Answer</span>
            </>
          ) : (
            <>
              <Camera className='text-white' />
              <span className='text-white'>Select File</span>
            </>
          )}
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*"
          capture="environment"
        />
        
       
      </div>
    </div>
  );
}

export default BodyGame;