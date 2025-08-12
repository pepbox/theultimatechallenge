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
    connectSocket()
      .then((socketInstance) => {
        setSocket(socketInstance);
        setIsConnected(true);
      })
      .catch((error) => {
        console.error("Socket connection failed:", error);
      });
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
