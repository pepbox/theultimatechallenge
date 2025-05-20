import React, { useState } from 'react'
import PlayerAvatar from "../../assets/images/teamPlayers/PlayerAvatar.jpg"
import Crown from "../../assets/images/playerNames/Crown.png"


function PlayerView() {
    const arr = new Array(10).fill(1);
    const [viewTeam,setViewTeam]= useState(true)
    return (
        <div className=' flex  items-center justify-center' style={{ minHeight: `${window.innerHeight}px` }}>
            
            <div className='w-[100%] flex flex-col  items-center justify-between py-10 pb-20 mx-6' style={{ minHeight: `${window.innerHeight}px` }}>

                <div className='w-[100%]'>
                    <div className='flex'>

                    {viewTeam && <p1 className="text-white text-[24px]">&lt;</p1>}
                    <p className='text-[20px] font-bold font-mono text-white text-center self-center w-full'>Team 2- Team name</p>
                    </div>
                    <div className='w-[100%] h-[64px] bg-[#6B6694CC]/80 rounded-[12px] backdrop-blur-[2px] flex items-center justify-between mt-3'>
                        <div className='flex items-center gap-3'>
                            <div className='w-[48px] h-[48px] rounded-full bg-white overflow-hidden ml-2 '>
                                <img src={PlayerAvatar} className='object-cover w-[48px] h-[48px] ' />
                            </div>
                            <p className='font-bold text-white text-[14px] font-mono'>Player Name <span className='font-normal text-[12px]'>[C]</span></p>
                        </div>
                        <div>
                            <img src={Crown} className='mr-3' />
                        </div>
                    </div>
                    <div className='w-[100%] h-[64px] bg-[#6B6694CC]/80 rounded-[12px] backdrop-blur-[2px] flex items-center mt-3'>
                        <div className='flex items-center gap-3'>
                            <div className='w-[48px] h-[48px] rounded-full bg-white overflow-hidden ml-2 '>
                                <img src={PlayerAvatar} className='object-cover w-[48px] h-[48px] ' />
                            </div>
                            <p className='font-bold text-white text-[14px] font-mono'>Player Name <span className='font-normal text-[12px]'>[you]</span></p>
                        </div>
                    </div>
                    {arr.map((_, index) => (<div key={index} className='w-[100%] h-[64px] bg-[#6B6694CC]/80 rounded-[12px] backdrop-blur-[2px] flex items-center mt-3'>
                        <div className='flex items-center gap-3'>
                            <div className='w-[48px] h-[48px] rounded-full bg-white overflow-hidden ml-2 '>
                                <img src={PlayerAvatar} className='object-cover w-[48px] h-[48px] ' />
                            </div>
                            <p className='font-bold text-white text-[14px] font-mono'>Player Name </p>
                        </div>
                    </div>))}
                </div>
               { viewTeam && <button className='fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[100%] max-w-sm  bg-white text-black h-[40px] rounded-[12px] text-center font-mono'>
                    View all Teams
                </button>}


            </div>
        </div>
    )
}

export default PlayerView