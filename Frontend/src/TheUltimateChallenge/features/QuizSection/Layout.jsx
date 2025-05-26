import React, { useEffect, useState } from 'react';
import Header from './Header';
import Overlay from './Overlay';
import Card from './Card';
import { getSocket } from '../../../services/sockets/theUltimateChallenge';
import { useParams } from 'react-router-dom';

function Layout() {
  const [overlayToggle, setOverlayToggle] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [teamData, setTeamData] = useState(null);
  const [error, setError] = useState(null);
  const socket = getSocket();
  const { sessionId } = useParams();

  useEffect(() => {
    const onTeamData = (data) => {
      console.log('Team data received:', data);
      setTeamData(data);
    };

    const onError = (err) => {
      console.error('Socket error:', err);
      setError(err.message || 'Socket error occurred');
    };

    // Request team data immediately
    socket.emit("request-team-data", (response) => {
      if (response.success) {
        setTeamData(response.data);
      } else {
        setError(response.error || 'Failed to fetch team data');
      }
    });

    // Set up listeners
    socket.on("team-data", onTeamData);
    socket.on("error", onError);

    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);

    return () => {
      socket.off("team-data", onTeamData);
      socket.off("error", onError);
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
      <Header teamData={teamData}/>
      <Card teamData={teamData} socket={socket} />
    </div>
  );
}

export default Layout;