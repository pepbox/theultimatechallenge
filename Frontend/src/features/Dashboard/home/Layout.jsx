
import { FormControlLabel, Switch } from '@mui/material'
import React, { useState } from 'react'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Table from './Table';
import LeaderBoard from './LeaderBoard';
import { GameLevelChangePopup, GameStatusChangePopup, GameTransactionChangePopup } from './Popups.jsx'
import { UpdatePlayingStatusPopup } from './GameStausPopup.jsx';


function Layout() {
    const [gameLevel, setGameLevel] = useState(1)
    const [timerIsOpen, setIsTimerOpen] = useState(false);
    const [isLevelPopupOpen, setIsLevelPopupOpen] = useState(false);
    const [isStatusPopupOpen, setIsStatusPopupOpen] = useState(false);
    const [isTransactionPopupOpen, setIsTransactionPopupOpen] = useState(false);
    const [isConfirmStatusPopup, setIsConfirmStatusPopup] = useState(false);
    const [settingOpen, isSettingOpen] = useState(false)


    const handleLevelConfirm = () => {
        console.log('Change confirmed');
        setIsLevelPopupOpen(false);
    };

    const handleLevelClose = () => {
        console.log('Change cancelled');
        setIsLevelPopupOpen(false);
    };
    const handleStatusConfirm = () => {
        console.log('Change confirmed');
        setIsStatusPopupOpen(false);
        setIsConfirmStatusPopup(true)
    };

    const handleStatusClose = () => {
        console.log('Change cancelled');
        setIsStatusPopupOpen(false);
    };
    const handleTransactionConfirm = () => {
        console.log('Change confirmed');
        setIsTransactionPopupOpen(false);
    };

    const handleTransactionClose = () => {
        console.log('Change cancelled');
        setIsTransactionPopupOpen(false);
    };
    const handleConfirmStatusClose = () => {
        console.log('Change confirmed');
        setIsConfirmStatusPopup(false);
    };

    const handleStatusConfirmPopup = () => {
        console.log('Change cancelled');
        setIsConfirmStatusPopup(false);
    };



    return (
        <div className='relative font-sans max-w-[1440px] w-[100%] mx-auto mb-10'>

            <GameLevelChangePopup
                isOpen={isLevelPopupOpen}
                onClose={handleLevelClose}
                onConfirm={handleLevelConfirm}
            />
            <GameTransactionChangePopup
                isOpen={isTransactionPopupOpen}
                onClose={handleTransactionClose}
                onConfirm={handleTransactionConfirm}
            />
            <GameStatusChangePopup
                isOpen={isConfirmStatusPopup}
                onClose={handleConfirmStatusClose}
                onConfirm={handleStatusConfirmPopup}
            />
            <UpdatePlayingStatusPopup
                isOpen={isStatusPopupOpen}
                onClose={handleStatusClose}
                onSave={handleStatusConfirm}
            />
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
                        <h1 className='font-bold text-[24px]'>Manage PepBox 3-4-25 Teams</h1>
                    </div>
                    <div className={`relative w-[32px] h-[32px] rounded-full flex justify-center items-center ${settingOpen ? 'bg-[#1111111A]/50 ' : ""}`} onClick={() => isSettingOpen((prev) => !prev)}>
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
            <div className='w-[80%] h-[72px] mx-auto flex items-center justify-between'>
                <div className='w-[223px] h-[40px] flex justify-between '>
                    <h2 className='text-[16px] text-center self-center'>Current Level</h2>
                    <div className='w-[102px] h-[40px] rounded-[32px] bg-[#FCA61E1A] flex items-center justify-between border border-[#FCA61E1A] '>
                        <div className='ml-[5px] w-[30px] h-[30px] bg-orange-200 rounded-full flex justify-center items-center hover:scale-105' onClick={() => setIsLevelPopupOpen(true)}><RemoveIcon /></div>
                        <div>{gameLevel}</div>
                        <div className='mr-[5px] w-[30px] h-[30px] bg-orange-300 rounded-full flex justify-center items-center hover:scale-105' onClick={() => setIsLevelPopupOpen(true)}><AddIcon /></div>
                    </div>
                </div>
                <div className='flex gap-[16px]'>
                    <FormControlLabel control={<Switch onChange={() => setIsStatusPopupOpen(true)} checked={isStatusPopupOpen} />} label="Game Status" labelPlacement='start' />
                    <FormControlLabel control={<Switch onChange={() => setIsTransactionPopupOpen(true)} checked={isTransactionPopupOpen} />} label="Enable Transactions" labelPlacement='start' />
                </div>
                <div>
                    <FormControlLabel control={<Switch checked={timerIsOpen} onChange={() => setIsTimerOpen((pre) => !pre)} />} label="Timer" labelPlacement='start' />
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