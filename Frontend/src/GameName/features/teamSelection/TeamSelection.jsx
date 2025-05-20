import React, { useRef, useState } from 'react';
import Base0 from "../../assets/images/teamSelection/base.webp";
import UpToggle from "../../assets/images/teamSelection/UpToggle.webp";
import DownToggle from "../../assets/images/teamSelection/DownToggle.webp";
import Overlay from './Overlay';
import Spinner from './Spinner';

function TeamSelection() {
  const childRef = useRef();
  const [togglePosition, setTogglePosition] = useState('up');
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectionType, setSelectiontype] = useState('wheel')


  const handleToggle = () => {
    if (isAnimating) return;

    setIsAnimating(true);


    setTogglePosition('down');


    setTimeout(() => {
      setTogglePosition('up');


      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 500);
  };

  const handleClick = () => {
    childRef.current.spinWheel(); // Call the child function!
  };

  return (


    <div className='relative  flex  items-center justify-center' style={{ minHeight: `${window.innerHeight}px` }}>
      {/* <Overlay/> */}
      <div className='flex flex-col  items-center justify-between py-10 mx-6' style={{ minHeight: `${window.innerHeight}px` }}>
        <div>
          <div>
            <p className='text-xl font-bold text-white font-mono text-center'>Team Selection</p>
          </div>
          <div>
            <p className='text-white text-base font-mono text-center mt-3'>
              Spin the wheel to find out which team you'll join!
            </p>
          </div>
        </div>


        {selectionType === 'lottery' && <div className='relative w-64 h-64 mt-4'>
          {/* Base image */}
          <img
            className='absolute top-0 left-0 w-full'
            src={Base0}
            alt="Selection wheel base"
          />

          {/* Toggle images with animation */}
          <div className='absolute top-0 left-0 w-full'>
            {/* Up toggle - visible when toggle position is 'up' */}
            <img
              className={`absolute top-0 left-0 w-full transition-opacity duration-300 ease-in-out ${togglePosition === 'up' ? 'opacity-100' : 'opacity-0'}`}
              src={UpToggle}
              alt="Up toggle"
            />

            {/* Down toggle - visible when toggle position is 'down' */}
            <img
              className={`absolute top-0 left-0 w-full transition-opacity duration-300 ease-in-out ${togglePosition === 'down' ? 'opacity-100' : 'opacity-0'}`}
              src={DownToggle}
              alt="Down toggle"
            />
          </div>
        </div>}




        {selectionType === 'wheel' &&
          <div className=''>
            <div className='w-[300px] h-[300px] '><Spinner ref={childRef} /></div>
          </div>
        }



        {selectionType === 'lottery' && <button
          className='bg-[#1E89E0] w-full h-[40px] font-mono text-[12px] text-white rounded-[12px] mt-4'
          onClick={handleToggle}
          disabled={isAnimating}
        >
          {selectionType === "wheel" ? "Spin the Wheel" : "Pull the Lever"}
        </button>}
        {selectionType === "wheel" && <button
          className='bg-[#1E89E0] w-full h-[40px] font-mono text-[12px] text-white rounded-[12px] mt-4'
          onClick={handleClick}
        >
          {"Spin the Wheel"}
        </button>}
      </div>
    </div>



  );
}

export default TeamSelection;