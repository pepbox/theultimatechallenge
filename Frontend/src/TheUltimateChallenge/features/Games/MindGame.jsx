import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getSocket } from '../../../services/sockets/theUltimateChallenge';
import axios from 'axios';
import Modal from 'react-modal';

// Set modal root for accessibility
Modal.setAppElement('#root');

// Custom modal styles
const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1E1E1E',
    border: '2px solid #295B08',
    borderRadius: '20px',
    padding: '24px',
    maxWidth: '90%',
    width: '400px',
    color: 'white'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000
  }
};

function MindGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams();
  const cardData = location.state;
  const [imageError, setImageError] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showWrongAnswerModal, setShowWrongAnswerModal] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
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

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setSubmitError('Please enter an answer');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/theultimatechallenge/uploadtextanswer`, {
        questionId: cardData.id,
        answer: answer.trim()
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        if (response.data.isCorrect) {
          setPointsEarned(response.data.pointsEarned);
          navigate(`/taskcomplete/${sessionId}`, { 
            state: { 
              pointsEarned: response.data.pointsEarned,
              message: 'Correct Answer!',
              isCorrect: true
            } 
          });
        } else {
          setShowWrongAnswerModal(true);
        }
      } else {
        setSubmitError(response.data.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error.response?.data?.error || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
    }
  };

  const closeWrongAnswerModal = () => {
    setShowWrongAnswerModal(false);
    setAnswer('');
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
        <div className='w-full mx-auto border-2 border-[#295B0899]/60 bg-[#E5FFD44D]/85 rounded-[20px] backdrop-blur-[53px] mt-4'>
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

      {/* Answer Input Area */}
      <div className='w-full flex flex-col items-center justify-center mb-8'>
        {submitError && (
          <div className="text-red-500 text-center mb-2 text-sm">
            {submitError}
          </div>
        )}
        
        <div className='w-full mx-auto flex gap-[12px] mb-2'>
          <input 
            className='border border-white/80 min-w-[219px] h-[40px] flex-2/3 rounded-[12px] text-white pl-3 text-[14px] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#295B08]'
            placeholder='Enter your answer...' 
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSubmitting}
          />
          <button 
            className='w-[102px] h-[40px] bg-[#295B08] rounded-[12px] flex-1/3 disabled:opacity-50 hover:bg-[#1e4005] transition-colors'
            onClick={handleSubmitAnswer}
            disabled={isSubmitting || !answer.trim()}
          >
            <div className='flex justify-center gap-[7px] z-10'>
              <h1 className='text-white'>{isSubmitting ? '...' : 'Submit'}</h1>
            </div>
          </button>
        </div>
        
        <p className='text-white/60 text-xs text-center'>
          Press Enter to submit your answer
        </p>
      </div>

      {/* Wrong Answer Modal */}
      <Modal
        isOpen={showWrongAnswerModal}
        onRequestClose={closeWrongAnswerModal}
        style={customModalStyles}
        contentLabel="Wrong Answer"
      >
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Incorrect Answer</h2>
          <p className="mb-6 text-center">That's not the correct answer. Please try again!</p>
          <div className="flex gap-4">
            <button
              onClick={closeWrongAnswerModal}
              className="px-6 py-2 bg-[#295B08] text-white rounded-lg hover:bg-[#1e4005] transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handlePlayLater}
              className="px-6 py-2 border border-white text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Play Later
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MindGame;