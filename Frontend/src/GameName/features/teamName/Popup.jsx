import React from 'react';
import { useNavigate } from 'react-router-dom';

function Popup({ teamName, onClose }) {
  const navigate = useNavigate()
  return (
    <div className='absolute inset-0 bg-[#192741CC]/80 z-50 backdrop-blur-[1px] flex items-center justify-center'>
      <div className='w-full mx-6'>
        <div className='bg-[#23203E66]/90 backdrop-blur-lg rounded-lg p-6 text-center '>
          <p className='text-[12px] font-mono text-white mb-1'>Your Team Name is</p>
          
          <h1 className='text-[24px] font-bold font-mono text-white mb-2'>{teamName}</h1>
          
          <p className='text-[12px] font-mono text-white mb-6'>
            Get ready to play together and lead<br />
            your team to victory!
          </p>
          
          <button 
            onClick={onClose}
            className='w-full bg-[#1E89E0] text-[12px] text-white h-[40px] rounded-[12px] font-mono'
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default Popup;