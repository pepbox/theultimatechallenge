import { createContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { connectSocket } from "../../services/sockets/theUltimateChallenge";

// Create context
export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const { sessionId } = useParams();
  const [socket, setSocket] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  useEffect(() => {
    let activeSocket;
    connectSocket()
      .then((socketInstance) => {
        setSocket(socketInstance);
        setIsInitialized(true);
        setIsLiveConnected(socketInstance.connected);
        activeSocket = socketInstance;

        const onConnect = () => {
          console.log("Socket reconnected live");
          setIsLiveConnected(true);
        };

        const onDisconnect = () => {
          console.log("Socket disconnected live");
          setIsLiveConnected(false);
        };

        socketInstance.on("connect", onConnect);
        socketInstance.on("disconnect", onDisconnect);
        
        socketInstance.on("player-removed", () => {
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          const pathParts = window.location.pathname.split('/');
          const sId = pathParts[pathParts.length - 1];
          window.location.href = `/theultimatechallenge/login/${sId}`;
        });
      })
      .catch((error) => {
        console.error("Socket connection failed:", error);
      });

    return () => {
      if (activeSocket) {
        activeSocket.off("connect");
        activeSocket.off("disconnect");
        activeSocket.off("player-removed");
      }
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#1b1836] font-mono text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent border-purple-500"></div>
        <p className="mt-4 text-sm text-purple-300">Connecting to server...</p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ sessionId, socket }}>
      <div className="relative w-full min-h-screen">
        {children}
        
        {!isLiveConnected && (
          <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1b1836]/60 backdrop-blur-md transition-all duration-300">
            <div className="bg-[#242047]/95 border border-white/10 rounded-2xl p-8 max-w-sm w-[90%] text-center shadow-2xl flex flex-col items-center gap-4">
              <div className="relative flex items-center justify-center">
                {/* Spinner */}
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-transparent border-red-500"></div>
                {/* Warning icon in the center */}
                <svg className="absolute w-6 h-6 text-red-500 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white font-mono tracking-wider">Connection Lost</h2>
              <p className="text-sm text-purple-200 font-mono">
                You were disconnected from the game server. Attempting to reconnect...
              </p>
              <span className="text-[11px] text-gray-400 font-mono animate-pulse">
                Please do not close this tab or refresh the page.
              </span>
            </div>
          </div>
        )}
      </div>
    </SessionContext.Provider>
  );
};
