import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import CachedRoundedIcon from '@mui/icons-material/CachedRounded';
import LiveCard from './LiveCard';
import GameHistory from './GameHistory';
import Header from '../../components/Header';
import CreateSessionPopup from './CreateSessionPopup';

function Homepage() {
  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  const [activeGame, setActiveGame] = useState('ultimate-challenge');

  // const handleCreateSession = async (formData) => {
  //   try {
  //     const response = await fetch('/api/sessions', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     if (response.ok) {
  //       // Handle success - maybe refetch live games
  //       console.log('Session created successfully');
  //       // You might want to refresh the live games list here
  //     } else {
  //       throw new Error('Failed to create session');
  //     }
  //   } catch (error) {
  //     console.error('Error creating session:', error);
  //     alert('Failed to create session. Please try again.');
  //   }
  // };

  return (
    <div className='relative font-sans max-w-[1440px] w-[100%] mx-auto mb-10'>
      <Header/>
      <div className='bg-[#FCA61E]/10 h-[72px]'>
        <div className='w-[80%] h-full mx-auto flex items-center'>
          <div className='h-full w-full '>
            <h1 className='h-full font-bold text-[24px] flex items-center justify-center'>
              Game Master Console
            </h1>
          </div>
          <div className='ml-4'>
            <CachedRoundedIcon />
          </div>
        </div>
      </div>
      
      <div className='flex w-[85%] mx-auto '>
        <div className='w-[80%]'>
          <h1 className='font-bold text-[16px] my-3'>Games</h1>
          <div className='flex gap-2'>
            <div className='w-[305px] h-[112px] bg-[#8C8C8C1A] rounded-[20px] p-4 '>
              <div><p className='font-bold text-[16px]'>The Ultimate Challenge</p></div>
              <button 
                className='w-[100%] h-[34px] rounded-[12px] border mt-4 hover:bg-gray-100'
                onClick={() => {
                  setActiveGame('ultimate-challenge');
                  setCreateSessionOpen(true);
                }}
              >
                Create New Session
              </button>
            </div>
            
            <div className='w-[305px] h-[112px] bg-[#8C8C8C1A] rounded-[20px] p-4 '>
              <div><p className='font-bold text-[16px]'>Team Naming</p></div>
              <button 
                className='w-[100%] h-[34px] rounded-[12px] border mt-4 hover:bg-gray-100'
                onClick={() => {
                  setActiveGame('team-naming');
                  setCreateSessionOpen(true);
                }}
              >
                Create New Session
              </button>
            </div>
          </div>

          <div className='font-sans font-bold my-3'>Live Games</div>
          <div className='flex gap-3 flex-wrap'>
            {[1,2,3,4,5,6].map((i) => <LiveCard key={i} />)}
          </div>
          
          <div className='font-bold font-sans text-[16px] my-3'>Game History</div>
          <GameHistory/>
        </div>
        
        <div className='w-[20%]'>
          <div className='h-[64px] bg-[#B3D7FF] rounded-[16px] my-4 flex items-center'>
            <div className='w-[100%] px-4 text-[16px] flex justify-between'>
              <p>Live Games</p>
              <p>2</p>
            </div>
          </div>
          <div className='h-[64px] bg-[#FBF3B9] rounded-[16px] my-4 flex items-center'>
            <div className='w-[100%] px-4 text-[16px] flex justify-between'>
              <p>Active Players</p>
              <p>1234</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Session Popup */}
      <CreateSessionPopup 
        isOpen={createSessionOpen}
        onClose={() => setCreateSessionOpen(false)}
        // onSubmit={handleCreateSession}
      />
    </div>
  );
}

export default Homepage;