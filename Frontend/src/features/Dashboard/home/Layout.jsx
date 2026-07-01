import { FormControlLabel, styled, Switch } from "@mui/material";
import { useRef, useState, useEffect, useCallback } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Table from "./Table";
import LeaderBoard from "./LeaderBoard";
import {
  GameLevelChangePopup,
  GameStatusChangePopup,
  GameTransactionChangePopup,
  CreateTeamsPopup,
  GameStartBlockedPopup,
} from "./Popups.jsx";
import { getSocket } from "../../../services/sockets/admin.js";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CachedRounded } from "@mui/icons-material";
import useAdminAuth from "../../../hooks/admin/useAuth.js";
import useTimer from "../../user/timer/hooks/useTimer.js";
import SuccessPopup from "../../../components/SuccessPopup.jsx";
import { Download, Upload, Pencil } from "lucide-react";


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
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const { timerStatus, toggleTimerVisibility } = useTimer({ sessionId });

  const { handleLogout } = useAdminAuth();

  const [sessionInfoModal, setSessionInfoModal] = useState(false);
  // const [endSessionModal, setEndSessionModal] = useState(false);

  // Game state
  const gameStatus = useRef(true); // Initialize with default false
  const [displayStatus, setDisplayStatus] = useState(false); // For UI switch
  const [transactionsEnabled, setTransactionsEnabled] = useState(false);

  // Popup states
  const [isLevelPopupOpen, setIsLevelPopupOpen] = useState(false);
  const [isStatusPopupOpen, setIsStatusPopupOpen] = useState(false);
  const [isTransactionPopupOpen, setIsTransactionPopupOpen] = useState(false);
  const [isCreateTeamsPopupOpen, setIsCreateTeamsPopupOpen] = useState(false);

  // Stats and dynamic levels
  const [numQuestionsSelected, setNumQuestionsSelected] = useState(0);
  const [numTeamsCreated, setNumTeamsCreated] = useState(0);
  const [numTeamsJoined, setNumTeamsJoined] = useState(0);
  const [selectedLevels, setSelectedLevels] = useState([]);

  // Pending changes
  const [pendingLevelChange, setPendingLevelChange] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [pendingTransactionChange, setPendingTransactionChange] =
    useState(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditingBranding, setIsEditingBranding] = useState(false);
  const [isBlockedPopupOpen, setIsBlockedPopupOpen] = useState(false);

  // Branding states
  const [brandingName, setBrandingName] = useState("");
  const [brandingLogo, setBrandingLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [isBrandingSubmitting, setIsBrandingSubmitting] = useState(false);
  const [brandingError, setBrandingError] = useState("");
  const [brandingSuccess, setBrandingSuccess] = useState("");

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBrandingLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBrandingSubmit = async (e) => {
    e.preventDefault();
    setIsBrandingSubmitting(true);
    setBrandingError("");
    setBrandingSuccess("");
    try {
      const formData = new FormData();
      formData.append("sessionId", sessionId);
      formData.append("companyName", brandingName);
      if (brandingLogo) {
        formData.append("logo", brandingLogo);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/update-branding`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setBrandingSuccess("Branding updated successfully!");
        setSessionInfo(prev => ({
          ...prev,
          sessionName: response.data.data.companyName,
          companyLogo: response.data.data.companyLogo
        }));
        setIsEditingBranding(false);
        setTimeout(() => setBrandingSuccess(""), 3000);
      } else {
        setBrandingError(response.data.error || "Failed to update branding");
      }
    } catch (err) {
      console.error("Error updating branding:", err);
      setBrandingError(err.response?.data?.error || "Failed to update branding");
    } finally {
      setIsBrandingSubmitting(false);
    }
  };

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
          companyLogo,
          sessionId,
          currentLevel,
          playerGameLink,
          adminGameLink,
          selectedLevels,
          numQuestionsSelected,
          numTeamsCreated,
          numTeamsJoined,
        } = response.data.data;
        gameStatus.current = isPaused;
        setDisplayStatus(isPaused);
        setMaxGameLevels(numberOfLevels);
        setGameLevel(currentLevel);
        setSelectedLevels(selectedLevels || []);
        setNumQuestionsSelected(numQuestionsSelected || 0);
        setNumTeamsCreated(numTeamsCreated || 0);
        setNumTeamsJoined(numTeamsJoined || 0);
        setSessionInfo({
          sessionId: sessionId,
          adminName: adminName || "Admin",
          sessionName: sessionName || "Session",
          companyLogo: companyLogo || "",
          playerGameLink: playerGameLink || "",
          adminGameLink: adminGameLink || "",
        });
        setBrandingName(sessionName || "");
        setLogoPreview(companyLogo || "");
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
    const highestSelectedLevel = selectedLevels.length > 0 ? Math.max(...selectedLevels) : 1;
    if (newLevel > highestSelectedLevel) {
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
    // If currently paused, trying to turn game ON
    if (gameStatus.current === true) {
      if (numQuestionsSelected === 0 || numTeamsCreated === 0) {
        setIsBlockedPopupOpen(true);
        return;
      }
    }
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
              alert(response.error || "Failed to update game status.");
              setDisplayStatus(gameStatus.current); // Revert UI on error
            }
          }
        );
      }
    }
    setIsStatusPopupOpen(false);
    setPendingStatusChange(null);
  };

  const handleCreateTeams = async (teamsPayload) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/create-teams`,
        { sessionId, ...teamsPayload },
        { withCredentials: true }
      );
      if (response.data.success) {
        setIsCreateTeamsPopupOpen(false);
        // Refresh dashboard data
        await handleRefresh();
      } else {
        alert(response.data.error || "Failed to create teams");
      }
    } catch (err) {
      console.error("Error creating teams:", err);
      alert(err.response?.data?.error || "Failed to create teams");
    }
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

  const handleTeamsCountUpdate = useCallback((createdCount, joinedCount) => {
    setNumTeamsCreated(createdCount);
    setNumTeamsJoined(joinedCount);
  }, []);

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

  const handleDownloadSessionData = () => {
    window.open(
      `${
        import.meta.env.VITE_BACKEND_BASE_URL
      }/api/v1/admin/download-session-data/${sessionId}`,
      "_blank"
    );
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
              <button
                className="text-black hover:text-orange-500 transition-colors duration-200 font-medium"
                onClick={() => navigate(`/admin/${sessionId}/questions`)}
              >
                Question Library
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="md:col-span-2 bg-[#FCA61E]/10 p-4 sm:p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h1 className="text-center text-xl sm:text-2xl font-bold">
              {sessionInfo.sessionName}
            </h1>
            <h2 className="text-center text-sm sm:text-base mt-2">
              Admin : {sessionInfo.adminName}
            </h2>
          </div>
          <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base">
              <button
                onClick={handleDownloadSessionData}
                className="bg-[#111111] p-2 flex items-center gap-1 rounded-[8px] text-white hover:scale-105 transform transition-transform duration-200 cursor-pointer text-xs sm:text-sm font-semibold h-[36px]"
              >
                <Download size={16} /> Download Session Data
              </button>
              <button
                onClick={() => setIsCreateTeamsPopupOpen(true)}
                className="bg-[#111111] hover:bg-gray-800 text-white p-2 flex items-center gap-1 rounded-[8px] hover:scale-105 transform transition-transform duration-200 cursor-pointer text-xs sm:text-sm font-semibold h-[36px]"
              >
                <AddIcon sx={{ fontSize: 16 }} /> Create Teams
              </button>
              {selectedLevels.map((lvl) => {
                return (
                  <button
                    key={lvl}
                    onClick={() => window.open(`/admin/${sessionId}/print-questions/${lvl}`, '_blank')}
                    className="bg-[#FCA61E] hover:bg-[#e09312] text-black p-2 flex items-center gap-1 rounded-[8px] hover:scale-105 transform transition-transform duration-200 cursor-pointer text-xs sm:text-sm font-semibold h-[36px]"
                  >
                    <Download size={16} /> Level {lvl} PDF
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4">
              <div className="cursor-pointer" onClick={handleRefresh}>
                <RotatingIcon rotating={isRefreshing ? 1 : 0} />
              </div>
              <div
                className={`relative w-[32px] h-[32px] rounded-full flex justify-center items-center cursor-pointer ${
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

        <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col justify-between relative">
          {!isEditingBranding && sessionInfo.sessionName ? (
            // View Mode
            <div className="flex flex-col justify-between h-full min-h-[160px]">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-sm sm:text-base text-gray-800">Session Branding</h3>
                <button
                  onClick={() => setIsEditingBranding(true)}
                  className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Edit Branding"
                >
                  <Pencil size={16} />
                </button>
              </div>

              <div className="flex items-center gap-4 my-auto">
                <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                  {sessionInfo.companyLogo ? (
                    <img src={sessionInfo.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-gray-400 font-semibold text-center px-1">No Logo</span>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company Name</span>
                  <p className="text-base sm:text-lg font-bold text-gray-800 break-words">{sessionInfo.sessionName}</p>
                </div>
              </div>
              
              {brandingSuccess && <p className="text-[11px] text-green-600 font-semibold mt-1">{brandingSuccess}</p>}
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleBrandingSubmit} className="flex flex-col gap-3 h-full">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm sm:text-base text-gray-800">Session Branding</h3>
                {sessionInfo.sessionName && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingBranding(false);
                      setBrandingName(sessionInfo.sessionName || "");
                      setLogoPreview(sessionInfo.companyLogo || "");
                      setBrandingLogo(null);
                      setBrandingError("");
                    }}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-gray-400 font-semibold text-center px-1">No Logo</span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors duration-200 border border-gray-300 rounded-lg px-3 py-1.5 flex items-center justify-center gap-1 text-xs font-semibold text-gray-700">
                    <Upload size={12} />
                    Choose Logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Company Name</label>
                <input
                  type="text"
                  value={brandingName}
                  onChange={(e) => setBrandingName(e.target.value)}
                  placeholder="Enter Company Name"
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm outline-none focus:border-orange-500"
                  required
                />
              </div>

              {brandingError && <p className="text-[11px] text-red-500 font-semibold">{brandingError}</p>}
              {brandingSuccess && <p className="text-[11px] text-green-600 font-semibold">{brandingSuccess}</p>}

              <button
                type="submit"
                disabled={isBrandingSubmitting}
                className="mt-auto w-full py-2 bg-[#FCA61E] hover:bg-[#e09115] disabled:bg-gray-300 text-white font-bold text-xs sm:text-sm rounded-lg transition-colors duration-200 shadow-sm"
              >
                {isBrandingSubmitting ? "Saving..." : "Save Branding"}
              </button>
            </form>
          )}
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
            selectedLevels={selectedLevels}
            onTeamsCountUpdate={handleTeamsCountUpdate}
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
        numQuestionsSelected={numQuestionsSelected}
        numTeamsJoined={numTeamsJoined}
        numTeamsCreated={numTeamsCreated}
        isTurningOn={gameStatus.current === true}
      />

      <GameTransactionChangePopup
        isOpen={isTransactionPopupOpen}
        onClose={closeTransactionPopup}
        onConfirm={confirmTransactionChange}
      />

      <CreateTeamsPopup
        isOpen={isCreateTeamsPopupOpen}
        onClose={() => setIsCreateTeamsPopupOpen(false)}
        onConfirm={handleCreateTeams}
      />

      <GameStartBlockedPopup
        isOpen={isBlockedPopupOpen}
        onClose={() => setIsBlockedPopupOpen(false)}
        numQuestionsSelected={numQuestionsSelected}
        numTeamsCreated={numTeamsCreated}
      />

      {sessionInfoModal && (
        <SuccessPopup
          onClose={() => {
            setSessionInfoModal(false);
          }}
          sessionData={sessionInfo}
        />
      )}
      {/* {endSessionModal && (
        <EndSessionModal
          onClose={() => setEndSessionModal(false)}
          sessionId={sessionId}
        />
      )} */}
    </div>
  );
}

export default Layout;
