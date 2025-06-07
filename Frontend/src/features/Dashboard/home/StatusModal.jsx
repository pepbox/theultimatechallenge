import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";

const StatusModal = ({ team, onClose, transactionsEnabled, maxGameLevels }) => {
  const [questionsData, setQuestionsData] = useState({
    level1: maxGameLevels >= 1 ? [] : undefined,
    level2: maxGameLevels >= 2 ? [] : undefined,
    level3: maxGameLevels >= 3 ? [] : undefined,
  });
  const [originalQuestionStatuses, setOriginalQuestionStatuses] = useState(
    new Map()
  );
  const [pendingChanges, setPendingChanges] = useState(new Map());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize questions data from team data
    if (team && team.questions) {
      const level1Questions = team.questions.filter((q) => q.level === 1);
      const level2Questions = team.questions.filter((q) => q.level === 2);
      const level3Questions = team.questions.filter((q) => q.level === 3);

      setQuestionsData({
        level1: maxGameLevels >= 1 ? level1Questions : undefined,
        level2: maxGameLevels >= 2 ? level2Questions : undefined,
        level3: maxGameLevels >= 3 ? level3Questions : undefined,
      });

      // setQuestionsData({
      //   level1: level1Questions,
      //   level2: level2Questions,
      //   level3: level3Questions
      // });

      // Store original statuses for comparison
      const originalStatuses = new Map();
      [...level1Questions, ...level2Questions, ...level3Questions].forEach(
        (q) => {
          originalStatuses.set(q.id, q.status);
        }
      );
      setOriginalQuestionStatuses(originalStatuses);

      // Clear any pending changes when team data changes
      setPendingChanges(new Map());
    }
  }, [team]);

  const handleQuestionToggle = (level, questionId) => {
    // Only allow toggling if transactions are enabled and the question is in "attending" status
    const question = questionsData[level].find((q) => q.id === questionId);
    if (!transactionsEnabled || question.status !== "attending") {
      if (!transactionsEnabled) {
        alert("Transactions must be enabled to modify question status");
      }
      return;
    }

    // Update pending changes
    setPendingChanges((prev) => {
      const newPendingChanges = new Map(prev);
      const originalStatus = originalQuestionStatuses.get(questionId);

      if (newPendingChanges.has(questionId)) {
        // If we already have a pending change, toggle it back
        const currentPendingStatus = newPendingChanges.get(questionId);
        if (currentPendingStatus === originalStatus) {
          // Remove from pending changes if we're back to original status
          newPendingChanges.delete(questionId);
        } else {
          // Toggle back to original status
          newPendingChanges.set(questionId, originalStatus);
        }
      } else {
        // Add new pending change (from attending to available)
        newPendingChanges.set(questionId, "available");
      }

      return newPendingChanges;
    });
  };

  const getQuestionDisplayStatus = (question) => {
    // Check if there's a pending change for this question
    if (pendingChanges.has(question.id)) {
      return pendingChanges.get(question.id);
    }
    // Otherwise return the original status
    return question.status;
  };

  const handleSave = async () => {
    if (!transactionsEnabled) {
      alert("Transactions must be enabled to save changes");
      return;
    }

    if (pendingChanges.size === 0) {
      // No changes to save
      onClose();
      return;
    }

    setIsSaving(true);

    try {
      // Prepare the changes array
      const changes = Array.from(pendingChanges.entries()).map(
        ([questionId, newStatus]) => ({
          questionId,
          newStatus,
        })
      );

      // Make API call to update multiple question statuses
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_BASE_URL
        }/api/v1/admin/update-question-status`,
        {
          teamId: team.id,
          changes,
        },
        { withCredentials: true }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.error || "Failed to update question statuses"
        );
      }

      console.log(
        `Updated ${changes.length} question(s) status for team ${team.id}`
      );

      // Clear pending changes and close modal on success
      setPendingChanges(new Map());
      onClose();
    } catch (error) {
      alert(`Error updating question statuses: ${error.message}`);
      console.error("Error updating question statuses:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Clear any pending changes
    setPendingChanges(new Map());
    onClose();
  };

  const renderQuestionGrid = (level, questions) => {
    const levelKey = `level${level}`;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Level {level}
        </h3>
        <div className="grid grid-cols-10 gap-2">
          {questions.map((question, index) => {
            const displayNumber = index + 1;
            const displayStatus = getQuestionDisplayStatus(question);
            const hasPendingChange = pendingChanges.has(question.id);

            const isCompleted = displayStatus === "done";
            const isInProgress = displayStatus === "attending";
            const isAvailable = displayStatus === "available";

            let buttonClass =
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 relative ";

            if (isCompleted) {
              // Light green for completed questions
              buttonClass +=
                "bg-green-200 text-white cursor-not-allowed shadow-sm";
            } else if (isInProgress) {
              // Orange for in-progress questions
              if (hasPendingChange) {
                // Add a visual indicator for pending changes
                buttonClass += transactionsEnabled
                  ? "bg-orange-400 text-white hover:bg-orange-500 cursor-pointer shadow-md ring-2 ring-orange-300"
                  : "bg-orange-400 text-white cursor-not-allowed opacity-60 ring-2 ring-orange-300";
              } else {
                buttonClass += transactionsEnabled
                  ? "bg-orange-200 text-white hover:bg-orange-300 cursor-pointer shadow-sm"
                  : "bg-orange-200 text-white cursor-not-allowed opacity-60";
              }
            } else if (isAvailable) {
              // Available questions - dashed orange border with white background
              if (hasPendingChange) {
                buttonClass +=
                  "bg-orange-50 text-orange-600 border-2 border-solid border-orange-500 cursor-not-allowed ring-2 ring-orange-300";
              } else {
                buttonClass +=
                  "bg-white text-orange-500 border-2 border-dashed border-orange-400 cursor-not-allowed";
              }
            }

            return (
              <button
                key={question.id}
                onClick={() => handleQuestionToggle(levelKey, question.id)}
                className={buttonClass}
                disabled={
                  isCompleted ||
                  !question.status === "attending" ||
                  !transactionsEnabled
                }
                title={
                  !transactionsEnabled
                    ? "Enable transactions to modify questions"
                    : isCompleted
                    ? "Completed"
                    : isInProgress
                    ? hasPendingChange
                      ? "Will be set to available on save"
                      : "In Progress - Click to set as available"
                    : isAvailable
                    ? hasPendingChange
                      ? "Will be set to attending on save"
                      : "Available"
                    : "Unknown status"
                }
              >
                {displayNumber}
                {hasPendingChange && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const hasChanges = pendingChanges.size > 0;

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
            {hasChanges && (
              <p className="text-sm text-blue-600 mt-1 font-medium">
                📝 {pendingChanges.size} change(s) pending - Click Save to apply
              </p>
            )}
            {!transactionsEnabled && (
              <p className="text-xs text-orange-600 mt-1 font-medium">
                ⚠️ Transactions are disabled. Enable transactions to modify
                questions.
              </p>
            )}
          </div>
          <button
            onClick={handleCancel}
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
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-sm"></div>
              <span className="font-medium">Pending Change</span>
            </div>
          </div>
        </div>

        {/* Level 1 Questions */}
        {Object.values(questionsData)?.map((questions, index) => {
          if(!questions || questions.length === 0) return null;
          return renderQuestionGrid(index + 1, questions);
        })}

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
              transactionsEnabled && !isSaving
                ? hasChanges
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-gray-400"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!transactionsEnabled || isSaving}
          >
            {isSaving ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : hasChanges ? (
              `Save ${pendingChanges.size} Change${
                pendingChanges.size > 1 ? "s" : ""
              }`
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
