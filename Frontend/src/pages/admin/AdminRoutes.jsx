import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PepBoxAdminDashboard from '../../features/Dashboard/home/Layout.jsx';
import History from "../../features/Dashboard/history/History.jsx"
import GameHistory from "../../features/Dashboard/gameHistory/GameHistory.jsx"
import LeaderBoard from '../../features/Dashboard/LeaderBoard/LeaderBoard.jsx';
import AdminLogin from '../../features/login.jsx';
import { connectSocket, disconnectSocket } from '../../services/sockets/admin.js';
import AuthWrapper from '../../features/auth/AuthWrapper.jsx';




function AdminRoutes() {

    useEffect(() => {
        connectSocket()
        return () => disconnectSocket()
    }, [])


    return (    
        <Routes>
            <Route path="/login/:sessionId" element={<AdminLogin />} />
            <Route path='/:sessionId' element={<AuthWrapper role={"admin"}><PepBoxAdminDashboard /></AuthWrapper>} />
            <Route path='/history' element={<History />} />
            <Route path='/gamehistory' element={<GameHistory />} />
            <Route path='/leaderboard' element={<LeaderBoard />} />
        </Routes>
    );
}

export default AdminRoutes;

// 