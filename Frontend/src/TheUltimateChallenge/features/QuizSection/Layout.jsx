import { useEffect, useState } from 'react';
import Header from './Header';
import Overlay from './Overlay';
import Card from './Card';
import { getSocket } from '../../../services/sockets/theUltimateChallenge';

function Layout() {
  const [overlayToggle, setOverlayToggle] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [teamData, setTeamData] = useState(null);
  const [error, setError] = useState(null);
  const socket = getSocket();

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);

    const onTeamData = (data) => {
      console.log('Team data received:', data);
      setTeamData(data);
      setOverlayToggle(data.teamInfo.isPaused)
    };

    const onError = (err) => {
      console.error('Socket error:', err);
      setError(err.message || 'Socket error occurred');
    };

    const onPauseUpdated = (data) => {
      console.log('Session pause status updated:', data.isPaused);
      setOverlayToggle(data.isPaused);
    };

    // Emit request for team data
    socket.emit("request-team-data", (response) => {
      if (response.success) {
        setTeamData(response.data);
      } else {
        setError(response.error || 'Failed to fetch team data');
      }
    });

    // Register event listeners
    socket.on("team-data", onTeamData);
    socket.on("error", onError);
    socket.on("session-pause-updated", onPauseUpdated);

    return () => {
      // Cleanup all listeners
      socket.off("team-data", onTeamData);
      socket.off("error", onError);
      socket.off("session-pause-updated", onPauseUpdated);
      window.removeEventListener('resize', handleResize);
    };
  }, [socket]);

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!teamData) {
    return <div className="p-4">Loading team data...</div>;
  }

  return (
    <div className="relative flex justify-center font-mono" style={{ minHeight: `${windowHeight}px` }}>
      {overlayToggle && <Overlay />}
      <Header teamData={teamData} />
      <Card teamData={teamData} socket={socket} />
    </div>
  );
}

export default Layout;
