import React, { useState } from 'react';
import Popup from "./Popup";
import { useNavigate } from 'react-router-dom';

function TeamName() {
    const [teamName, setTeamName] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault();
        if (teamName.trim()) {
            setShowPopup(true);
        }
        
    };

    const handleClose = ()=>{
            setShowPopup(false);
            navigate("/gamename/playerview")
    }
    

    return (
        <>
            <div className='relative flex items-center justify-center' style={{ minHeight: `${window.innerHeight}px` }}>
                {showPopup && <Popup teamName={teamName} onClose={handleClose} />}
                <div className='w-[100%] flex flex-col items-center justify-between py-10 mx-6' style={{ minHeight: `${window.innerHeight}px` }}>
                    <div className='w-[100%] flex flex-col gap-3'>
                        <h1 className='font-bold text-[24px] font-mono text-white text-center'>Name your Team</h1>
                        <p className='text-white text-[12px] text-center tracking-wider font-mono'>As the captain, you get to choose your team's name!</p>
                        <input
                            placeholder='Enter your Team Name'
                            className='bg-[#D8FEFF] text-[12px] h-[40px] rounded-[4px] pl-3 font-mono outline-none focus:ring-2 focus:ring-blue-500'
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                        />

                    </div>
                    <button
                        onClick={handleSubmit}
                        className='bg-[#1E89E0] text-white w-[100%] h-[40px] rounded-[12px]'
                    >
                        Continue
                    </button>
                </div>
            </div>
        </>
    )
}

export default TeamName;