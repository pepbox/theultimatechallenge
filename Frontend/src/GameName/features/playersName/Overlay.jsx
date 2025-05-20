import React from 'react';

function Overlay() {
  return (
    <div className='absolute inset-0 bg-[#192741CC]/99 z-50  backdrop-blur-[2px]'>
      <div className='text-white flex flex-col justify-center items-center px-6 ' style={{ minHeight: `${window.innerHeight}px` }}>
        <h1 className='text-[16px] leading-[24px] font-mono text-center md:text-[20px] md:leading-[28px]'>
          Congrats on forming the teams! We shall soon allow you to select your captain.
        </h1>
      </div>
    </div>
  );
}

export default Overlay;
