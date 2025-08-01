import { FormControlLabel, styled, Switch } from "@mui/material";
import { useRef, useState, useEffect, useCallback } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Table from "./Table";
import LeaderBoard from "./LeaderBoard";
import {
  EndSessionModal,
  GameLevelChangePopup,
  GameStatusChangePopup,
  GameTransactionChangePopup,
} from "./Popups.jsx";
import { getSocket } from "../../../services/sockets/admin.js";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CachedRounded } from "@mui/icons-material";
import useAdminAuth from "../../../hooks/admin/useAuth.js";
import useTimer from "../../user/timer/hooks/useTimer.js";
import SuccessPopup from "../../../components/SuccessPopup.jsx";

const RotatingIcon = styled(CachedRounded)(({ rotating }) => ({
  transition: "transform 1s ease",
  transform: rotating ? "rotate(360deg)" : "rotate(0deg)",
}));
function Layout() {
  const [sessionInfo, setSessionInfo] = useState({});
  const [gameLevel, setGameLevel] = useState(1);
  const [maxGameLevels, setMaxGameLevels] = useState();
  const [settingOpen, isSettingOpen] = useState(false);
  const socket = getSocket();
  const { sessionId } = useParams();
  const tableRef = useRef(null);
  const { timerStatus, toggleTimerVisibility } = useTimer({ sessionId });

  const { handleLogout } = useAdminAuth();

  const [sessionInfoModal, setSessionInfoModal] = useState(false);
  const [endSessionModal, setEndSessionModal] = useState(false);

  // Game state
  const gameStatus = useRef(true); // Initialize with default false
  const [displayStatus, setDisplayStatus] = useState(false); // For UI switch
  const [transactionsEnabled, setTransactionsEnabled] = useState(false);

  // Popup states
  const [isLevelPopupOpen, setIsLevelPopupOpen] = useState(false);
  const [isStatusPopupOpen, setIsStatusPopupOpen] = useState(false);
  const [isTransactionPopupOpen, setIsTransactionPopupOpen] = useState(false);

  // Pending changes
  const [pendingLevelChange, setPendingLevelChange] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [pendingTransactionChange, setPendingTransactionChange] =
    useState(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchGameSettingsData = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_BASE_URL
        }/api/v1/admin/get-game-settings`,
        {
          params: { sessionId },
          withCredentials: true, // Include cookies for adminToken
        }
      );
      if (response.data.success) {
        const {
          numberOfLevels,
          isPaused,
          adminName,
          sessionName,
          sessionId,
          currentLevel,
          playerGameLink,
          adminGameLink,
        } = response.data.data;
        gameStatus.current = isPaused;
        setDisplayStatus(isPaused);
        setMaxGameLevels(numberOfLevels);
        setGameLevel(currentLevel);
        setSessionInfo({
          sessionId: sessionId,
          adminName: adminName || "Admin",
          sessionName: sessionName || "Session",
          playerGameLink: playerGameLink || "",
          adminGameLink: adminGameLink || "",
        });
      } else {
        console.error(
          "Error fetching game settings data:",
          response.data.error
        );
      }
    } catch (error) {
      console.error(
        "Error fetching game settings data:",
        error.response?.data?.error || error.message
      );
    }
  };
  useEffect(() => {
    fetchGameSettingsData();
  }, [sessionId]);

  const handleLevelChange = (increment) => {
    const newLevel = increment ? gameLevel + 1 : Math.max(1, gameLevel - 1);
    if (newLevel > maxGameLevels) {
      return;
    }
    setPendingLevelChange(newLevel);
    setIsLevelPopupOpen(true);
  };

  const confirmLevelChange = async () => {
    if (pendingLevelChange !== null) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/updatelevel`,
          { sessionId, level: pendingLevelChange },
          { withCredentials: true } // Include cookies for adminToken
        );

        if (response.data.success) {
          setGameLevel(pendingLevelChange);
          // console.log(`Team levels updated to ${pendingLevelChange}`);
        } else {
          console.error("Error updating game level:", response.data.error);
          setGameLevel(gameLevel); // Revert on error
        }
      } catch (error) {
        console.error(
          "Error updating game level:",
          error.response?.data?.error || error.message
        );
        setGameLevel(gameLevel); // Revert on error
      }
    }
    setIsLevelPopupOpen(false);
    setPendingLevelChange(null);
  };

  const handleGameStatusChange = () => {
    setPendingStatusChange(!gameStatus.current);
    setDisplayStatus(!gameStatus.current); // Update UI immediately
    setIsStatusPopupOpen(true);
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange !== null) {
      if (socket) {
        socket.emit(
          "toggle-session-pause",
          { isPaused: pendingStatusChange },
          (response) => {
            if (response.success) {
              // console.log("Session pause status toggled:", response.isPaused);
              gameStatus.current = response.isPaused; // Update only on success
              setDisplayStatus(response.isPaused);
            } else {
              console.error("Error:", response.error);
              setDisplayStatus(gameStatus.current); // Revert UI on error
            }
          }
        );
      }
    }
    setIsStatusPopupOpen(false);
    setPendingStatusChange(null);
  };

  const handleTransactionChange = () => {
    setPendingTransactionChange(!transactionsEnabled);
    setIsTransactionPopupOpen(true);
  };

  const confirmTransactionChange = () => {
    if (pendingTransactionChange !== null) {
      setTransactionsEnabled(pendingTransactionChange);
    }
    setIsTransactionPopupOpen(false);
    setPendingTransactionChange(null);
  };

  const closeLevelPopup = () => {
    setIsLevelPopupOpen(false);
    setPendingLevelChange(null);
  };

  const closeStatusPopup = () => {
    setIsStatusPopupOpen(false);
    setPendingStatusChange(null);
    setDisplayStatus(gameStatus.current); // Revert UI to current status
  };

  const closeTransactionPopup = () => {
    setIsTransactionPopupOpen(false);
    setPendingTransactionChange(null);
  };

  // Callback to update gameLevel and initialize displayStatus
  const handleLevelUpdate = useCallback(
    (newLevel) => {
      setGameLevel(newLevel);
      // Initialize displayStatus from gameStatus.current when receiving initial data
      if (!pendingStatusChange && gameStatus.current !== null) {
        setDisplayStatus(gameStatus.current);
      }
    },
    [pendingStatusChange]
  );

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await tableRef.current?.handleRefresh();
      await fetchGameSettingsData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  const handleToggleTimer = (e) => {
    toggleTimerVisibility(e.target.checked);
  };

  return (
    <div className="relative font-sans max-w-[1440px] w-full mx-auto mb-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto">
        <div>
          <div className="h-[60px] flex items-center">
            <div className="flex items-center gap-4 sm:gap-7 text-sm sm:text-base text-[#111111]">
              <h1 className="text-xl sm:text-2xl font-bold">Admin</h1>
              <button className="text-black">Home</button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#FCA61E]/10 p-4 sm:p-6">
        <h1 className="text-center text-xl sm:text-2xl font-bold">
          {sessionInfo.sessionName}
        </h1>
        <h2 className="text-center text-sm sm:text-base">
          Admin : {sessionInfo.adminName}
        </h2>
        <div className="w-full max-w-6xl mt-4 mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-4 text-sm sm:text-base">
            <button
              onClick={() => setEndSessionModal(true)}
              className="bg-[#111111] h-[40px] w-[175px] rounded-[8px] text-white hover:scale-105 transform transition-transform duration-200 cursor-pointer"
            >
              End Session
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="cursor-pointer" onClick={handleRefresh}>
              <RotatingIcon rotating={isRefreshing ? 1 : 0} />
            </div>
            <div
              className={`relative w-[32px] h-[32px] rounded-full flex justify-center items-center ${
                settingOpen ? "bg-[#1111111A]/50" : ""
              }`}
              onClick={() => isSettingOpen((prev) => !prev)}
            >
              <MoreVertIcon className="w-[32px] h-[32px] hover:scale-115 transform transition-transform duration-200" />
              {settingOpen && (
                <div className="absolute w-[176px] bg-white shadow-md rounded-[12px] top-full mt-2 font-sans flex flex-col gap-[8px] p-[8px] z-10 right-0">
                  <div
                    className="w-[160px] h-[40px] font-medium flex items-center px-2 hover:bg-slate-100 rounded-md cursor-pointer"
                    onClick={() => setSessionInfoModal(true)}
                  >
                    Session Info
                  </div>
                  <div
                    className="w-[160px] h-[40px] font-medium flex items-center px-2 hover:bg-slate-100 rounded-md cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 py-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <h2 className="text-sm sm:text-base text-center">Current Level</h2>
          <div className="w-[102px] h-[40px] rounded-[32px] bg-[#FCA61E1A] flex items-center justify-between border border-[#FCA61E1A]">
            <div
              className={`ml-[5px] w-[30px] h-[30px] rounded-full flex justify-center items-center hover:scale-105 cursor-pointer ${
                gameLevel <= 1 ? "bg-gray-200" : "bg-orange-200"
              }`}
              onClick={() => handleLevelChange(false)}
            >
              <RemoveIcon />
            </div>
            <div>{gameLevel}</div>
            <div
              className={`mr-[5px] w-[30px] h-[30px] rounded-full flex justify-center items-center hover:scale-105 cursor-pointer ${
                gameLevel >= maxGameLevels ? "bg-gray-200" : "bg-orange-300"
              }`}
              onClick={() => handleLevelChange(true)}
            >
              <AddIcon />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center md:justify-content-end gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <FormControlLabel
              control={
                <Switch
                  checked={!displayStatus}
                  onChange={handleGameStatusChange}
                  disabled={pendingStatusChange !== null} // Disable during pending change
                />
              }
              label="Game Status"
              labelPlacement="start"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={transactionsEnabled}
                  onChange={handleTransactionChange}
                />
              }
              label="Enable Transactions"
              labelPlacement="start"
            />
          </div>
          <div>
            <FormControlLabel
              control={
                <Switch
                  checked={timerStatus != "NOT_SHOW"}
                  onChange={handleToggleTimer}
                />
              }
              label="Timer"
              labelPlacement="start"
            />
          </div>
        </div>
      </div>
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <Table
            ref={tableRef}
            gameStatusRef={gameStatus}
            onLevelChange={handleLevelUpdate}
            pendingStatusChange={pendingStatusChange}
            transactionsEnabled={transactionsEnabled}
            maxGameLevels={maxGameLevels}
          />
        </div>
        {/* <div className=" lg:w-80 xl:w-[700px]"> */}
        <LeaderBoard
          isTimerOpen={timerStatus != "NOT_SHOW"}
          sessionId={sessionId}
        />
        {/* </div> */}
      </div>

      <GameLevelChangePopup
        isOpen={isLevelPopupOpen}
        onClose={closeLevelPopup}
        onConfirm={confirmLevelChange}
      />

      <GameStatusChangePopup
        isOpen={isStatusPopupOpen}
        onClose={closeStatusPopup}
        onConfirm={confirmStatusChange}
      />

      <GameTransactionChangePopup
        isOpen={isTransactionPopupOpen}
        onClose={closeTransactionPopup}
        onConfirm={confirmTransactionChange}
      />

      {sessionInfoModal && (
        <SuccessPopup
          onClose={() => {
            setSessionInfoModal(false);
          }}
          sessionData={sessionInfo}
        />
      )}
      {endSessionModal && (
        <EndSessionModal
          onClose={() => setEndSessionModal(false)}
          sessionId={sessionId}
        />
      )}
    </div>
  );
}

export default Layout;
