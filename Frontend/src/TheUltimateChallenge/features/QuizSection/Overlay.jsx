import React from 'react'

function Overlay() {
  return (
    <div className='absolute h-[100%] w-[100%] bg-[#192741CC]/99 z-10 flex justify-center items-center backdrop-blur-[2px]'>
        <div className='h-[80px] text-white flex flex-col justify-between'>
            <div><h1 className='text-[24px] font-bold leading-[24px]'>The Game is Paused</h1></div>
            <div><h2 className='text-[16px] leading-[20px] text-center'>Take a breath.<br/> 
            The game will resume soon.</h2></div>
        </div>
    </div>
  )
}

export default Overlay