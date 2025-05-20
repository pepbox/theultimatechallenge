import React from 'react'

function LiveCard() {
    return (
        <div className='w-[305px] h-[211px] bg-[#8C8C8C1A] rounded-[20px] font-sans '>
            <div className='flex w-[100%] px-4 justify-between items-center mt-3 '>
                <h1 className='font-bold'>Team Naming</h1>
                <div className='w-[8px] h-[8px] rounded-full bg-[#81DE48]'></div>
            </div>
            <div className='mt-4'>
                <div className='flex w-[100%] px-4 justify-between items-center mt-2 '>
                    <h1>Players</h1>
                    <div className=''>56</div>
                </div>
                <div className='flex w-[100%] px-4 justify-between items-center mt-2 '>
                    <h1>Teams</h1>
                    <div className=''>11</div>
                </div>
                <div className='flex w-[100%] px-4 justify-between items-center mt-2 '>
                    <h1>Phase</h1>
                    <div className=''>Team Naming</div>
                </div>
            </div>
            <div className='flex gap-2 w-[100%] px-4 mt-3'>
                <button className='border grow h-[34px] rounded-[12px]'>Copy Link</button>
                <button className='bg-black grow text-white h-[34px] rounded-[12px]'>View</button>
            </div>
        </div>
    )
}

export default LiveCard