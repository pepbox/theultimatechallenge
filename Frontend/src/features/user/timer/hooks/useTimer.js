import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { getSocket as getAdminSocket } from "../../../../services/sockets/admin.js";
import { getSocket as getUserSocket } from "../../../../services/sockets/theUltimateChallenge.js";

const useTimer = ({ sessionId, mode = "ADMIN" }) => {
    const [timer, setTimer] = useState("00:00");
    const [timerStatus, setTimerStatus] = useState('NOT_SHOW');
    const [pausedDuration, setPausedDuration] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const socket = mode === "ADMIN" ? getAdminSocket() : getUserSocket();
    
    const intervalRef = useRef(null);

    const handleFetchTimerStatus = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/theultimatechallenge/get-timer-status`,
                {
                    params: { sessionId },
                    withCredentials: true
                }
            );

            const data = response.data;
            if (!data.success) {
                throw new Error("Failed to fetch timer status");
            }

            setTimerStatus(data.timer.timerStatus);
            setPausedDuration(data.timer.pausedDuration || 0);
            setStartTime(data.timer.startTime);
        } catch (error) {
            console.error("Error fetching timer status:", error);
        }
    };

    // Socket event listeners
    useEffect(() => {
        if (socket) {
            const handleTimerStarted = (data) => {
                console.log("Timer started:", data);
                setTimerStatus(data.timerStatus);
                // Fetch fresh data to get updated startTime and pausedDuration
                handleFetchTimerStatus();
            };

            const handleTimerPaused = (data) => {
                console.log("Timer paused:", data);
                setTimerStatus(data.timerStatus);
                // Fetch fresh data to get updated pausedDuration
                handleFetchTimerStatus();
            };

            const handleTimerReset = (data) => {
                console.log("Timer reset:", data);
                setTimerStatus(data.timerStatus);
                setTimer("00:00");
                setStartTime(null);
                setPausedDuration(0);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };

            const handleTimerVisibilityToggled = (data) => {
                console.log("Timer visibility toggled:", data);
                setTimerStatus(data.timerStatus);
                if (data.timerStatus === 'NOT_SHOW') {
                    setTimer("00:00");
                    setStartTime(null);
                    setPausedDuration(0);
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                    }
                } else {
                    handleFetchTimerStatus();
                }
            };

            const handleSocketError = (error) => {
                console.error("Socket error:", error);
            };

            // Add event listeners
            socket.on("timer-started", handleTimerStarted);
            socket.on("timer-paused", handleTimerPaused);
            socket.on("timer-reset", handleTimerReset);
            socket.on("timer-visibility-toggled", handleTimerVisibilityToggled);
            socket.on("error", handleSocketError);

            console.log("Socket listeners added for timer events");

            // Cleanup function
            return () => {
                socket.off("timer-started", handleTimerStarted);
                socket.off("timer-paused", handleTimerPaused);
                socket.off("timer-reset", handleTimerReset);
                socket.off("timer-visibility-toggled", handleTimerVisibilityToggled);
                socket.off("error", handleSocketError);
                console.log("Socket listeners removed for timer events");
            };
        }
    }, [socket, sessionId]);

    // Timer calculation effect
    useEffect(() => {
        if (timerStatus === "ON" && startTime) {
            intervalRef.current = setInterval(() => {
                const currentTime = new Date().getTime();
                const elapsedTime = currentTime - new Date(startTime).getTime() - pausedDuration;
                const minutes = Math.floor(elapsedTime / 60000);
                const seconds = Math.floor((elapsedTime % 60000) / 1000);

                // Ensure non-negative values
                const displayMinutes = Math.max(0, minutes);
                const displaySeconds = Math.max(0, seconds);

                setTimer(`${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`);
            }, 1000);
            
            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            };
        } else if (timerStatus === "PAUSED" && startTime) {
            // Clear interval but calculate and display the paused time
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            
            // Calculate elapsed time up to pause point
            const pauseTime = new Date().getTime();
            const elapsedTime = pauseTime - new Date(startTime).getTime() - pausedDuration;
            const minutes = Math.floor(elapsedTime / 60000);
            const seconds = Math.floor((elapsedTime % 60000) / 1000);

            // Ensure non-negative values
            const displayMinutes = Math.max(0, minutes);
            const displaySeconds = Math.max(0, seconds);

            setTimer(`${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`);
        } else {
            // Clear interval when timer is not running
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            
            // Only reset display if timer is hidden
            if (timerStatus === "NOT_SHOW") {
                setTimer("00:00");
            }
        }
    }, [timerStatus, startTime, pausedDuration]);

    // Initialize timer status on mount
    useEffect(() => {
        if (sessionId) {
            handleFetchTimerStatus();
        }
    }, [sessionId]);

    // Cleanup intervals on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Format time to MM:SS
    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    // Admin functions for controlling timer
    const startTimer = () => {
        console.log("Starting timer");
        if (socket) {
            socket.emit("timer-start");
        }
    };

    const pauseTimer = () => {
        console.log("Pausing timer");
        if (socket) {
            socket.emit("pause-timer");
        }
    };

    const resetTimer = () => {
        console.log("Resetting timer");
        if (socket) {
            socket.emit("reset-timer");
        }
    };

    const showTimer = () => {
        if (socket) {
            socket.emit("toggle-show-timer", { showTimer: 'SHOW_TIMER' });
        }
    };

    const hideTimer = () => {
        if (socket) {
            socket.emit("toggle-show-timer", { showTimer: 'OFF' });
        }
    };

    const toggleTimerVisibility = (show) => {
        if (show) {
            showTimer();
        } else {
            hideTimer();
        }
    };

    // Get timer display status for component
    const isTimerVisible = timerStatus !== 'NOT_SHOW';
    const isTimerRunning = timerStatus === 'ON';
    const isTimerPaused = timerStatus === 'PAUSED';

    return {
        // Timer state
        timer,
        timerStatus,
        pausedDuration,
        startTime,
        isTimerVisible,
        isTimerRunning,
        isTimerPaused,
        
        // Timer admin controls
        startTimer,
        pauseTimer,
        resetTimer, // Added reset function
        showTimer,
        hideTimer,
        toggleTimerVisibility,
        
        // Utility functions
        handleFetchTimerStatus,
        formatTime,
        socket,
        
        // Legacy exports (for backward compatibility)
        setTimer,
        setTimerStatus,
        setPausedDuration,
        setStartTime
    };
};

export default useTimer;