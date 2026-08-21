import { useState, useEffect } from "react";
import { ExternalLink, X } from "lucide-react";

const statusLabels = {
  available: "Available",
  attending: "In Progress",
  pending_verification: "Requested Verification",
  done: "Completed",
};

function SubmissionModal({ team, onClose, socket }) {
  // Get available levels from team data
  const availableLevels = [
    ...new Set(team.questions.map((q) => q.level)),
  ].sort();
  const levelOptions = availableLevels.map((level) => ({
    value: level.toString(),
    label: `Level ${level}`,
  }));

  const [selectedLevel, setSelectedLevel] = useState(
    availableLevels[0]?.toString() || ""
  );
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  useEffect(() => {
    console.log(
      "SubmissionModal: team prop updated",
      team.id,
      team.questions.length
    );
    let currentLevel = selectedLevel;
    const isLevelAvailable = team.questions.some(q => q.level.toString() === selectedLevel);
    if (!isLevelAvailable) {
      const activeLevels = [...new Set(team.questions.map((q) => q.level))].sort();
      if (activeLevels.length > 0) {
        currentLevel = activeLevels[0].toString();
        setSelectedLevel(currentLevel);
      }
    }

    const updatedQuestions = currentLevel
      ? team.questions.filter((q) => q.level === parseInt(currentLevel))
      : [];
    setFilteredQuestions(updatedQuestions);
  }, [team, selectedLevel]);

  const handleLevelChange = (value) => {
    setSelectedLevel(value);
  };

  const [processingKeys, setProcessingKeys] = useState(new Set());

  const handleMarkDone = (questionId) => {
    if (!socket) return;
    setProcessingKeys((prev) => new Set([...prev, questionId]));
    socket.emit("admin-mark-question-done", { teamId: team.id, questionId }, (response) => {
      setProcessingKeys((prev) => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
      if (response && !response.success) {
        alert(response.error || "Failed to mark question as done");
      }
    });
  };

  const handleMarkUndone = (questionId) => {
    if (!socket) return;
    setProcessingKeys((prev) => new Set([...prev, questionId]));
    socket.emit("admin-mark-question-undone", { teamId: team.id, questionId }, (response) => {
      setProcessingKeys((prev) => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
      if (response && !response.success) {
        alert(response.error || "Failed to mark question as undone");
      }
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/75 p-4">
      <div className="bg-gradient-to-b from-[#D4E5FF]/30 to-[#E5FFD4]/30 border-2 border-white/20 rounded-2xl p-4 sm:p-6 w-full max-w-5xl flex flex-col backdrop-blur-3xl shadow-2xl max-h-[95vh]">
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
              <div className="hidden lg:block max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
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
                        Task Points
                      </th>
                      <th className="p-3 text-sm font-medium text-white/80">
                        Points Earned
                      </th>
                      <th className="p-3 text-sm font-medium text-white/80">
                        Status
                      </th>
                      <th className="p-3 text-sm font-medium text-white/80">
                        Action
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
                            question.answerType === "video" ||
                            question.answerType === "fileUpload") &&
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
                        <td className="p-3 text-sm font-bold text-yellow-400">
                          {question.points}
                        </td>
                        <td className="p-3 text-sm font-bold text-green-400">
                          {question.status === "done" ? (question.pointsEarned || question.points) : 0}
                        </td>
                        <td className="p-3 text-sm">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            question.status === "done"
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : question.status === "pending_verification"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : question.status === "attending"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                          }`}>
                            {statusLabels[question.status] || question.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-center">
                          {question.status === "done" ? (
                            <button
                              onClick={() => handleMarkUndone(question.id)}
                              disabled={processingKeys.has(question.id)}
                              className="px-3 py-1 bg-red-600/35 hover:bg-red-600/50 border border-red-500/30 text-red-200 text-xs font-bold rounded-lg transition-colors duration-150 disabled:opacity-50 cursor-pointer"
                            >
                              {processingKeys.has(question.id) ? "..." : "Mark Undone"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkDone(question.id)}
                              disabled={processingKeys.has(question.id)}
                              className="px-3 py-1 bg-green-600/35 hover:bg-green-600/50 border border-green-500/30 text-green-200 text-xs font-bold rounded-lg transition-colors duration-150 disabled:opacity-50 cursor-pointer"
                            >
                              {processingKeys.has(question.id) ? "..." : "Mark Done"}
                            </button>
                          )}
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
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-white/50 text-[11px]">
                            Task: <strong className="text-yellow-400">{question.points} pts</strong>
                          </span>
                          <span className="text-white/50 text-[11px]">
                            Earned: <strong className="text-green-400">{question.status === "done" ? (question.pointsEarned || question.points) : 0} pts</strong>
                          </span>
                          <span className={`px-2 py-0.5 mt-1 rounded-full text-[10px] font-semibold border ${
                            question.status === "done"
                              ? "bg-green-500/20 text-green-300 border-green-500/30"
                              : question.status === "pending_verification"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : question.status === "attending"
                              ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                              : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                          }`}>
                            {statusLabels[question.status] || question.status}
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
                              question.answerType === "video" ||
                              question.answerType === "fileUpload") &&
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

                      {/* Action Section */}
                      <div className="border-t border-white/10 pt-3 mt-3 flex justify-between items-center">
                        <span className="text-white/60 text-xs uppercase tracking-wide">
                          Action
                        </span>
                        <div>
                          {question.status === "done" ? (
                            <button
                              onClick={() => handleMarkUndone(question.id)}
                              disabled={processingKeys.has(question.id)}
                              className="px-4 py-1.5 bg-red-600/35 hover:bg-red-600/50 border border-red-500/30 text-red-200 text-xs font-bold rounded-lg transition-colors duration-150 disabled:opacity-50 cursor-pointer"
                            >
                              {processingKeys.has(question.id) ? "Processing..." : "Mark Undone"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkDone(question.id)}
                              disabled={processingKeys.has(question.id)}
                              className="px-4 py-1.5 bg-green-600/35 hover:bg-green-600/50 border border-green-500/30 text-green-200 text-xs font-bold rounded-lg transition-colors duration-150 disabled:opacity-50 cursor-pointer"
                            >
                              {processingKeys.has(question.id) ? "Processing..." : "Mark Done"}
                            </button>
                          )}
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
