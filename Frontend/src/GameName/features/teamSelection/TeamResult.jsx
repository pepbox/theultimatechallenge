import React from 'react'

function TeamResult() {
    return (

        <div className='relative  flex  items-center justify-center' style={{ minHeight: `${window.innerHeight}px` }}>

            <div className='flex flex-col  items-center justify-between py-10 mx-6' style={{ minHeight: `${window.innerHeight}px` }}>
                <div className='flex flex-col '>
                    <div>
                        <p className='text-xl font-bold text-white font-mono text-center'>You’re on the team!</p>
                    </div>
                    <div className='mt-8'>
                        <p className='text-[16px] text-white font-mono text-center'>You’ve been assigned to your team. Get ready to play and collaborate!</p>
                    </div>
                    <div className='w-[124px] h-[124px] rounded-full bg-[#E66262] self-center mt-8'></div>
                    <div>
                        <p className='text-[24px] font-bold text-white font-mono text-center mt-8 '>Team 2- Red</p>
                    </div>
                </div>
                <button
                    className='bg-[#1E89E0] w-full h-[40px] font-mono text-[12px] text-white rounded-[12px] mt-4'
                >View Team
                </button>
            </div>
        </div>
    )
}

export default TeamResult