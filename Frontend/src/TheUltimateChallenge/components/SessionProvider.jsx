import { createContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { connectSocket } from "../../services/sockets/theUltimateChallenge";

// Create context
export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const { sessionId } = useParams();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let activeSocket;
    connectSocket()
      .then((socketInstance) => {
        setSocket(socketInstance);
        setIsConnected(true);
        activeSocket = socketInstance;
        
        socketInstance.on("player-removed", () => {
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.reload();
        });
      })
      .catch((error) => {
        console.error("Socket connection failed:", error);
      });

    return () => {
      if (activeSocket) {
        activeSocket.off("player-removed");
      }
    };
  }, []);

  if (!isConnected) {
    return <div>Connecting...</div>;
  }

  return (
    <SessionContext.Provider value={{ sessionId, socket }}>
      {children}
    </SessionContext.Provider>
  );
};
