import React, { useState } from "react";
import SyncAltIcon from '@mui/icons-material/SyncAlt';

const leaderboardData = [
  { rank: 1, team: 9, name: "Name", score: 20 },
  { rank: 2, team: 5, name: "Name", score: 20 },
  { rank: 3, team: 3, name: "Name", score: 20 },
  { rank: 4, team: 1, name: "Name", score: 20 },
  { rank: 5, team: 4, name: "Name", score: 20 },
  { rank: 6, team: 2, name: "Name", score: 20 },
  { rank: 7, team: 8, name: "Name", score: 20 },
  { rank: 8, team: 6, name: "Name", score: 20 },
  { rank: 9, team: 7, name: "Name", score: 20 },
  { rank: 10, team: 10, name: "Name", score: 20 }
];

const Leaderboard = () => {
  const [data, setData] = useState(leaderboardData);
  const [rankSort, setRankSort] = useState(true);
  const [teamSort, setTeamSort] = useState(true);

  return (
    <div className="font-sans max-w-[1440px] w-[100%] mx-auto mb-10">
      <div className="w-[80%] mx-auto ">
        <div className="flex justify-center my-5">
          <h1 className="text-[20px] font-bold">Leaderboard</h1>
        </div>

        <div className="w-full">
          <div className="flex items-center  text-gray-500 text-[16px] mb-4">
            <div className="w-1/4 flex items-center justify-center">
              <button
                className="flex items-center font-normal gap-1"
                onClick={() => setRankSort(!rankSort)}
              >
                Rank
                <div >
                  <SyncAltIcon fontSize="small" className="rotate-90" />
                </div>
              </button>
            </div>
            <div className="w-1/4 flex items-center justify-center gap-1">
              <button
                className="flex items-center text-[16px]  font-normal gap-1"
                onClick={() => setTeamSort(!teamSort)}
              >
                Team
                <div >
                  <SyncAltIcon fontSize="small" className="rotate-90" />
                </div>
              </button>
            </div>
            <div className="w-1/4 font-normal flex items-center justify-center">Name</div>
            <div className="w-1/4 text-right font-normal flex items-center justify-center">Score</div>
          </div>

          {data.map((item, index) => (
            <div
              key={index}
              className={`flex items-center py-6 rounded-sm  ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
            >
              <div className="w-1/4 text-center">{item.rank}</div>
              <div className="w-1/4 text-center">{item.team}</div>
              <div className="w-1/4 text-center">{item.name}</div>
              <div className="w-1/4 text-center">{item.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;