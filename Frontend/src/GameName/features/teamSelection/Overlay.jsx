import React from 'react';

function Overlay() {
  return (
    <div className='absolute inset-0 bg-[#192741CC]/99 z-50 flex justify-center items-center backdrop-blur-[2px]'>
      <div className='text-white flex flex-col justify-between text-center space-y-2'>
        <h1 className='text-[24px] font-bold leading-[24px] font-mono'>
          The Game is Paused
        </h1>
        <h2 className='text-[16px] leading-[20px] font-mono'>
          Take a breath.<br />
          The game will resume soon.
        </h2>
      </div>
    </div>
  );
}

export default Overlay;
