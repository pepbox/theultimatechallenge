import React, { useState, useEffect } from 'react';

const RoundTimer = () => {
  const [time, setTime] = useState(0); // Time in seconds (starting at 0:00)
  const [isRunning, setIsRunning] = useState(false);
  const totalTime = 120; // Total time in seconds (2:00)
  
  // Calculate progress percentage
  const progress = (time / totalTime) * 100;
  
  // Format time to MM:SS
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Timer logic
  useEffect(() => {
    let interval;
    
    if (isRunning && time < totalTime) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (time >= totalTime) {
      setIsRunning(false);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, time, totalTime]);
  
  // Toggle timer start/stop
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  // Reset timer
  const resetTimer = () => {
    setTime(0);
    setIsRunning(false);
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-64 mx-auto mb-4 font-sans">
      
      <div className="relative w-48 mb-6">
        <div className="flex flex-col items-center justify-center">
          <div className="text-[16px] text-gray-500">Current Round Timer</div>
          <div className="text-[56px] text-[#FCA61E]">{formatTime(time)}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between w-full">
        {/* Play/Pause Button */}
        <button
          onClick={toggleTimer}
          className="w-[48px] h-[48px] rounded-full border border-amber-500 flex items-center justify-center text-amber-500"
        >
          {isRunning ? (
            <span className="material-icons">| |</span>
          ) : (
            <span className="material-icons">▶</span>
          )}
        </button>
        
        {/* Start/Stop Button */}
        <button
          onClick={toggleTimer}
          className="w-[125px] h-[56px] bg-amber-500 text-black rounded-[20px] font-light"
        >
          {isRunning ? 'Stop Round' : 'Start Round'}
        </button>
        
        {/* Reset Button */}
        <button
          onClick={resetTimer}
          className="w-[48px] h-[48px] rounded-full border border-amber-500 flex items-center justify-center text-amber-500"
        >
          <span className="material-icons">↻</span>
        </button>
      </div>
    </div>
  );
};

export default RoundTimer;