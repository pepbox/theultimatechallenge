import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

function MindGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const cardData = location.state;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!cardData || !cardData.questionImageUrl || !cardData.text) {
      navigate('/quizsection');
    }
  }, [cardData, navigate]);

  if (!cardData) {
    return null;
  }

  return (
    <div className='mx-[26px] flex flex-col justify-between font-mono' style={{ height: `${window.innerHeight}px` }}>
      <div className='mb-[26px] flex flex-col h-[100%] pt-[26px]'>
        <div className='text-white w-full h-[36px] flex justify-between items-center'>
          <div className='flex gap-1.5' onClick={() => navigate("/quizsection")}>
            <ChevronLeft className='text-white text-2xl' />
            <h1 className='text-[16px] font-mono'>{cardData.category} Game</h1>
          </div>
          <button className='text-white border-[1px] rounded-[12px] w-[108px] h-[32px] border-white text-[14px]'>
            Play Later
          </button>
        </div>

        <div className='w-[100%] h-[206px] mx-auto mt-3'>
          {imageError ? (
            <div className='w-full h-full rounded-[20px] bg-gray-500 flex items-center justify-center text-white'>
              Image Failed to Load
            </div>
          ) : (
            <img 
              src={cardData.questionImageUrl}
              className='rounded-[20px] w-full h-full object-fit' 
              alt="question"
              onError={() => setImageError(true)}
            />
          )}
        </div>

        <div className='w-full mx-auto border-2 border-[#295B0899]/60 bg-[#E5FFD44D]/85 rounded-[20px] backdrop-blur-[53px] mt-4'>
          <div className='m-3 text-white'>
            <h1 className='text-[16px] flex justify-center leading-[20px] text-center font-mono'>
              {cardData.text}
            </h1>
          </div>
        </div>

        <div className='w-full mx-auto flex justify-center mt-4'>
          <div className='w-[157px] h-[20px]'>
            <h1 className='text-[20px] text-white text-center'>Points: {cardData.points}</h1>
          </div>
        </div>
      </div>
      <div className='w-full flex items-center justify-center mb-8'>
        <div className='w-full mx-auto flex gap-[12px]'>
          <input 
            className='border border-white/80 min-w-[219px] h-[40px] flex-2/3 rounded-[12px] text-white pl-3 text-[14px]' 
            placeholder='Enter Answer' 
          />
          <button className='w-[102px] h-[40px] bg-[#295B08] rounded-[12px] flex-1/3'>
            <div className='flex justify-center gap-[7px] z-10'>
              <h1 className='text-white'>Submit</h1>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MindGame;