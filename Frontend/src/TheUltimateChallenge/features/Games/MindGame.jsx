import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getSocket } from '../../../services/sockets/theUltimateChallenge';
import axios from 'axios';

function MindGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams();
  const cardData = location.state;
  const [imageError, setImageError] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showWrongAnswerPopup, setShowWrongAnswerPopup] = useState(false);
  const [pointsDeducted, setPointsDeducted] = useState(0);
  const socket = getSocket();

  // Clean up socket on unmount
  useEffect(() => {
    const onPauseUpdated = (data) => {
      if (data.isPaused) {
        navigate(`/theultimatechallenge/quizsection/${sessionId}`);
      }
    };

    const onTeamData = (data) => {
      if (data.teamInfo.currentLevel !== location.state.level) {
        navigate(`/theultimatechallenge/quizsection/${sessionId}`);
      }
    };

    const onQuestionStatusChanged = (data) => {
      if (data.questionId === cardData?.id) {
        navigate(`/theultimatechallenge/quizsection/${sessionId}`);
      }
    };

    const onAdminUpdatedTotalScore = (data) => {
      navigate(`/theultimatechallenge/quizsection/${sessionId}`);
    };

    socket.on("session-pause-updated", onPauseUpdated);
    socket.on("team-data", onTeamData);
    socket.on("question-status-changed-by-admin", onQuestionStatusChanged);
    socket.on("admin-updated-total-score", onAdminUpdatedTotalScore);

    return () => {
      if (socket && cardData?.id) {
        socket.emit("reset-question-status", { questionId: cardData.id });
        socket.off('error');
        socket.off("team-data", onTeamData);
        socket.off("session-pause-updated", onPauseUpdated);
        socket.off("question-status-changed-by-admin", onQuestionStatusChanged);
        socket.off("admin-updated-total-score", onAdminUpdatedTotalScore);
      }
    };
  }, [socket, cardData?.id, navigate, sessionId]);

  // Validate card data on load
  useEffect(() => {
    if (!cardData || !cardData.questionImageUrl || !cardData.text || !cardData.id) {
      navigate(`/theultimatechallenge/quizsection/${sessionId}`);
    }
  }, [cardData, navigate, sessionId]);

  const resetQuestionStatus = () => {
    if (socket && cardData?.id) {
      socket.emit("reset-question-status", { questionId: cardData.id }, (response) => {
        navigate(`/theultimatechallenge/quizsection/${sessionId}`);
      });
    } else {
      navigate(`/theultimatechallenge/quizsection/${sessionId}`);
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
          navigate(`/theultimatechallenge/taskcomplete/${sessionId}`, { 
            state: { 
              pointsEarned: response.data.pointsEarned,
              message: 'Correct Answer!',
              isCorrect: true
            } 
          });
        } else {
          setPointsDeducted(Math.abs(response.data.pointsEarned));
          setShowWrongAnswerPopup(true);
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

  const handleContinueWithTasks = () => {
    // navigate(`/theultimatechallenge/quizsection/${sessionId}`);
    setShowWrongAnswerPopup(false);
    setAnswer('');
  };

  if (!cardData) return null;

  return (
    <div className='mx-[26px] flex flex-col justify-between font-mono' style={{ minHeight: `${window.innerHeight}px` }}>
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

      {/* Wrong Answer Popup */}
      {showWrongAnswerPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/75">
          <div className="bg-gradient-to-b from-[#E5FFD4]/20 to-[#D4E5FF]/20 border-2 border-white/20 rounded-2xl p-6 w-[90%] max-w-sm flex flex-col items-center backdrop-blur-3xl">
            <h2 className="text-white text-xl font-bold mb-2 text-center">
              You've given a wrong answer.
            </h2>
            <p className="text-white text-3xl font-bold mb-4">
              -{pointsDeducted} Points
            </p>
            <p className="text-white text-sm mb-6 text-center">
             Keep trying until you get the right answer.
            </p>
            <button
              onClick={handleContinueWithTasks}
              className="bg-[#F5A623] text-black font-bold py-2 px-6 rounded-full hover:bg-[#e0891c] transition-colors"
            >
              Continue with Tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MindGame;