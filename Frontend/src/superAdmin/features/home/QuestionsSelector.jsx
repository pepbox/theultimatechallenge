import React, { useState, useEffect, useMemo } from 'react';
import { Close } from '@mui/icons-material';
import { CircularProgress, Checkbox } from '@mui/material';

const QuestionsSelector = ({ onClose, selectedQuestions, onQuestionsSelected, maxQuestionsPerLevel, numberOfLevels, isCustomSelectionAllowed }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState(selectedQuestions);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/theultimatechallenge/getquestions`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        
        const data = await response.json();
        setQuestions(data);
        
        if (!isCustomSelectionAllowed) {
          const newSelections = {};
          for (let level = 1; level <= numberOfLevels; level++) {
            const levelQuestions = data
              .filter(q => q.level === level)
              .slice(0, maxQuestionsPerLevel);
            newSelections[level] = levelQuestions;
          }
          setSelections(newSelections);
          Object.entries(newSelections).forEach(([level, questions]) => {
            onQuestionsSelected(parseInt(level), questions);
          });
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [maxQuestionsPerLevel, numberOfLevels, isCustomSelectionAllowed]);

  const handleTabChange = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  const handleCheckboxChange = (question) => {
    if (!isCustomSelectionAllowed) return;

    const currentLevelSelections = [...(selections[activeTab] || [])];
    const questionIndex = currentLevelSelections.findIndex(q => q._id === question._id);
    
    if (questionIndex >= 0) {
      currentLevelSelections.splice(questionIndex, 1);
    } else if (currentLevelSelections.length < maxQuestionsPerLevel) {
      currentLevelSelections.push(question);
    }
    
    const updatedSelections = {
      ...selections,
      [activeTab]: currentLevelSelections
    };
    
    setSelections(updatedSelections);
    onQuestionsSelected(activeTab, currentLevelSelections);
  };

  const isQuestionSelected = (questionId) => {
    return (selections[activeTab] || []).some(q => q._id === questionId);
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => q.level === activeTab);
  }, [questions, activeTab]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Questions</h2>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <Close className="h-6 w-6" />
        </button>
      </div>

      <div className="mb-4 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          {Array.from({ length: numberOfLevels }, (_, i) => i + 1).map((level) => (
            <li key={level} className="mr-2">
              <button
                onClick={() => handleTabChange(level)}
                className={`inline-block p-4 ${
                  activeTab === level
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
              >
                Level {level} ({(selections[level] || []).length}/{maxQuestionsPerLevel})
              </button>
            </li>
          ))}
        </ul>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <CircularProgress />
          <p>Loading questions...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="overflow-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-10 py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuestions.map((question) => (
                <tr key={question._id}>
                  <td className="py-4 px-4">
                    <Checkbox
                      checked={isQuestionSelected(question._id)}
                      onChange={() => handleCheckboxChange(question)}
                      disabled={!isCustomSelectionAllowed}
                      sx={{
                        color: !isCustomSelectionAllowed ? 'grey' : 'default',
                        cursor: !isCustomSelectionAllowed ? 'not-allowed' : 'pointer'
                      }}
                    />
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    {question.text.length > 80 ? question.text.substring(0, 80) + '...' : question.text}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">{question.category}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">{question.difficulty}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">{question.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default QuestionsSelector;