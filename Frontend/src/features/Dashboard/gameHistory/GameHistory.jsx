
import { FormControlLabel, Switch } from '@mui/material'
import React, { useState } from 'react'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Table from './Table';
import LeaderBoard from '../home/LeaderBoard';


function Layout() {
    const [timerIsOpen, setIsTimerOpen] = useState(false);
     const [settingOpen, isSettingOpen] = useState(false)
    return (
        <div className='font-sans max-w-[1440px] w-[100%] mx-auto mb-10'>
            <div className='w-[80%] mx-auto  '>
                <div>
                    <div className='h-[60px] flex items-center'>
                        <div className='flex items-center  gap-7 text-[16px] text-[#111111]'>
                            <h1 className='text-[24px] font-bold'>Pepbox Admin</h1>
                            <button className='text-black'>Home</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='bg-[#FCA61E]/10 h-[72px]'>
                <div className='w-[80%] h-[100%] mx-auto flex items-center justify-between'>
                    <div className="w-[100%] h-full mx-auto flex ">

                        <div className="font-bold text-[24px] grow"><div className='w-[100%] h-[100%] flex justify-center items-center'>Game History</div></div>

                        <div className={`relative w-[32px] h-[32px] rounded-full flex justify-center items-center self-center ${settingOpen ? 'bg-[#1111111A]/50 ' : ""}`} onClick={() => isSettingOpen((prev)=> !prev)}>
                        <MoreVertIcon className='w-[32px] h-[32px] hover:scale-115 transform transition-transform duration-200 ' />
                        {settingOpen && <div className='absolute w-[176px] h-[112px] bg-white shadow-md rounded-[12px] top-full mt-2 font-sans flex flex-col gap-[8px] p-[8px] z-10
                        '>
                            <div className='w-[160px] h-[40px] font-medium flex justify-between hover:bg-slate-100 rounded-md px-2'>
                                <div className='self-center'>History</div>
                                <div className='self-center'>&gt;</div>
                            </div>
                            <div className='w-[160px] h-[40px] font-medium flex items-center px-2 hover:bg-slate-100 rounded-md'>
                                Export
                            </div>
                        </div>}
                    </div>
                    </div>
                   
                </div>
            </div>

            <div className=' w-[80%] h-[19px] mx-auto my-4'>
                <div className='flex w-[70%] gap-[40px]'>
                <p className='text-[16px]'>Admin: [Admin Name]</p>
                <p className='text-[16px]'>Game: [Game Name]</p>
                <p className='text-[16px]'>Status: Completed</p>
                <p className='text-[16px]'>Created on: 14 Apr 2025</p>
                </div>
            </div>
            
            <div className='w-[80%] mx-auto flex '>
                <Table />
                <LeaderBoard timerIsOpen={timerIsOpen} />
            </div>

        </div>
    )
}

export default Layout