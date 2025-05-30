import React, { useState } from 'react'
import PlayerAvatar from "../../assets/images/teamPlayers/PlayerAvatar.jpg"
import Crown from "../../assets/images/playerNames/Crown.png"
import { useNavigate } from 'react-router-dom';

function AllTeams() {
    const arr = new Array(10).fill(1);
    const [viewTeam, setViewTeam] = useState(true)
    const navigate = useNavigate();

    const teams = [
        { id: 1, name: "Team 1- Team Name" },
        { id: 3, name: "Team 3- Team Name" },
        { id: 4, name: "Team 4- Team Name" },
        { id: 5, name: "Team 5- Team Name" },
        { id: 6, name: "Team 6- Team Name" },
        { id: 7, name: "Team 7- Team Name" },
        { id: 8, name: "Team 8- Team Name" },
    ];


    return (
        <div className=' flex  items-center justify-center' style={{ minHeight: `${window.innerHeight}px` }}>

            <div className='w-[100%] flex flex-col  items-center justify-between py-10 pb-20 mx-6' style={{ minHeight: `${window.innerHeight}px` }}>

                <div className='w-[100%]'>
                    <div className='flex'>

                        {<p1 className="text-white text-[24px]" onClick={()=> navigate("/gamename/playerview")}>&lt;</p1>}
                        <p className='text-[20px] font-bold font-mono text-white text-center self-center w-full'>All Teams</p>
                    </div>


                    {teams.map((item, index) => (<div key={index} className='w-[100%] h-[64px] bg-[#6B6694CC]/80 rounded-[12px] backdrop-blur-[2px] flex items-center mt-3'>
                        <div className='flex items-center gap-3'>
                            <div className='w-[48px] h-[48px] rounded-full bg-[#EBFF7C] overflow-hidden ml-2 '>

                            </div>
                            <p className='font-bold text-white text-[14px] font-mono'>{item.name}</p>
                        </div>
                    </div>))}
                </div>



            </div>
        </div>
    )
}

export default AllTeams