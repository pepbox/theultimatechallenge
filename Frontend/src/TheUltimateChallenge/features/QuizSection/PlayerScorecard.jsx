import React from "react";
import GoldCrown from "../../../assets/images/dashboard/GoldCrown.webp";
import SilverCrown from "../../../assets/images/dashboard/SliverCrown.webp";
import BrownCrown from "../../../assets/images/dashboard/BronzeCrown.webp";

function PlayerScorecard({ leaderboard = [], ownTeamName }) {
  const normalizedLeaderboard = (leaderboard || []).map(team => ({
    id: team.id || team.teamId || "",
    name: team.name || team.teamName || "",
    score: typeof team.score === 'number' ? team.score : 0,
    rank: typeof team.rank === 'number' ? team.rank : 0
  }));

  const topTeams = normalizedLeaderboard.slice(0, 3);
  const remainingTeams = normalizedLeaderboard.slice(3);

  const isOwnTeam = (name) => {
    return ownTeamName && name && name.toLowerCase() === ownTeamName.toLowerCase();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-orange-50 to-white p-3 sm:p-4 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800">
            The Ultimate Challenge
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Leaderboard
          </h2>
        </div>

        {/* Combined Leaderboard Container */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5">
          <div className="flex justify-between items-start px-2 sm:px-4 md:px-8 relative my-4">
            {/* Silver Crown - Rank 2 */}
            {topTeams[1] ? (
              <div className={`flex flex-col items-center justify-center w-1/3 px-1 py-2 rounded-xl transition-all ${
                isOwnTeam(topTeams[1].name) ? "bg-orange-50 border border-orange-200 ring-2 ring-orange-200" : ""
              }`}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2">
                  <img
                    src={SilverCrown}
                    alt="Silver Crown"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs sm:text-sm lg:text-base font-semibold text-center break-words flex items-center justify-center gap-1">
                  {topTeams[1].name}
                  {isOwnTeam(topTeams[1].name) && (
                    <span className="bg-orange-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">You</span>
                  )}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 text-center mt-0.5">
                  {topTeams[1].score.toLocaleString()}
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mt-1.5 font-bold text-sm">
                  {topTeams[1].rank}
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
              <div className={`flex flex-col items-center justify-start w-1/3 px-1 -mt-4 py-2 rounded-xl transition-all ${
                isOwnTeam(topTeams[0].name) ? "bg-orange-50 border border-orange-200 ring-2 ring-orange-200" : ""
              }`}>
                <div className="w-20 h-20 sm:w-24 sm:h-24 mb-2">
                  <img
                    src={GoldCrown}
                    alt="Gold Crown"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-sm sm:text-base lg:text-lg font-bold text-center break-words flex items-center justify-center gap-1">
                  {topTeams[0].name}
                  {isOwnTeam(topTeams[0].name) && (
                    <span className="bg-orange-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">You</span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 text-center mt-0.5">
                  {topTeams[0].score.toLocaleString()}
                </div>
                <div className="w-9 h-9 rounded-full bg-yellow-300 flex items-center justify-center mt-1.5 font-bold text-base">
                  {topTeams[0].rank}
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
              <div className={`flex flex-col items-center justify-center w-1/3 px-1 py-2 rounded-xl transition-all ${
                isOwnTeam(topTeams[2].name) ? "bg-orange-50 border border-orange-200 ring-2 ring-orange-200" : ""
              }`}>
                <div className="w-14 h-14 sm:w-18 sm:h-18 mb-2">
                  <img
                    src={BrownCrown}
                    alt="Bronze Crown"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs sm:text-sm lg:text-base font-semibold text-center break-words flex items-center justify-center gap-1">
                  {topTeams[2].name}
                  {isOwnTeam(topTeams[2].name) && (
                    <span className="bg-orange-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">You</span>
                  )}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 text-center mt-0.5">
                  {topTeams[2].score.toLocaleString()}
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-300 flex items-center justify-center mt-1.5 font-bold text-sm">
                  {topTeams[2].rank}
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
                  {remainingTeams.map((team) => {
                    const highlight = isOwnTeam(team.name);
                    return (
                      <tr
                        key={team.id || team.name}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          highlight ? "bg-orange-50 hover:bg-orange-100 font-bold" : ""
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center">
                            <span className={`text-sm ${highlight ? "text-orange-600 font-bold" : "text-gray-700"}`}>
                              {team.rank}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`text-sm flex items-center gap-1.5 ${highlight ? "text-orange-700 font-bold" : "text-gray-800"}`}>
                            {team.name}
                            {highlight && (
                              <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                You
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`text-sm ${highlight ? "text-orange-700 font-bold" : "text-gray-900 font-semibold"}`}>
                            {team.score.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* No teams message */}
        {normalizedLeaderboard.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center mt-4">
            <p className="text-gray-500 text-lg">
              No teams available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerScorecard;
