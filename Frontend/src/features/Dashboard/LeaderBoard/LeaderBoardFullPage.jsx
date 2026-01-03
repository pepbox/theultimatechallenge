import { useState, useEffect } from "react";
import GoldCrown from "../../../assets/images/dashboard/GoldCrown.webp";
import SilverCrown from "../../../assets/images/dashboard/SliverCrown.webp";
import BrownCrown from "../../../assets/images/dashboard/BronzeCrown.webp";
import { getSocket, connectSocket } from "../../../services/sockets/admin";

const LeaderBoardFullPage = () => {
  const [allTeams, setAllTeams] = useState([]);
  const [topTeams, setTopTeams] = useState([]);
  const [remainingTeams, setRemainingTeams] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      await connectSocket();
      const socketInstance = getSocket();
      setSocket(socketInstance);
    };

    initSocket();
  }, []);

  const processTeamData = (data) => {
    const sortedTeams = data.teams
      .map((team) => ({
        id: team.teamInfo.id,
        name: team.teamInfo.name,
        score: team.teamInfo.teamScore,
      }))
      .sort((a, b) => b.score - a.score);

    setAllTeams(sortedTeams);
    setTopTeams(sortedTeams.slice(0, 3));
    setRemainingTeams(sortedTeams.slice(3));
  };

  useEffect(() => {
    if (!socket) return;

    console.log("LeaderBoard Full Page component mounted, socket:", socket);

    // Request team data when component mounts
    socket.emit("request-all-teams-data", (response) => {
      if (response.success) {
        processTeamData(response.data);
      } else {
        console.error("Error fetching team data:", response.error);
      }
    });

    // Store handler reference to ensure proper cleanup
    const handleTeamDataUpdate = (data) => {
      console.log("Received updated team data: IN LEADERBOARD FULL PAGE", data);
      processTeamData(data);
    };

    // Listen for real-time team data updates
    socket.on("all-teams-data", handleTeamDataUpdate);

    // Cleanup - remove only this specific handler
    return () => {
      socket.off("all-teams-data", handleTeamDataUpdate);
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-3 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800">
            The Ultimate Challenge
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Leaderboard
          </h2>
          <p></p>
        </div>

        {/* Combined Leaderboard Container */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5">
          <div className="flex justify-between items-start px-2 sm:px-4 md:px-8 relative my-4">
            {/* Silver Crown - Rank 2 */}
            {topTeams[1] ? (
              <div className="flex flex-col items-center justify-center w-1/3 px-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2">
                  <img
                    src={SilverCrown}
                    alt="Silver Crown"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs sm:text-sm lg:text-base font-semibold text-center break-words">
                  {topTeams[1].name}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 text-center mt-0.5">
                  {topTeams[1].score.toLocaleString()}
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mt-1.5 font-bold text-sm">
                  2
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-1/3 px-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2" />
                <div className="text-xs sm:text-sm lg:text-base font-semibold text-center">
                  -
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 text-center mt-0.5">
                  Score: 0
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mt-1.5 font-bold text-sm">
                  2
                </div>
              </div>
            )}

            {/* Gold Crown - Rank 1 */}
            {topTeams[0] ? (
              <div className="flex flex-col items-center justify-start w-1/3 px-1 -mt-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mb-2">
                  <img
                    src={GoldCrown}
                    alt="Gold Crown"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-sm sm:text-base lg:text-lg font-bold text-center break-words">
                  {topTeams[0].name}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 text-center mt-0.5">
                  {topTeams[0].score.toLocaleString()}
                </div>
                <div className="w-9 h-9 rounded-full bg-yellow-300 flex items-center justify-center mt-1.5 font-bold text-base">
                  1
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-start w-1/3 px-1 -mt-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mb-2" />
                <div className="text-sm sm:text-base lg:text-lg font-bold text-center">
                  -
                </div>
                <div className="text-xs sm:text-sm text-gray-600 text-center mt-0.5">
                  Score: 0
                </div>
                <div className="w-9 h-9 rounded-full bg-yellow-300 flex items-center justify-center mt-1.5 font-bold text-base">
                  1
                </div>
              </div>
            )}

            {/* Bronze Crown - Rank 3 */}
            {topTeams[2] ? (
              <div className="flex flex-col items-center justify-center w-1/3 px-1">
                <div className="w-14 h-14 sm:w-18 sm:h-18 mb-2">
                  <img
                    src={BrownCrown}
                    alt="Bronze Crown"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs sm:text-sm lg:text-base font-semibold text-center break-words">
                  {topTeams[2].name}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 text-center mt-0.5">
                  {topTeams[2].score.toLocaleString()}
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-300 flex items-center justify-center mt-1.5 font-bold text-sm">
                  3
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-1/3 px-1">
                <div className="w-14 h-14 sm:w-18 sm:h-18 mb-2" />
                <div className="text-xs sm:text-sm lg:text-base font-semibold text-center">
                  -
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 text-center mt-0.5">
                  Score: 0
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-300 flex items-center justify-center mt-1.5 font-bold text-sm">
                  3
                </div>
              </div>
            )}
          </div>

          {/* All Teams Rankings Table */}
          {remainingTeams.length > 0 && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 text-sm">
                      Rank
                    </th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 text-sm">
                      Team Name
                    </th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700 text-sm">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {remainingTeams.map((team, index) => (
                    <tr
                      key={team.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center">
                          <span className="font-bold text-sm text-gray-700">
                            {index + 4}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-gray-800 text-sm">
                          {team.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-semibold text-gray-900 text-sm">
                          {team.score.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* No teams message */}
        {allTeams.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">
              No teams available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderBoardFullPage;
