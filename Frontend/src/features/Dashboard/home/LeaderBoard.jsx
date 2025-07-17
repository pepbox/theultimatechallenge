import { useState, useEffect } from "react";
import GoldCrown from "../../../assets/images/dashboard/GoldCrown.webp";
import SilverCrown from "../../../assets/images/dashboard/SliverCrown.webp";
import BrownCrown from "../../../assets/images/dashboard/BronzeCrown.webp";
import RoundTimer from "./RoundTimer";
import { getSocket } from "../../../services/sockets/admin";
import { ExpandIcon } from "lucide-react";
import useTimer from "../../user/timer/hooks/useTimer";

const LeaderBoard = ({ isTimerOpen, sessionId }) => {
  const [topTeams, setTopTeams] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const socket = getSocket();

  const processTeamData = (data) => {
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
  };

  useEffect(() => {
    console.log("LeaderBoard component mounted, socket:", socket);

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
      console.log("Received updated team data: IN LEADERBOARD", data);
      processTeamData(data);
    };

    // Listen for real-time team data updates
    socket.on("all-teams-data", handleTeamDataUpdate);

    // Cleanup - remove only this specific handler
    return () => {
      socket.off("all-teams-data", handleTeamDataUpdate);
    };
  }, [socket]);

  const LeaderBoardContent = ({ isPopup = false }) => {
    const containerClass = isPopup
      ? "w-full h-full rounded-2xl bg-white"
      : "w-full h-[250px] sm:h-[300px] border-2 border-[#11111133]/40 rounded-2xl bg-white";

    const headerClass = isPopup
      ? "text-center font-bold text-xl sm:text-2xl lg:text-3xl xl:text-4xl my-4 font-sans"
      : "text-center font-bold text-sm sm:text-base lg:text-lg my-2 font-sans";

    const teamNameClass = isPopup
      ? "text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold text-center break-words"
      : "text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-center break-words";

    const scoreClass = isPopup
      ? "text-xs sm:text-sm md:text-base lg:text-lg font-medium text-center"
      : "text-[10px] sm:text-xs md:text-sm text-center";

    const crownContainerClass = isPopup
      ? "flex justify-between items-start mt-8 sm:mt-12 lg:mt-16 px-4 sm:px-6 md:px-8 lg:px-12 relative h-2/3 w-full"
      : "flex justify-between items-start mt-4 sm:mt-6 lg:mt-10 px-2 sm:px-4 lg:px-6 relative h-2/3 w-full";

    const rankCircleClass = isPopup
      ? "w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-sm sm:text-base lg:text-lg"
      : "w-6 h-6 sm:w-8 sm:h-8 text-xs sm:text-sm";

    return (
      <div className={containerClass}>
        {/* Header with expand button */}
        <div className="relative">
          <div className={headerClass}>Leaderboard</div>
          {!isPopup && (
            <button
              onClick={() => setIsPopupOpen(true)}
              className="absolute top-1 sm:top-2 right-2 sm:right-4 p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Expand Leaderboard"
            >
              <ExpandIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          )}
        </div>

        {/* Crown Images and Teams */}
        <div className={crownContainerClass}>
          {/* Silver Crown - Rank 2 */}
          {topTeams[1] ? (
            <div className="flex flex-col items-center justify-center h-full w-1/3 px-1">
              <div className="w-1/2 sm:w-2/3 md:w-1/2 aspect-square mb-1 sm:mb-2">
                <img
                  src={SilverCrown}
                  alt="Silver Crown"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className={teamNameClass}>{topTeams[1].name}</div>
              <div className={scoreClass}>
                Score: {topTeams[1].score.toLocaleString()}
              </div>
              <div
                className={`${rankCircleClass} rounded-full bg-gray-200 flex items-center justify-center mt-1 mb-2 font-bold`}
              >
                2
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-1/3 px-1">
              <div className="w-1/2 sm:w-2/3 md:w-1/2 aspect-square mb-1 sm:mb-2" />
              <div className={teamNameClass}>-</div>
              <div className={scoreClass}>Score: 0</div>
              <div
                className={`${rankCircleClass} rounded-full bg-gray-200 flex items-center justify-center mt-1 mb-2 font-bold`}
              >
                2
              </div>
            </div>
          )}

          {/* Gold Crown - Rank 1 */}
          {topTeams[0] ? (
            <div
              className={`flex flex-col items-center justify-start w-1/3 px-1 ${
                isPopup ? "-mt-4 sm:-mt-6 lg:-mt-8" : "-mt-2 sm:-mt-4"
              }`}
            >
              <div className="w-2/3 sm:w-3/4 aspect-square mb-1 sm:mb-2">
                <img
                  src={GoldCrown}
                  alt="Gold Crown"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className={teamNameClass}>{topTeams[0].name}</div>
              <div className={scoreClass}>
                Score: {topTeams[0].score.toLocaleString()}
              </div>
              <div
                className={`${rankCircleClass} rounded-full bg-yellow-300 flex items-center justify-center mt-1 mb-2 font-bold`}
              >
                1
              </div>
            </div>
          ) : (
            <div
              className={`flex flex-col items-center justify-start w-1/3 px-1 ${
                isPopup ? "-mt-4 sm:-mt-6 lg:-mt-8" : "-mt-2 sm:-mt-4"
              }`}
            >
              <div className="w-2/3 sm:w-3/4 aspect-square mb-1 sm:mb-2" />
              <div className={teamNameClass}>-</div>
              <div className={scoreClass}>Score: 0</div>
              <div
                className={`${rankCircleClass} rounded-full bg-yellow-300 flex items-center justify-center mt-1 mb-2 font-bold`}
              >
                1
              </div>
            </div>
          )}

          {/* Bronze Crown - Rank 3 */}
          {topTeams[2] ? (
            <div className="flex flex-col items-center justify-center h-full w-1/3 px-1">
              <div className="w-2/5 sm:w-1/2 md:w-2/5 aspect-square mb-1 sm:mb-2">
                <img
                  src={BrownCrown}
                  alt="Bronze Crown"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className={teamNameClass}>{topTeams[2].name}</div>
              <div className={scoreClass}>
                Score: {topTeams[2].score.toLocaleString()}
              </div>
              <div
                className={`${rankCircleClass} rounded-full bg-orange-300 flex items-center justify-center mt-1 mb-2 font-bold`}
              >
                3
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-1/3 px-1">
              <div className="w-2/5 sm:w-1/2 md:w-2/5 aspect-square mb-1 sm:mb-2" />
              <div className={teamNameClass}>-</div>
              <div className={scoreClass}>Score: 0</div>
              <div
                className={`${rankCircleClass} rounded-full bg-orange-300 flex items-center justify-center mt-1 mb-2 font-bold`}
              >
                3
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/4 mx-auto p-2 sm:p-4 font-sans">
        {isTimerOpen && <RoundTimer sessionId={sessionId} />}
        <LeaderBoardContent />
      </div>

      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-[#00000088] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full h-full sm:w-[90vw] sm:h-[80vh] md:w-[85vw] md:h-[75vh] lg:w-[80vw] lg:h-[70vh] max-w-4xl relative">
            {/* Close button */}
            <button
              onClick={() => setIsPopupOpen(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              title="Close"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sm:w-6 sm:h-6"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Leaderboard content in popup */}
            <LeaderBoardContent isPopup={true} />
          </div>
        </div>
      )}
    </>
  );
};

export default LeaderBoard;
