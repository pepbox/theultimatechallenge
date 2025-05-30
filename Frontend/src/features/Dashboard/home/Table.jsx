
import React, { useState, useEffect } from "react";
import { Pencil, Lock, Eye } from "lucide-react";
import { getSocket } from "../../../services/sockets/admin";

function Table({ gameStatusRef, onLevelChange, pendingStatusChange }) {
  const [teamData, setTeamData] = useState([]);
  const socket = getSocket();

  useEffect(() => {
    // Request team data when component mounts
    socket.emit("request-all-teams-data", (response) => {
      if (response.success) {
        // Only update gameStatus if no pending toggle
        if (pendingStatusChange === null) {
          gameStatusRef.current = response.data.isPaused;
        }
        // Update game level
        if (response.data.currentLevel) {
          onLevelChange(response.data.currentLevel);
        }
        // Transform the received data to match mockData structure
        const formattedData = response.data.teams.map((team) => ({
          id: team.teamInfo.name.split("Team")[1],
          players: team.players.length,
          progress: [
            {
              label: "L1",
              value: team.questions.filter((q) => q.level === 1 && q.status === "done").length,
              total: team.questions.filter((q) => q.level === 1).length,
              color: "bg-[#FF6363]",
            },
            {
              label: "L2",
              value: team.questions.filter((q) => q.level === 2 && q.status === "done").length,
              total: team.questions.filter((q) => q.level === 2).length,
              color: "bg-black",
            },
            {
              label: "L3",
              value: team.questions.filter((q) => q.level === 3 && q.status === "done").length,
              total: team.questions.filter((q) => q.level === 3).length,
              color: "bg-[#FCA61E]",
            },
          ],
          score: team.teamInfo.teamScore,
        }));
        setTeamData(formattedData);
      } else {
        console.error("Error fetching team data:", response.error);
      }
    });

    // Listen for real-time team data updates
    socket.on("all-teams-data", (data) => {
      // Only update gameStatus if no pending toggle
      if (pendingStatusChange === null) {
        gameStatusRef.current = data.isPaused;
      }
      // Update game level
      if (data.currentLevel) {
        onLevelChange(data.currentLevel);
      }
      const formattedData = data.teams.map((team) => ({
        id: team.teamInfo.name.split("Team")[1],
        players: team.players.length,
        progress: [
          {
            label: "L1",
            value: team.questions.filter((q) => q.level === 1 && q.status === "done").length,
            total: team.questions.filter((q) => q.level === 1).length,
            color: "bg-[#FF6363]",
          },
          {
            label: "L2",
            value: team.questions.filter((q) => q.level === 2 && q.status === "done").length,
            total: team.questions.filter((q) => q.level === 2).length,
            color: "bg-black",
          },
          {
            label: "L3",
            value: team.questions.filter((q) => q.level === 3 && q.status === "done").length,
            total: team.questions.filter((q) => q.level === 3).length,
            color: "bg-[#FCA61E]",
          },
        ],
        score: team.teamInfo.teamScore,
      }));
      setTeamData(formattedData);
    });

    // Cleanup socket listener on component unmount
    return () => {
      socket.off("all-teams-data");
    };
  }, [socket, gameStatusRef, onLevelChange, pendingStatusChange]);

  return (
    <div className="w-[70%] overflow-x-auto font-sans">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-center">
            {["Team Id", "Players", "Progress", "Score", "Change Score", "Playing Status", "Submissions"].map((title) => (
              <th key={title} className="h-12">
                <div className="flex justify-center items-center text-[12px] text-[#111111]/50">{title}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teamData.map((team) => (
            <tr key={team.id} className="even:bg-gray-50 text-center rounded-2xl">
              <td>
                <div className="flex justify-center items-center h-16 rounded-l-2xl text-[14px]">{team.id}</div>
              </td>
              <td>
                <div className="flex justify-center items-center h-16 text-[14px]">{team.players}</div>
              </td>
              <td>
                <div className="flex flex-col items-center justify-center space-y-1 h-full py-2">
                  {team.progress.map((p) => (
                    <div key={p.label} className="flex items-center space-x-2 text-[14px]">
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
                  <Pencil size={16} className="hover:scale-115 transform transition-transform duration-200" />
                </div>
              </td>
              <td>
                <div className="flex justify-center items-center h-16 text-[14px]">
                  <Lock size={16} className="hover:scale-115 transform transition-transform duration-200" />
                </div>
              </td>
              <td>
                <div className="flex justify-center items-center h-16 text-[14px]">
                  <Eye size={16} className="hover:scale-115 transform transition-transform duration-200" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
