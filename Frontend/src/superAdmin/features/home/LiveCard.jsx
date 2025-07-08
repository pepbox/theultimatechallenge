import { useState } from "react";
import SuccessPopup from "../createGamesSessions/theUltimateChallenge/SuccessPopup";
import EditSessionPopup from "./EditSessionPopup";
import { Edit2 } from "lucide-react";

function LiveCard({ game, handleRefresh }) {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editSessionModalOpen, setEditSessionModalOpen] = useState(false);
  const [copyLink, setCopyLink] = useState(false);
  const sessionData = {
    sessionId: game._id,
    sessionName: game.companyName,
    adminName: game.admin,
    adminPassword: game.passCode,
    playerGameLink: game.playerGameLink,
    adminGameLink: game.adminGameLink,
  };

  const copyToClipboard = () => {
    const gameLink = `${window.location.origin}/admin/login/${game._id}`;
    navigator.clipboard.writeText(gameLink);
    setCopyLink(true);
    setTimeout(() => {
      setCopyLink(false);
    }, 2000);
  };
  return (
    <div className="w-[305px] py-4 bg-[#8C8C8C1A] rounded-[20px] font-sans ">
      <div className="flex w-[100%] px-4 justify-between items-center">
        <div className="flex items-center gap-1">
          <h1 className="font-bold">{game.companyName}</h1>

          <div
            onClick={() => setEditSessionModalOpen(true)}
            className="flex items-center justify-center  hover:bg-gray-200 rounded-full mt-1 cursor-pointer p-2 "
          >
            <Edit2 size={12} className="" />
          </div>
        </div>
        <div className="w-[8px] h-[8px] rounded-full bg-[#81DE48]"></div>
      </div>
      <div className="mt-4">
        <div className="flex w-[100%] px-4 justify-between items-center mt-2 ">
          <h1>Admin</h1>
          <div className="">{game.admin}</div>
        </div>
        <div className="flex w-[100%] px-4 justify-between items-center mt-2 ">
          <h1>Players</h1>
          <div className="">{game.playerCount}</div>
        </div>
        <div className="flex w-[100%] px-4 justify-between items-center mt-2 ">
          <h1>Teams</h1>
          <div className="">{game.numberOfTeams}</div>
        </div>
        {/* <div className='flex w-[100%] px-4 justify-between items-center mt-2 '>
                    <h1>Phase</h1>
                    <div className=''>{Team Naming}</div>
                </div> */}
      </div>
      <div className="flex gap-2 w-[100%] px-4 mt-3">
        <button
          onClick={copyToClipboard}
          className="border grow h-[34px] rounded-[12px] cursor-pointer"
        >
          {copyLink ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={() => setViewModalOpen(true)}
          className="bg-black grow text-white h-[34px] cursor-pointer rounded-[12px]"
        >
          View
        </button>
      </div>
      {viewModalOpen && (
        <SuccessPopup
          sessionData={sessionData}
          onClose={() => setViewModalOpen(false)}
        />
      )}
      {editSessionModalOpen && (
        <EditSessionPopup
          sessionData={sessionData}
          handleRefresh={handleRefresh}
          sessionId={sessionData.sessionId}
          onClose={() => setEditSessionModalOpen(false)}
        />
      )}
    </div>
  );
}

export default LiveCard;
