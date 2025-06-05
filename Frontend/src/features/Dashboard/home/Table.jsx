import React, { useState, useEffect } from "react";
import { Pencil, Lock, Eye, X } from "lucide-react";
import { getSocket } from "../../../services/sockets/admin";

// Import popup components
import EditScoreModal from "./EditScoreModal";
import StatusModal from "./StatusModal";
import SubmissionModal from "./SubmissionModal";

function Table({
  gameStatusRef,
  onLevelChange,
  pendingStatusChange,
  transactionsEnabled,
}) {
  const [teamData, setTeamData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const socket = getSocket();

  

  const processTeamData = (data) => {
    // Only update gameStatus if no pending toggle
    if (pendingStatusChange === null) {
      gameStatusRef.current = data.isPaused;
    }
    // Update game level
    if (data.currentLevel) {
      onLevelChange(data.currentLevel);
    }
    
    const formattedData = data.teams.map((team) => ({
      id: team.teamInfo.id,
      name: team.teamInfo.name.split("Team")[1],
      players: team.players.length,
      progress: [
        {
          label: "L1",
          value: team.questions.filter(
            (q) => q.level === 1 && q.status === "done"
          ).length,
          total: team.questions.filter((q) => q.level === 1).length,
          color: "bg-[#FF6363]",
        },
        {
          label: "L2",
          value: team.questions.filter(
            (q) => q.level === 2 && q.status === "done"
          ).length,
          total: team.questions.filter((q) => q.level === 2).length,
          color: "bg-black",
        },
        {
          label: "L3",
          value: team.questions.filter(
            (q) => q.level === 3 && q.status === "done"
          ).length,
          total: team.questions.filter((q) => q.level === 3).length,
          color: "bg-[#FCA61E]",
        },
      ],
      score: team.teamInfo.teamScore,
      questions: team.questions,
      rawData: team,
    }));
    
    setTeamData(formattedData);

    // Update selectedTeam if StatusModal or SubmissionModal is open
    if ((showStatusModal || showSubmissionModal) && selectedTeam) {
      const updatedTeam = formattedData.find(
        (team) => team.id === selectedTeam.id
      );
      if (updatedTeam) {
        // Only update if questions or score have changed
        if (
          JSON.stringify(updatedTeam.questions) !==
            JSON.stringify(selectedTeam.questions) ||
          updatedTeam.score !== selectedTeam.score
        ) {
          setSelectedTeam(updatedTeam);
        }
      } else {
        // Close modal if team no longer exists
        if (showStatusModal) setShowStatusModal(false);
        if (showSubmissionModal) setShowSubmissionModal(false);
        setSelectedTeam(null);
      }
    }
  };

  useEffect(() => {
    // Request team data when component mounts
    socket.emit("request-all-teams-data", (response) => {
      console.log("TABLE : Request team data:");
      if (response.success) {
        processTeamData(response.data);
      } else {
        console.error("Error fetching team data:", response.error);
      }
    });

    // Store handler reference to ensure proper cleanup
    const handleTeamDataUpdate = (data) => {
      console.log("TABLE : Received team data:");
      processTeamData(data);
    };

    // Listen for real-time team data updates
    socket.on("all-teams-data", handleTeamDataUpdate);

    // Cleanup - remove only this specific handler
    return () => {
      socket.off("all-teams-data", handleTeamDataUpdate);
    };
  }, [
    socket,
    gameStatusRef,
    onLevelChange,
    pendingStatusChange,
    showStatusModal,
    showSubmissionModal,
    selectedTeam,
  ]);

  const handleEditScore = (team) => {
    setSelectedTeam(team);
    setShowEditModal(true);
  };

  const handleShowStatus = (team) => {
    if (!transactionsEnabled) {
      alert("Transactions must be enabled to view or modify playing status.");
      return;
    }
    setSelectedTeam(team);
    setShowStatusModal(true);
  };

  const handleShowSubmissions = (team) => {
    setSelectedTeam(team);
    setShowSubmissionModal(true);
  };

  const closeAllModals = () => {
    setShowEditModal(false);
    setShowStatusModal(false);
    setShowSubmissionModal(false);
    setSelectedTeam(null);
  };

  return (
    <>
      <div className="w-[70%] overflow-x-auto font-sans">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-center">
              {[
                "Team Id",
                "Players",
                "Progress",
                "Score",
                "Change Score",
                "Playing Status",
                "Submissions",
              ].map((title) => (
                <th key={title} className="h-12">
                  <div className="flex justify-center items-center text-[12px] text-[#111111]/50">
                    {title}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamData.map((team, index) => (
              <tr
                key={team.id}
                className="even:bg-gray-50 text-center rounded-2xl"
              >
                <td>
                  <div className="flex justify-center items-center h-16 rounded-l-2xl text-[14px]">
                    {team.name}
                  </div>
                </td>
                <td>
                  <div className="flex justify-center items-center h-16 text-[14px]">
                    {team.players}
                  </div>
                </td>
                <td>
                  <div className="flex flex-col items-center justify-center space-y-1 h-full py-2">
                    {team.progress.map((p) => (
                      <div
                        key={p.label}
                        className="flex items-center space-x-2 text-[14px]"
                      >
                        <span className="text-[14px]">{p.label}</span>
                        <div className="w-24 h-2.5 bg-gray-200 rounded-full relative">
                          <div
                            className={`h-2.5 ${p.color} rounded-full`}
                            style={{ width: `${(p.value / p.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-[14px]">{`${p.value}/${p.total}`}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="flex justify-center items-center h-16 text-[14px]">
                    {team.score.toLocaleString()}
                  </div>
                </td>
                <td>
                  <div className="flex justify-center items-center h-16 text-[14px]">
                    <Pencil
                      size={16}
                      className="hover:scale-115 transform transition-transform duration-200 cursor-pointer text-blue-600 hover:text-blue-800"
                      onClick={() => handleEditScore(team)}
                    />
                  </div>
                </td>
                <td>
                  <div className="flex justify-center items-center h-16 text-[14px]">
                    <Lock
                      size={16}
                      className={`transform transition-transform duration-200 ${
                        transactionsEnabled
                          ? "cursor-pointer text-orange-600 hover:text-orange-800 hover:scale-115"
                          : "cursor-not-allowed text-gray-400"
                      }`}
                      onClick={() => handleShowStatus(team)}
                    />
                  </div>
                </td>
                <td>
                  <div className="flex justify-center items-center h-16 text-[14px]">
                    <Eye
                      size={16}
                      className="hover:scale-115 transform transition-transform duration-200 cursor-pointer text-green-600 hover:text-green-800"
                      onClick={() => handleShowSubmissions(team)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Score Modal */}
      {showEditModal && (
        <EditScoreModal team={selectedTeam} onClose={closeAllModals} />
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <StatusModal
          team={selectedTeam}
          onClose={closeAllModals}
          socket={socket}
          transactionsEnabled={transactionsEnabled}
        />
      )}

      {/* Submission Modal */}
      {showSubmissionModal && (
        <SubmissionModal
          team={selectedTeam}
          onClose={closeAllModals}
          socket={socket}
        />
      )}
    </>
  );
}

export default Table;