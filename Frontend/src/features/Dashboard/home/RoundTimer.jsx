import useTimer from "../../user/timer/hooks/useTimer";

const RoundTimer = ({ sessionId }) => {
  const { 
    timer, 
    timerStatus, 
    pauseTimer, 
    startTimer, 
    resetTimer,
    isTimerRunning,
    isTimerPaused,
    isTimerVisible
  } = useTimer({ sessionId, mode: "ADMIN" });

  // Format time helper function
  const formatTime = (timeString) => {
    return timeString || "00:00";
  };

  // Toggle timer start/pause
  const toggleTimer = () => {
    if (isTimerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  // Reset timer
  const handleResetTimer = () => {
    resetTimer();
  };

  // Get display text based on timer status
  const getButtonText = () => {
    if (isTimerRunning) {
      return "Pause Round";
    } else if (isTimerPaused) {
      return "Resume Round";
    } else {
      return "Start Round";
    }
  };

  // Get button icon based on timer status
  const getButtonIcon = () => {
    if (isTimerRunning) {
      return "⏸"; // Pause icon
    } else {
      return "▶"; // Play icon
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-64 mx-auto mb-4 font-sans">
      <div className="relative w-48 mb-6">
        <div className="flex flex-col items-center justify-center">
          <div className="text-[16px] text-gray-500">Current Round Timer</div>
          <div className="text-[56px] text-[#FCA61E]">{formatTime(timer)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between w-full">
        {/* Play/Pause Button */}
        <button
          onClick={toggleTimer}
          disabled={!isTimerVisible}
          className={`w-[48px] h-[48px] rounded-full border border-amber-500 flex items-center justify-center text-amber-500 ${
            !isTimerVisible
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-amber-50"
          }`}
        >
          <span className="text-[20px]">{getButtonIcon()}</span>
        </button>

        {/* Start/Stop Button */}
        <button
          onClick={toggleTimer}
          disabled={!isTimerVisible}
          className={`w-[125px] h-[56px] bg-amber-500 text-black rounded-[20px] font-light transition-colors ${
            !isTimerVisible
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-amber-600"
          }`}
        >
          {getButtonText()}
        </button>

        {/* Reset Button */}
        <button
          onClick={handleResetTimer}
          disabled={!isTimerVisible}
          className={`w-[48px] h-[48px] rounded-full border border-amber-500 flex items-center justify-center text-amber-500 ${
            !isTimerVisible
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-amber-50"
          }`}
        >
          <span className="text-[20px]">↻</span>
        </button>
      </div>
    </div>
  );
};

export default RoundTimer;