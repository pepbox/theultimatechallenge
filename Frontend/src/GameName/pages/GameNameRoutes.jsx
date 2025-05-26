import React from 'react'
import Background from "../assets/images/background/Background.jpg"
import Login from "./Login"
import { Routes, Route } from 'react-router-dom';
import TeamSelection from './TeamSelection';
import PlayerName from '../features/playersName/PlayerName';
import TeamResult from '../features/teamSelection/TeamResult';
import Voting from './Voting';
import PlayerView from './PlayerView';
import AllTeams from './AllTeams';
import CaptionName from './CaptionName';
import TeamName from './TeamName';

function GameNameRoutes() {
  return (
    <div style={{
        position: 'relative',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: `${window.innerHeight}px`,
        backgroundColor: "#23203E"
    }}>
    
        {/* Background image */}
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${Background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
            zIndex: 0
        }}></div>
    
        {/* White gradient overlay (bottom to top) */}
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to top, rgba(255,255,255,0.1), rgba(255,255,255,0))',
            zIndex: 1
        }}></div>
    
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2 ,minHeight: `${window.innerHeight}px`, }}>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/teamselection" element={<TeamSelection />} />
                <Route path="/teamresult" element={<TeamResult />} />
                <Route path="/playername" element={<PlayerName/>} />
                <Route path="/voting" element={<Voting/>} />
                <Route path="/captionname" element={<CaptionName/>} />
                <Route path="/teamname" element={<TeamName/>} />
                <Route path="/playerview" element={<PlayerView/>} />
                <Route path="/allteams" element={<AllTeams/>} />
            </Routes>
        </div>
    </div>
    
  )
}

export default GameNameRoutes