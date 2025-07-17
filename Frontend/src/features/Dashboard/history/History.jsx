import React, { useState } from 'react'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Table from './Table';

function History() {
    const [settingOpen, isSettingOpen] = useState(false)

return (
    <div className='font-sans max-w-[1440px] w-full mx-auto'>
        <div className='w-[95%] md:w-[80%] mx-auto'>
            <div>
                <div className='h-[60px] flex items-center'>
                    <div className='flex items-center gap-4 md:gap-7 text-[16px] text-[#111111] flex-wrap'>
                        <h1 className='text-[20px] md:text-[24px] font-bold'>Pepbox Admin</h1>
                        <button className='text-black'>Home</button>
                    </div>
                </div>
            </div>
        </div>
        <div className='bg-[#FCA61E]/10 h-auto md:h-[72px] py-3 md:py-0'>
            <div className='w-[95%] md:w-[80%] mx-auto flex flex-col md:flex-row items-center md:justify-between gap-4 md:gap-0'>
                <div className='w-full md:w-[337px] h-auto md:h-[40px] flex flex-col md:flex-row gap-2 md:gap-[16px] text-[16px]'>
                    <button className='bg-[#111111] h-[40px] w-full md:w-[146px] rounded-[8px] text-white hover:scale-105 transform transition-transform duration-200'>Create Teams</button>
                    <button className='bg-[#111111] h-[40px] w-full md:w-[175px] rounded-[8px] text-white hover:scale-105 transform transition-transform duration-200'>Create Game Link</button>
                </div>
                <div className='w-full md:w-auto flex justify-between md:justify-center items-center'>
                    <h1 className='font-bold text-[20px] md:text-[24px]'>History</h1>
                    <div className={`relative w-[32px] h-[32px] rounded-full flex justify-center items-center ml-4 md:ml-0 ${settingOpen ? 'bg-[#1111111A]/50 ' : ""}`} onClick={() => isSettingOpen((prev)=> !prev)}>
                        <MoreVertIcon className='w-[32px] h-[32px] hover:scale-115 transform transition-transform duration-200' />
                        {settingOpen && <div className='absolute w-[176px] h-[112px] bg-white shadow-md rounded-[12px] top-full mt-2 font-sans flex flex-col gap-[8px] p-[8px] z-10'>
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
        <div className='w-[95%] md:w-[80%] mx-auto'>
            <Table/>
        </div>
    </div>
)
}

export default History