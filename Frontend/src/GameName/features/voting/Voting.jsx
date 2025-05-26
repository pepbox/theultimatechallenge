import React, { useState } from 'react';
import PlayerAvatar from "../../assets/images/teamPlayers/PlayerAvatar.jpg";
import CountArrow from "../../assets/images/voting/CountArrow.png";
import Popup from "./Popup";
import { useNavigate } from 'react-router-dom';

const Voting = () => {
    const [players, setPlayers] = useState([
        { id: 1, name: 'Player 1', votes: 0, isYou: false },
        { id: 2, name: 'Player 2', votes: 0, isYou: false },
        { id: 3, name: 'Player 3', votes: 0, isYou: false },
        { id: 4, name: 'Player 4', votes: 0, isYou: true },
    ]);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(80);
    const [hasVoted, setHasVoted] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleVoteClick = (player) => {
        if (!hasVoted) {
            setSelectedPlayer(player);
            setShowPopup(true);
        }
    };

    const confirmVote = () => {
        setPlayers(prevPlayers => 
            prevPlayers.map(player => 
                player.id === selectedPlayer.id 
                    ? { ...player, votes: player.votes + 1 } 
                    : player
            )
        );
        setHasVoted(true);
        setShowPopup(false);
        setTimeout(()=>{
            navigate("/gamename/captionname")
        },2000)
    };

    const cancelVote = () => {
        setShowPopup(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className='relative flex items-center justify-center' style={{ minHeight: `${window.innerHeight}px` }}>
            {showPopup && (
                <Popup 
                    playerName={selectedPlayer?.name}
                    onConfirm={confirmVote}
                    onCancel={cancelVote}
                />
            )}
            
            <div className='w-[100%] flex flex-col items-center justify-between py-10 mx-6' style={{ minHeight: `${window.innerHeight}px` }}>
                <div className='w-[100%]'>
                    <p className='text-[20px] font-mono font-bold text-white text-center'>Voting</p>
                    <p className='text-[16px] font-mono text-white text-center mt-2'>Team 2 - Red</p>
                    <div className='w-[100%] flex justify-between mt-2'>
                        <div className='h-[20px] w-[70%] bg-white rounded-full flex items-center '>
                            <div 
                                className='h-[16px] bg-[#1E89E0] rounded-full ml-[2px] mr-[2px]' 
                                style={{ width: `${(players.reduce((sum, player) => sum + player.votes, 0) / (players.length * 2)) * 100}%` }}
                            ></div>
                        </div>
                        <div className='flex items-center'>
                            <p className='text-[12px] font-mono text-white '>{formatTime(timeLeft)} Left</p>
                        </div>
                    </div>

                    {players.map((player) => (
                        <div key={player.id} className='w-[100%] h-[64px] bg-[#6B6694CC]/80 rounded-[12px] backdrop-blur-[2px] flex items-center justify-between mt-3'>
                            <div className='flex items-center gap-3'>
                                <div className='w-[48px] h-[48px] rounded-full bg-white overflow-hidden ml-2 '>
                                    <img src={PlayerAvatar} className='object-cover w-[48px] h-[48px]' alt="Player" />
                                </div>
                                <p className='font-bold text-white text-[14px] font-mono'>
                                    {player.name} {player.isYou && <span className='font-normal text-[12px]'>[you]</span>}
                                </p>
                            </div>
                            <div className='flex gap-2 items-center mr-2'>
                                <img className='h-[25px]' src={CountArrow} alt="Votes" />
                                <p className='text-white'>{player.votes}</p>
                                <button 
                                    className={`w-[52px] h-[33px] text-[14px] rounded-[12px] text-white ${
                                        hasVoted ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#1E89E0]'
                                    }`}
                                    onClick={() => handleVoteClick(player)}
                                    disabled={hasVoted}
                                >
                                    Vote
                                </button>
                            </div>
                        </div>
                    ))}

                    {hasVoted && (
                        <div className="w-full text-center mt-4">
                            <p className="text-white font-mono text-[14px]">
                                Your vote has been casted for {selectedPlayer?.name}
                            </p>
                            <p className="text-white font-mono text-[14px] mt-2">
                                Waiting for other player to cast their vote.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Voting;