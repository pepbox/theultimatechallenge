import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, Camera } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

function BodyGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const cardData = location.state;
  const fileInputRef = useRef(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!cardData || !cardData.questionImageUrl || !cardData.text) {
      navigate('/quizsection');
    }
  }, [cardData, navigate]);

  const handleClick = () => {
    if (fileUploaded) {
      navigate("/taskcomplete");
    } else {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileUploaded(true);
    }
  };

  if (!cardData) {
    return null;
  }

  return (
    <div className='mx-[26px] flex flex-col justify-between font-mono' style={{ height: `${window.innerHeight}px` }}>
      <div className='mb-[26px] flex flex-col h-[100%] pt-[26px]'>
        <div className='text-white w-full h-[36px] flex justify-between items-center'>
          <div className='flex gap-1.5'>
            <ChevronLeft className='text-white text-2xl' onClick={() => navigate("/quizsection")} />
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

        <div className='w-full mx-auto border-2 border-[#BA273299]/60 bg-[#FFA8AE4D]/85 rounded-[20px] backdrop-blur-[53px] mt-4'>
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
      <div className='w-full flex items-center justify-center'>
        <button className='w-full h-[40px] bg-[#BA2732] rounded-[12px] mb-8' onClick={handleClick}>
          <div className='flex justify-center gap-[7px] z-10'>
            <Camera className='text-white' />
            <h1 className='text-white'>{fileUploaded ? 'Submit' : 'Capture'}</h1>
          </div>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default BodyGame;