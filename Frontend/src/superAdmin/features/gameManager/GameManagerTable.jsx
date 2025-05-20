import { useState } from "react";
import { Filter, Edit, Trash2, ExternalLink, Archive } from "lucide-react";
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';



export default function GameManagerTable() {
  // Mock data for games
  const [games, setGames] = useState([
    {
      id: 1,
      name: "Game Name",
      status: "Live",
      createdOn: "14 Apr 2025",
      teams: 7,
      phases: ["Spin", "Vote"],
      actions: ["edit", "archive", "delete", "open"]
    },
    {
      id: 2,
      name: "Game Name",
      status: "Paused",
      createdOn: "14 Apr 2025",
      teams: 7,
      phases: ["Spin", "Vote", "Team name"],
      actions: ["edit", "archive", "delete", "open"]
    },
    {
      id: 3,
      name: "Game Name",
      status: "Completed",
      createdOn: "14 Apr 2025",
      teams: 7,
      phases: ["Quiz"],
      actions: ["edit", "archive", "delete", "open"]
    },
    {
      id: 4,
      name: "Game Name",
      status: "Live",
      createdOn: "14 Apr 2025",
      teams: 7,
      phases: ["Quiz"],
      actions: ["edit", "archive", "delete", "open"]
    },
    {
      id: 5,
      name: "Game Name",
      status: "Live",
      createdOn: "14 Apr 2025",
      teams: 7,
      phases: ["Quiz"],
      actions: ["edit", "archive", "delete", "open"]
    },
    {
      id: 6,
      name: "Game Name",
      status: "Live",
      createdOn: "14 Apr 2025",
      teams: 7,
      phases: ["Quiz"],
      actions: ["edit", "archive", "delete", "open"]
    }
  ]);

  

  return (
    <div className="w-full bg-white   overflow-hidden font-sans ">
      {/* Header with filter */}
      <div className="flex justify-end p-4 border-b border-gray-100">
        <button className="flex items-center text-gray-500 gap-1 hover:text-gray-700">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-6 py-3 px-4 text-sm font-medium text-gray-500">
        <div>Game Name</div>
        <div>Status</div>
        <div>Created On</div>
        <div>Teams</div>
        <div>Phases Enabled</div>
        <div>Action</div>
      </div>

      {/* Table rows */}
      <div className="divide-y divide-gray-100 border-t border-gray-100">
        {games.map((game,index) => (
          <div 
            key={game.id} 
           className={`grid grid-cols-6 py-4 px-4 items-center text-sm border-b border-dashed border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
        
          >
            <div className=" text-gray-800 text-[14px]">{game.name}</div>
            <div className={` `}>
              {game.status}
            </div>
            <div className="text-gray-600 text-[14px]">{game.createdOn}</div>
            <div className="text-gray-600 text-[14px]">{game.teams}</div>
            <div className="text-gray-700 text-[14px]">
              {game.phases.join(", ")}
            </div>
            <div className="flex items-center space-x-3">
              <button className="text-gray-500 hover:text-blue-600">
                <Edit size={18} />
              </button>
              <button className="text-gray-500 hover:text-blue-600">
                <Archive size={18} />
              </button>
              <button className=" text-[#FF6363]">
                <Trash2 size={18} />
              </button>
              <button className="text-gray-500 hover:text-blue-600">
                <ArrowForwardOutlinedIcon size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}