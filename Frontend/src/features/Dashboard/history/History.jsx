import React, { useState } from 'react'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Table from './Table';

function History() {
    const [settingOpen, isSettingOpen] = useState(false)

  return (
    <div className='font-sans max-w-[1440px] w-[100%] mx-auto'>
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
                    <div className='w-[337px] h-[40px] flex gap-[16px] text-[16px] '>
                        <button className='bg-[#111111] h-[40px] w-[146px] rounded-[8px] text-white hover:scale-105 transform transition-transform duration-200'>Create Teams</button>
                        <button className='bg-[#111111] h-[40px] w-[175px] rounded-[8px] text-white hover:scale-105 transform transition-transform duration-200'>Create Game Link</button>
                    </div>
                    <div>
                        <h1 className='font-bold text-[24px]'>History</h1>
                    </div>
                    <div className={`relative w-[32px] h-[32px] rounded-full flex justify-center items-center ${settingOpen ? 'bg-[#1111111A]/50 ' : ""}`} onClick={() => isSettingOpen((prev)=> !prev)}>
                        <MoreVertIcon className='w-[32px] h-[32px] hover:scale-115 transform transition-transform duration-200' />
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
            <Table/>
    </div>
  )
}

export default History