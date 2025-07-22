import { useState, useEffect } from "react";
import { ExternalLink, X } from "lucide-react";

function SubmissionModal({ team, onClose, socket }) {
  const [selectedLevel, setSelectedLevel] = useState("all"); // Default to show all levels
  const [filteredQuestions, setFilteredQuestions] = useState(team.questions); // Initialize with all questions

  // Get available levels from team data
  const availableLevels = [
    ...new Set(team.questions.map((q) => q.level)),
  ].sort();
  const levelOptions = [
    { value: "all", label: "All Levels" },
    ...availableLevels.map((level) => ({
      value: level.toString(),
      label: `Level ${level}`,
    })),
  ];

  useEffect(() => {
    console.log(
      "SubmissionModal: team prop updated",
      team.id,
      team.questions.length
    );
    const updatedQuestions =
      selectedLevel === "all"
        ? team.questions
        : team.questions.filter((q) => q.level === parseInt(selectedLevel));
    setFilteredQuestions(updatedQuestions);
  }, [team, selectedLevel]);

  const handleLevelChange = (value) => {
    setSelectedLevel(value);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/75 p-4">
      <div className="bg-gradient-to-b from-[#D4E5FF]/30 to-[#E5FFD4]/30 border-2 border-white/20 rounded-2xl p-4 sm:p-6 w-full max-w-4xl flex flex-col backdrop-blur-3xl shadow-2xl max-h-[95vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-lg sm:text-2xl font-bold font-sans tracking-tight">
            Questions for Team {team.name}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors duration-200 p-1"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Level Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-white/10 rounded-full p-1 shadow-inner overflow-x-auto">
            <div className="flex space-x-1">
              {levelOptions.map((option) => (
                <button
                  key={option.value}
                  className={`px-3 py-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedLevel === option.value
                      ? "bg-[#F5A623] text-black shadow-md"
                      : "text-white hover:bg-white/20"
                  }`}
                  onClick={() => handleLevelChange(option.value)}
                  aria-pressed={selectedLevel === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Questions Content */}
        <div className="flex-1 overflow-hidden">
          {filteredQuestions.length > 0 ? (
            <>
              {/* Desktop/Tablet Table View */}
              <div className="hidden lg:block max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <table className="w-full border-collapse text-white">
                  <thead className="sticky top-0 bg-gradient-to-b from-[#828a90] to-[#848e87] z-10">
                    <tr className="text-center">
                      <th className="p-3 text-sm font-medium text-white/80">
                        #
                      </th>
                      <th className="p-3 text-sm font-medium text-white/80 text-left">
                        Question Text
                      </th>
                      <th className="p-3 text-sm font-medium text-white/80">
                        Answer Type
                      </th>
                      <th className="p-3 text-sm font-medium text-white/80">
                        Submitted Answer
                      </th>
                      <th className="p-3 text-sm font-medium text-white/80">
                        Points
                      </th>
                      <th className="p-3 text-sm font-medium text-white/80">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((question, index) => (
                      <tr
                        key={question.id}
                        className="even:bg-white/5 hover:bg-white/10 transition-colors duration-150"
                      >
                        <td className="p-3 text-sm">{index + 1}</td>
                        <td className="p-3 text-sm text-left">
                          {question.text}
                        </td>
                        <td className="p-3 text-sm capitalize">
                          {question.answerType}
                        </td>
                        <td className="p-3 text-sm">
                          {(question.answerType === "image" ||
                            question.answerType === "video") &&
                          question.answerUrl ? (
                            <a
                              href={question.answerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-600 underline transition-colors duration-150"
                            >
                              View File
                            </a>
                          ) : question.answerType === "text" &&
                            question.submittedAnswer ? (
                            question.submittedAnswer
                          ) : (
                            <span className="text-white/50">N/A</span>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          {question.pointsEarned || 0}
                        </td>
                        <td className="p-3 text-sm capitalize">
                          {question.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <div className="space-y-3">
                  {filteredQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-sm"
                    >
                      {/* Question Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="bg-[#F5A623] text-black text-xs font-bold px-2 py-1 rounded-full">
                            #{index + 1}
                          </span>
                          <span className="text-white/60 text-xs uppercase tracking-wide">
                            {question.answerType}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[#F5A623] text-sm font-semibold">
                            {question.pointsEarned || 0} pts
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full capitalize text-white `}
                          >
                            {question.status}
                          </span>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="mb-3">
                        <p className="text-white text-sm leading-relaxed">
                          {question.text}
                        </p>
                      </div>

                      {/* Answer Section */}
                      <div className="border-t border-white/10 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60 text-xs uppercase tracking-wide">
                            Submitted Answer
                          </span>
                          <div className="text-right">
                            {(question.answerType === "image" ||
                              question.answerType === "video") &&
                            question.answerUrl ? (
                              <a
                                href={question.answerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-600 text-sm underline transition-colors duration-150"
                              >
                                <span>View File</span>
                                <ExternalLink size={12} />
                              </a>
                            ) : question.answerType === "text" &&
                              question.submittedAnswer ? (
                              <p className="text-white text-sm max-w-48 truncate">
                                {question.submittedAnswer}
                              </p>
                            ) : (
                              <span className="text-white/50 text-sm">N/A</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-white text-center text-base">
                No questions available for{" "}
                {selectedLevel === "all"
                  ? "this team"
                  : `Level ${selectedLevel}`}
                .
              </p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-center mt-4 sm:mt-6">
          <button
            onClick={onClose}
            className="bg-[#F5A623] text-black font-bold py-2 px-6 sm:px-8 rounded-full hover:bg-[#e0891c] transition-colors duration-200 shadow-md text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubmissionModal;
