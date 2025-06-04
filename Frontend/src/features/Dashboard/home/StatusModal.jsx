import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const StatusModal = ({ team, onClose, socket, transactionsEnabled }) => {
  const [questionsData, setQuestionsData] = useState({
    level1: [],
    level2: [],
    level3: []
  });
  const [selectedQuestions, setSelectedQuestions] = useState({
    level1: [],
    level2: []
  });

  useEffect(() => {
    // Initialize questions data from team data
    if (team && team.questions) {
      const level1Questions = team.questions.filter(q => q.level === 1);
      const level2Questions = team.questions.filter(q => q.level === 2);
      const level3Questions = team.questions.filter(q => q.level === 3);

      setQuestionsData({
        level1: level1Questions,
        level2: level2Questions,
        level3: level3Questions
      });

      // Set initially selected questions based on current status
      setSelectedQuestions({
        level1: level1Questions
          .filter(q => q.status === 'available')
          .map(q => q.id),
        level2: level2Questions
          .filter(q => q.status === 'available')
          .map(q => q.id)
      });
    }
  }, [team]);

  const handleQuestionToggle = async (level, questionId) => {
    // Only allow toggling if transactions are enabled and the question is in "attending" status
    const question = questionsData[level].find(q => q.id === questionId);
    if (!transactionsEnabled || question.status !== 'attending') {
      if (!transactionsEnabled) {
        alert('Transactions must be enabled to modify question status');
      }
      return;
    }

    // Store previous state for rollback in case of API failure
    const prevSelectedQuestions = { ...selectedQuestions };

    // Optimistically update UI
    setSelectedQuestions(prev => ({
      ...prev,
      [level]: prev[level].includes(questionId)
        ? prev[level].filter(q => q !== questionId)
        : [...prev[level], questionId]
    }));

    try {
      // Make API call to update question status
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/update-question-status`,
        {
          teamId: team.id,
          questionId,
          status: selectedQuestions[level].includes(questionId) ? 'attending' : 'available'
        },
        { withCredentials: true }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update question status');
      }

      console.log(`Updated question ${questionId} status for team ${team.id}`);
    } catch (error) {
      // Revert UI state on error
      setSelectedQuestions(prevSelectedQuestions);
      alert(`Error updating question status: ${error.message}`);
      console.error('Error updating question status:', error);
    }
  };

  const handleSave = () => {
    if (!transactionsEnabled) {
      alert('Transactions must be enabled to save changes');
      return;
    }

    // No need for socket emit since API call handles updates
    // console.log('Closing modal for team:', team.name);
    // console.log('Level 1 active questions:', selectedQuestions.level1);
    // console.log('Level 2 active questions:', selectedQuestions.level2);
    
    onClose();
  };

  const renderQuestionGrid = (level, questions) => {
    const levelKey = `level${level}`;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Level {level}</h3>
        <div className="grid grid-cols-10 gap-2">
          {questions.map((question, index) => {
            const displayNumber = index + 1; // Assign a display number for clarity
            const isCompleted = question.status === 'done';
            const isInProgress = question.status === 'attending';
            
            let buttonClass = "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ";
            
            if (isCompleted) {
              // Light green for completed questions
              buttonClass += "bg-green-200 text-white cursor-not-allowed shadow-sm";
            } else if (isInProgress) {
              // Light orange for in-progress questions
              buttonClass += transactionsEnabled 
                ? "bg-orange-200 text-white hover:bg-orange-300 cursor-pointer shadow-sm"
                : "bg-orange-200 text-white cursor-not-allowed opacity-60";
            } else {
              // Available questions - dashed orange border with white background
              buttonClass += "bg-white text-orange-500 border-2 border-dashed border-orange-400 cursor-not-allowed";
            }

            return (
              <button
                key={question.id}
                onClick={() => handleQuestionToggle(levelKey, question.id)}
                className={buttonClass}
                disabled={isCompleted || !isInProgress || !transactionsEnabled}
                title={
                  !transactionsEnabled ? 'Enable transactions to modify questions' :
                  isCompleted ? 'Completed' : 
                  isInProgress ? 'In Progress - Click to set as available' : 
                  'Available'
                }
              >
                {displayNumber}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-sans">
      <div className="bg-white rounded-lg p-6 w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Update Playing Status
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Team {team?.name} - Tap on a number to toggle game status.
            </p>
            {!transactionsEnabled && (
              <p className="text-xs text-orange-600 mt-1 font-medium">
                ⚠️ Transactions are disabled. Enable transactions to modify questions.
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Legend */}
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-green-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-center space-x-6 text-sm flex-wrap gap-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-200 rounded-full shadow-sm"></div>
              <span className="font-medium">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-200 rounded-full shadow-sm"></div>
              <span className="font-medium">In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-white rounded-full border-2 border-dashed border-orange-400"></div>
              <span className="font-medium">Available</span>
            </div>
          </div>
        </div>

        {/* Level 1 Questions */}
        {renderQuestionGrid(1, questionsData.level1)}

        {/* Level 2 Questions */}
        {renderQuestionGrid(2, questionsData.level2)}

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
              transactionsEnabled 
                ? 'bg-orange-500 hover:bg-orange-600' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!transactionsEnabled}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;