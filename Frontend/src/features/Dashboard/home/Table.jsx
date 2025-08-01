import React, { useState, useEffect } from "react";
import { Pencil, Lock, Eye, X, ChevronUp, ChevronDown } from "lucide-react";
import { getSocket } from "../../../services/sockets/admin";

// Import popup components
import EditScoreModal from "./EditScoreModal";
import StatusModal from "./StatusModal";
import SubmissionModal from "./SubmissionModal";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { forwardRef } from "react";
import { useImperativeHandle } from "react";
import TeamInfoModal from "./TeamInfoModal";

const Table = forwardRef(
  (
    {
      gameStatusRef,
      onLevelChange,
      pendingStatusChange,
      transactionsEnabled,
      maxGameLevels,
    },
    ref
  ) => {
    const [teamData, setTeamData] = useState([]);
    const [sortedTeamData, setSortedTeamData] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);

    const [showTeamInfoModal, setShowTeamInfoModal] = useState(false);
    const [activeTeamInfo, setActiveTeamInfo] = useState(null);

    const [selectedTeam, setSelectedTeam] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState({
      key: "name",
      direction: "desc",
    });
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

      const formattedData = data.teams.map((team) => {
        // Dynamically create progress array based on maxGameLevels
        const progressItems = [];
        const colors = ["bg-[#FF6363]", "bg-black", "bg-[#FCA61E]"];

        for (let i = 1; i <= Math.min(maxGameLevels, 3); i++) {
          progressItems.push({
            label: `L${i}`,
            value: team.questions.filter(
              (q) => q.level === i && q.status === "done"
            ).length,
            total: team.questions.filter((q) => q.level === i).length,
            color: colors[i - 1],
          });
        }

        return {
          id: team.teamInfo.id,
          name: team.teamInfo.name,
          players: team.players.length,
          progress: progressItems,
          score: team.teamInfo.teamScore,
          questions: team.questions,
          rawData: team,
        };
      });

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

    // Sorting function
    const handleSort = (key) => {
      let direction = "asc";
      console.log(key);
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
      }
      setSortConfig({ key, direction });
    };

    // Apply sorting to team data
    useEffect(() => {
      let sortedData = [...teamData];

      if (sortConfig.key) {
        sortedData.sort((a, b) => {
          let aValue = a[sortConfig.key];
          let bValue = b[sortConfig.key];

          // Enhanced natural sorting for team names
          if (sortConfig.key === "name") {
            // Extract number from team name for natural sorting
            const extractNumber = (name) => {
              const match = name.toString().match(/\d+/);
              return match ? parseInt(match[0]) : 0;
            };

            const aNum = extractNumber(aValue);
            const bNum = extractNumber(bValue);

            if (aNum !== bNum) {
              // Compare numbers numerically
              return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
            } else {
              // If numbers are same or no numbers, compare strings case-insensitively
              const aStr = aValue.toString().toLowerCase();
              const bStr = bValue.toString().toLowerCase();
              return sortConfig.direction === "asc" 
                ? aStr.localeCompare(bStr)
                : bStr.localeCompare(aStr);
            }
          }

          if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        });
      }

      setSortedTeamData(sortedData);
    }, [teamData, sortConfig]);

    const requestTeamData = () => {
      setLoading(true);
      socket.emit("request-all-teams-data", (response) => {
        console.log("TABLE : Request team data:");
        if (response.success) {
          processTeamData(response.data);
        } else {
          console.error("Error fetching team data:", response.error);
        }
      });
    };

    useEffect(() => {
      requestTeamData();

      const handleTeamDataUpdate = (data) => {
        setLoading(false);
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

    const handleRefresh = () => {
      requestTeamData();
    };

    useImperativeHandle(ref, () => ({
      handleRefresh,
    }));

    const handleEditScore = (team) => {
      if (!transactionsEnabled) {
        alert("Transactions must be enabled to view or modify playing status.");
        return;
      }
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
      setShowTeamInfoModal(false);
      setActiveTeamInfo(null);
    };

    // Function to render sort arrow
    const renderSortArrow = (columnKey) => {
      if (sortConfig.key !== columnKey) {
        return (
          <ArrowUpward
            size={12}
            className="text-gray-300"
            sx={{ fontSize: "16px" }}
          />
        );
      }
      return sortConfig.direction === "asc" ? (
        <ArrowUpward className="text-gray-600" sx={{ fontSize: "16px" }} />
      ) : (
        <ArrowDownward className="text-gray-600" sx={{ fontSize: "16px" }} />
      );
    };

    const handleShowTeamInfo = ({ teamId, teamName }) => {
      setActiveTeamInfo({ teamId, teamName });
      setShowTeamInfoModal(true);
    };

    console.log(sortedTeamData);
    return (
      <>
        <div className="w-full max-w-full overflow-hidden font-sans">
          {/* Desktop/Tablet Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="text-center">
                  <th className="h-12 px-2">
                    <div
                      className="flex justify-center items-center text-[12px] text-[#111111]/50 cursor-pointer hover:text-[#111111]/70 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <span>Team Name</span>
                      <div className="ml-1">{renderSortArrow("name")}</div>
                    </div>
                  </th>
                  <th className="h-12 px-2">
                    <div className="flex justify-center items-center text-[12px] text-[#111111]/50">
                      Players
                    </div>
                  </th>
                  <th className="h-12 px-2">
                    <div className="flex justify-center items-center text-[12px] text-[#111111]/50">
                      Progress
                    </div>
                  </th>
                  <th className="h-12 px-2">
                    <div
                      className="flex justify-center items-center text-[12px] text-[#111111]/50 cursor-pointer hover:text-[#111111]/70 transition-colors"
                      onClick={() => handleSort("score")}
                    >
                      <span>Score</span>
                      <div className="ml-1">{renderSortArrow("score")}</div>
                    </div>
                  </th>
                  <th className="h-12 px-2">
                    <div className="flex justify-center items-center text-[12px] text-[#111111]/50">
                      Change Score
                    </div>
                  </th>
                  <th className="h-12 px-2">
                    <div className="flex justify-center items-center text-[12px] text-[#111111]/50">
                      Playing Status
                    </div>
                  </th>
                  <th className="h-12 px-2">
                    <div className="flex justify-center items-center text-[12px] text-[#111111]/50">
                      Submissions
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTeamData.map((team, index) => (
                  <tr
                    key={team.id}
                    className="even:bg-gray-50 text-center rounded-2xl"
                  >
                    <td className="px-2">
                      <div
                        onClick={() =>
                          handleShowTeamInfo({
                            teamId: team.id,
                            teamName: team.name,
                          })
                        }
                        className="flex justify-center items-center h-16 cursor-pointer rounded-l-2xl text-[14px] underline"
                      >
                        {team.name}
                      </div>
                    </td>
                    <td className="px-2">
                      <div className="flex justify-center items-center h-16 text-[14px]">
                        {team.players}
                      </div>
                    </td>
                    <td className="px-2">
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
                                style={{
                                  width: `${(p.value / p.total) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-[14px]">{`${p.value}/${p.total}`}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-2">
                      <div className="flex justify-center items-center h-16 text-[14px]">
                        {team.score.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-2">
                      <div className="flex justify-center items-center h-16 text-[14px]">
                        <Pencil
                          size={16}
                          className={`hover:scale-115 transform transition-transform duration-200 cursor-pointer   ${
                            transactionsEnabled
                              ? "cursor-pointer text-blue-600 hover:text-blue-800 hover:scale-115"
                              : "cursor-not-allowed text-gray-400"
                          }`}
                          onClick={() => handleEditScore(team)}
                        />
                      </div>
                    </td>
                    <td className="px-2">
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
                    <td className="px-2">
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

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {/* Mobile Header with Sort Options */}
            <div className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded-lg">
              <div
                className="flex items-center text-sm text-[#111111]/70 cursor-pointer hover:text-[#111111] transition-colors"
                onClick={() => handleSort("name")}
              >
                <span>Sort by Name</span>
                <div className="ml-1">{renderSortArrow("name")}</div>
              </div>
              <div
                className="flex items-center text-sm text-[#111111]/70 cursor-pointer hover:text-[#111111] transition-colors"
                onClick={() => handleSort("score")}
              >
                <span>Sort by Score</span>
                <div className="ml-1">{renderSortArrow("score")}</div>
              </div>
            </div>

            {/* Mobile Cards */}
            {sortedTeamData.map((team, index) => (
              <div
                key={team.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3"
              >
                {/* Team Name */}
                <div className="flex justify-between items-center">
                  <div
                    onClick={() =>
                      handleShowTeamInfo({
                        teamId: team.id,
                        teamName: team.name,
                      })
                    }
                    className="text-lg font-semibold text-blue-600 underline cursor-pointer"
                  >
                    {team.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {team.players} players
                  </div>
                </div>

                {/* Score */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Score:</span>
                  <span className="text-lg font-semibold">
                    {team.score.toLocaleString()}
                  </span>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <span className="text-sm text-gray-600">Progress:</span>
                  {team.progress.map((p) => (
                    <div key={p.label} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{p.label}</span>
                        <span className="text-sm">{`${p.value}/${p.total}`}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 ${p.color} rounded-full`}
                          style={{ width: `${(p.value / p.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-around items-center pt-2 border-t border-gray-100">
                  <div className="flex flex-col items-center space-y-1">
                    <Pencil
                      size={20}
                      className={`transform transition-transform duration-200 ${
                        transactionsEnabled
                          ? "cursor-pointer text-blue-600 hover:text-blue-800 hover:scale-115"
                          : "cursor-not-allowed text-gray-400"
                      }`}
                      onClick={() => handleEditScore(team)}
                    />
                    <span className="text-xs text-gray-500">Edit Score</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <Lock
                      size={20}
                      className={`transform transition-transform duration-200 ${
                        transactionsEnabled
                          ? "cursor-pointer text-orange-600 hover:text-orange-800 hover:scale-115"
                          : "cursor-not-allowed text-gray-400"
                      }`}
                      onClick={() => handleShowStatus(team)}
                    />
                    <span className="text-xs text-gray-500">Status</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <Eye
                      size={20}
                      className="transform transition-transform duration-200 cursor-pointer text-green-600 hover:text-green-800 hover:scale-115"
                      onClick={() => handleShowSubmissions(team)}
                    />
                    <span className="text-xs text-gray-500">Submissions</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Score Modal */}
        {showEditModal && (
          <EditScoreModal team={selectedTeam} onClose={closeAllModals} />
        )}

        {/* Status Modal */}
        {showStatusModal && (
          <StatusModal
            maxGameLevels={3}
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
        {showTeamInfoModal && (
          <TeamInfoModal
            onClose={closeAllModals}
            teamId={activeTeamInfo.teamId}
            teamName={activeTeamInfo.teamName}
          />
        )}
      </>
    );
  }
);

export default Table;
