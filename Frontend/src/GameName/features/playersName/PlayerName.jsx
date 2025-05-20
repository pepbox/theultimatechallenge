import React from 'react'
import PlayerAvatar from "../../assets/images/teamPlayers/PlayerAvatar.jpg"
import Overlay from './Overlay';

function PlayerName() {
    const arr = new Array(10).fill(1);
    return (
        <div className='relative  flex  items-center justify-center' style={{ minHeight: `${window.innerHeight}px` }}>
            {/* <Overlay/> */}
            <div className='w-[100%] flex flex-col  items-center justify-between py-10 mx-6' style={{ minHeight: `${window.innerHeight}px` }}>
                <div className='w-[100%]'>
                    <p className='text-[20px] font-bold font-mono text-white text-center'>Team 2- Red</p>
                    <div className='w-[100%] h-[64px] bg-[#6B6694CC]/80 rounded-[12px] backdrop-blur-[2px] flex items-center mt-3'>
                        <div className='flex items-center gap-3'>
                            <div className='w-[48px] h-[48px] rounded-full bg-white overflow-hidden ml-2 '>
                                <img src={PlayerAvatar} className='object-cover w-[48px] h-[48px] ' />
                            </div>
                            <p className='font-bold text-white text-[14px] font-mono'>Player Name <span className='font-normal text-[12px]'>[you]</span></p>
                        </div>
                    </div>
                    {arr.map((_,index)=>(<div key={index} className='w-[100%] h-[64px] bg-[#6B6694CC]/80 rounded-[12px] backdrop-blur-[2px] flex items-center mt-3'>
                        <div className='flex items-center gap-3'>
                            <div className='w-[48px] h-[48px] rounded-full bg-white overflow-hidden ml-2 '>
                                <img src={PlayerAvatar} className='object-cover w-[48px] h-[48px] ' />
                            </div>
                            <p className='font-bold text-white text-[14px] font-mono'>Player Name </p>
                        </div>
                    </div>))}
                </div>


            </div>
        </div>
    )
}

export default PlayerName;