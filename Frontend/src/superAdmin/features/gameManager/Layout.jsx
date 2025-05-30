import React from 'react'
import Header from '../../components/Header'

import CachedRoundedIcon from '@mui/icons-material/CachedRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import GameManagerTable from './GameManagerTable';

function Layout() {
    return (
        <>
            <div className='relative font-sans max-w-[1440px] w-[100%] mx-auto mb-10'>
                <Header />
                <div className='bg-[#FCA61E]/10 h-[72px]'>
                    <div className='w-[80%] h-full mx-auto flex items-center'>

                        <div className='h-full w-full '>
                            <h1 className='h-full font-bold text-[24px] flex items-center justify-center'>
                                Games Manager
                            </h1>
                        </div>
                        <div className='flex w-[350px] items-center justify-between '>
                            <div className='flex gap-3'>
                                <Inventory2OutlinedIcon />
                                <p className=''>Show Archived Games</p>
                            </div>
                            <div className='ml-4'>
                                <CachedRoundedIcon />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='w-[80%] h-full mx-auto flex items-center'>
                    <GameManagerTable/>
                </div>

            </div>
        </>
    )
}

export default Layout