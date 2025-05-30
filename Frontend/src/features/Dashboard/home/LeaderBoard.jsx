import React, { useState, useEffect } from "react";
import GoldCrown from "../../../assets/images/dashboard/GoldCrown.png";
import SilverCrown from "../../../assets/images/dashboard/SliverCrown.png";
import BrownCrown from "../../../assets/images/dashboard/BronzeCrown.png";
import RoundTimer from "./RoundTimer";
import { getSocket } from "../../../services/sockets/admin";

const LeaderBoard = ({ timerIsOpen }) => {
  const [topTeams, setTopTeams] = useState([]);
  const socket = getSocket();

  useEffect(() => {
    // Request team data when component mounts
    socket.emit("request-all-teams-data", (response) => {
      
      if (response.success) {
        // Sort teams by score and select top 3
        const sortedTeams = response.data.teams
          .sort((a, b) => b.teamInfo.teamScore - a.teamInfo.teamScore)
          .slice(0, 3)
          .map((team, index) => ({
            id: team.teamInfo.id,
            name: team.teamInfo.name,
            score: team.teamInfo.teamScore,
            rank: index + 1,
          }));
        setTopTeams(sortedTeams);
      } else {
        console.error("Error fetching team data:", response.error);
      }
    });

    // Listen for real-time team data updates
    socket.on("all-teams-data", (data) => {
      const sortedTeams = data.teams
        .sort((a, b) => b.teamInfo.teamScore - a.teamInfo.teamScore)
        .slice(0, 3)
        .map((team, index) => ({
          id: team.teamInfo.id,
          name: team.teamInfo.name,
          score: team.teamInfo.teamScore,
          rank: index + 1,
        }));
      setTopTeams(sortedTeams);
    });

    // Cleanup socket listener on component unmount
    return () => {
      socket.off("all-teams-data");
    };
  }, [socket]);

  return (
    <div className="w-1/3 mx-auto p-4 font-sans">
      {timerIsOpen && <RoundTimer />}

      <div className="w-full aspect-square border-2 border-[#11111133]/40 rounded-2xl bg-white">
        {/* Header */}
        <div className="text-center font-bold text-[16px] my-2 font-sans">
          Leaderboard
        </div>

        {/* Crown Images and Teams */}
        <div className="flex justify-between items-start mt-10 px-6 relative h-2/3 w-full">
          {/* Silver Crown - Rank 2 */}
          {topTeams[1] ? (
            <div className="flex flex-col items-center justify-center h-full w-1/3">
              <div className="w-1/2 aspect-square mb-2">
                <img src={SilverCrown} alt="Silver Crown" className="w-full h-full object-contain" />
              </div>
              <div className="text-[24px]">{topTeams[1].name}</div>
              <div className="text-sm">Score: {topTeams[1].score.toLocaleString()}</div>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mt-1 mb-2 font-bold">
                2
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-1/3">
              <div className="w-1/2 aspect-square mb-2" />
              <div className="text-[24px]">-</div>
              <div className="text-sm">Score: 0</div>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mt-1 mb-2 font-bold">
                2
              </div>
            </div>
          )}

          {/* Gold Crown - Rank 1 */}
          {topTeams[0] ? (
            <div className="flex flex-col items-center justify-start -mt-4 w-1/3">
              <div className="w-3/4 aspect-square mb-2">
                <img src={GoldCrown} alt="Gold Crown" className="w-full h-full object-contain" />
              </div>
              <div className="text-[24px]">{topTeams[0].name}</div>
              <div className="text-sm">Score: {topTeams[0].score.toLocaleString()}</div>
              <div className="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center mt-1 mb-2 font-bold">
                1
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-start -mt-4 w-1/3">
              <div className="w-3/4 aspect-square mb-2" />
              <div className="text-[24px]">-</div>
              <div className="text-sm">Score: 0</div>
              <div className="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center mt-1 mb-2 font-bold">
                1
              </div>
            </div>
          )}

          {/* Bronze Crown - Rank 3 */}
          {topTeams[2] ? (
            <div className="flex flex-col items-center justify-center h-full w-1/3">
              <div className="w-2/5 aspect-square mb-2">
                <img src={BrownCrown} alt="Bronze Crown" className="w-full h-full object-contain" />
              </div>
              <div className="text-[24px]">{topTeams[2].name}</div>
              <div className="text-sm">Score: {topTeams[2].score.toLocaleString()}</div>
              <div className="w-8 h-8 rounded-full bg-orange-300 flex items-center justify-center mt-1 mb-2 font-bold">
                3
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-1/3">
              <div className="w-2/5 aspect-square mb-2" />
              <div className="text-[24px]">-</div>
              <div className="text-sm">Score: 0</div>
              <div className="w-8 h-8 rounded-full bg-orange-300 flex items-center justify-center mt-1 mb-2 font-bold">
                3
              </div>
            </div>
          )}
        </div>

        {/* View All */}
        <div className="text-center mb-4">
          <span className="text-gray-600 cursor-pointer">View All &gt;</span>
        </div>
      </div>
    </div>
  );
};

export default LeaderBoard;