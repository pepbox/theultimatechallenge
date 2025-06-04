import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function SubmissionModal({ team, onClose, socket }) {
  const [selectedLevel, setSelectedLevel] = useState('all'); // Default to show all levels
  const [filteredQuestions, setFilteredQuestions] = useState(team.questions); // Initialize with all questions

  // Get available levels from team data
  const availableLevels = [...new Set(team.questions.map((q) => q.level))].sort();
  const levelOptions = [
    { value: 'all', label: 'All Levels' },
    ...availableLevels.map((level) => ({ value: level.toString(), label: `Level ${level}` })),
  ];

  // Update filtered questions when team or selectedLevel changes
  useEffect(() => {
    console.log('SubmissionModal: team prop updated', team.id, team.questions.length);
    const updatedQuestions = selectedLevel === 'all'
      ? team.questions
      : team.questions.filter((q) => q.level === parseInt(selectedLevel));
    setFilteredQuestions(updatedQuestions);
  }, [team, selectedLevel]); // Depend on entire team object to catch all changes

  // Handle level toggle
  const handleLevelChange = (value) => {
    setSelectedLevel(value);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/75">
      <div className="bg-gradient-to-b from-[#D4E5FF]/30 to-[#E5FFD4]/30 border-2 border-white/20 rounded-2xl p-6 w-[90%] max-w-4xl flex flex-col backdrop-blur-3xl shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-2xl font-bold font-sans tracking-tight">
            Questions for Team {team.name}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors duration-200"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Level Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-white/10 rounded-full p-1 shadow-inner">
            {levelOptions.map((option) => (
              <button
                key={option.value}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedLevel === option.value
                    ? 'bg-[#F5A623] text-black shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
                onClick={() => handleLevelChange(option.value)}
                aria-pressed={selectedLevel === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Questions Table */}
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {filteredQuestions.length > 0 ? (
            <table className="w-full border-collapse text-white">
              <thead className="sticky top-0 bg-gradient-to-b from-[#D4E5FF]/20 to-[#E5FFD4]/20 z-10">
                <tr className="text-center">
                  <th className="p-3 text-sm font-medium text-white/80">Question #</th>
                  <th className="p-3 text-sm font-medium text-white/80 text-left">Question Text</th>
                  <th className="p-3 text-sm font-medium text-white/80">Answer Type</th>
                  <th className="p-3 text-sm font-medium text-white/80">Submitted Answer</th>
                  <th className="p-3 text-sm font-medium text-white/80">Points Earned</th>
                  <th className="p-3 text-sm font-medium text-white/80">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((question, index) => (
                  <tr
                    key={question.id}
                    className="even:bg-white/5 hover:bg-white/10 transition-colors duration-150"
                  >
                    <td className="p-3 text-sm">{index + 1}</td>
                    <td className="p-3 text-sm text-left">{question.text}</td>
                    <td className="p-3 text-sm capitalize">{question.answerType}</td>
                    <td className="p-3 text-sm">
                      {question.answerType === 'fileUpload' && question.answerUrl ? (
                        <a
                          href={question.answerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-600 underline transition-colors duration-150"
                        >
                          View File
                        </a>
                      ) : question.answerType === 'text' && question.submittedAnswer ? (
                        question.submittedAnswer
                      ) : (
                        <span className="text-white/50">N/A</span>
                      )}
                    </td>
                    <td className="p-3 text-sm">{question.pointsEarned || 0}</td>
                    <td className="p-3 text-sm capitalize">{question.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-white text-center text-base py-6">
              No questions available for {selectedLevel === 'all' ? 'this team' : `Level ${selectedLevel}`}.
            </p>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="bg-[#F5A623] text-black font-bold py-2 px-8 rounded-full hover:bg-[#e0891c] transition-colors duration-200 shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubmissionModal;