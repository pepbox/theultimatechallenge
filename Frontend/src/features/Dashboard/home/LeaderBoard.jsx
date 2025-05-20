import React from 'react';
import GoldCrown from "../../../assets/images/dashboard/GoldCrown.png";
import SilverCrown from "../../../assets/images/dashboard/SliverCrown.png";
import BrownCrown from "../../../assets/images/dashboard/BronzeCrown.png";
import RoundTimer from './RoundTimer';

const LeaderBoard = ({timerIsOpen}) => {
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
          {/* Silver Crown - Team 1 */}
          <div className="flex flex-col items-center justify-center h-full w-1/3">
            <div className="w-1/2 aspect-square mb-2">
              <img src={SilverCrown} alt="Silver Crown" className="w-full h-full object-contain" />
            </div>
            <div className=" text-[24px]">Team 1</div>
            <div className="text-sm">Score: 1234</div>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mt-1 mb-2 font-bold">
              2
            </div>
          </div>
          
          {/* Gold Crown - Team 3 */}
          <div className="flex flex-col items-center justify-start -mt-4 w-1/3">
            <div className="w-3/4 aspect-square mb-2">
              <img src={GoldCrown} alt="Gold Crown" className="w-full h-full object-contain" />
            </div>
            <div className="text-[24px]">Team 3</div>
            <div className="text-sm">Score: 1234</div>
            <div className="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center mt-1 mb-2 font-bold">
              1
            </div>
          </div>
          
          {/* Bronze Crown - Team 7 */}
          <div className="flex flex-col items-center justify-center h-full w-1/3">
            <div className="w-2/5 aspect-square mb-2">
              <img src={BrownCrown} alt="Bronze Crown" className="w-full h-full object-contain" />
            </div>
            <div className="text-[24px]">Team 7</div>
            <div className="text-sm">Score: 1234</div>
            <div className="w-8 h-8 rounded-full bg-orange-300 flex items-center justify-center mt-1 mb-2 font-bold">
              3
            </div>
          </div>
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