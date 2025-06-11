import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { connectSocket, getSocket } from '../../../services/sockets/theUltimateChallenge';

function Login() {
    const [numberOfTeams, setNumberOfTeams] = useState(0);
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [teamNumber, setTeamNumber] = useState('1');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { sessionId } = useParams();
    
    
  

    useEffect(() => {
        const fetchTeams = async () => {
            if (!sessionId || sessionId === 'quizsection') {
                setError('Invalid session ID');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/theultimatechallenge/totalteams`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ sessionId }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch teams');
                }

                const data = await response.json();
                if (data.success) {
                    setNumberOfTeams(data.numberOfTeams);
                } else {
                    setError(data.message || 'Failed to load teams');
                }
            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, [sessionId]);

    const handleLogin = async () => {
        if (!firstName || !lastName) {
            setError('Please enter both first and last name');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            // Get the current socket instance
            const socket = getSocket();
            
            const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/theultimatechallenge/createplayer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    firstName,
                    lastName,
                    sessionId,
                    teamName: `Team ${teamNumber}`,
                    socketId: socket.id // Use the current socket ID
                }),
            });

            const data = await response.json();
            
            if (data.success) {
              
                    window.location.assign(`/theultimatechallenge/quizsection/${sessionId}`);
              
                
            } else {
                setError(data.message || 'Failed to join session');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const teamOptions = Array.from({ length: numberOfTeams }, (_, i) => ({
        value: `${i + 1}`,
        label: `Team ${i + 1}`,
    }));

    return (
        <div className="relative flex justify-center items-center font-mono" style={{ height: `${window.innerHeight}px` }}>
            <div className="w-[100%] bg-[#A9A1EB33] rounded-[20px] flex items-center justify-center mx-[24px] py-4">
                {loading ? (
                    <CircularProgress color="primary" />
                ) : (
                    <div className="w-[100%] mx-[48px] text-[20px] font-bold text-center flex flex-col gap-[12px]">
                        <div className="mx-auto">
                            <h1 className="text-[20px] text-white">The Ultimate Team Challenge</h1>
                        </div>
                        <div className="space-y-[20px]">
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex flex-col gap-[8px]">
                                <input
                                    className="bg-white w-full h-[40px] rounded-[4px] text-[12px] pl-4 text-[#111111B2]/85 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                                <input
                                    className="bg-white w-full h-[40px] rounded-[4px] text-[12px] pl-4 text-[#111111B2]/85 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                                <div className="relative w-full">
                                    <svg
                                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 text-gray-500"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                    <select
                                        className="appearance-none bg-white w-full h-[40px] rounded-[4px] pl-4 text-[12px] text-[#111111B2]/50 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={teamNumber}
                                        onChange={(e) => setTeamNumber(e.target.value)}
                                    >
                                        <option value="" disabled>Team Number</option>
                                        {teamOptions.map((team) => (
                                            <option key={team.value} value={team.value} className="text-[#111111B2]/90">
                                                {team.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button
                                className="bg-[#A34332] w-full h-[40px] text-white font-mono rounded-[12px]"
                                onClick={handleLogin}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={20} color="inherit" /> : 'Log in'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;