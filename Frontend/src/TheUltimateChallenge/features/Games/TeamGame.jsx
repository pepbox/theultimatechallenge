import React, { useRef, useState } from 'react';
import { ChevronLeft, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function TeamGames() {
    const navigate=useNavigate()
    const fileInputRef = useRef(null);
    const [fileUploaded, setFileUploaded] = useState(false);

    const handleClick = () => {
        if (fileUploaded) {
            navigate("/theultimatechallenge/mindgame")
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

    
    return (
        <div className='mx-[26px] flex flex-col justify-between font-mono' style={{ height: `${window.innerHeight}px` }}>
        <div className='  mb-[26px] flex flex-col h-[100%] pt-[26px]'>
            <div className='text-white w-full h-[36px]  flex justify-between items-center'>
                <div className='flex gap-1.5' onClick={()=> navigate("/quizsection")}>
                    <ChevronLeft className='text-white text-2xl' />
                    <h1 className='text-[16px]' style={{ fontFamily: '"B612 Mono", monospace' }}>Team Game</h1>
                </div>
                <button className='text-white border-[1px] rounded-[12px] w-[108px] h-[32px] border-white text-[14px]'>
                    Play Later
                </button>
            </div>
            
            <div className='w-full mx-auto border-2 border-[#D4871199]/60 bg-[#FFD89B4D]/85 rounded-[20px] backdrop-blur-[53px] mt-4'>
                <div className=' m-3 text-white '>
                    <h1 className='text-[16px] flex justify-center leading-[20px] text-center font-mono font-normal' 
                        >
                        Get your team to take a picture with the tallest person in this room. Person should be from another team. They should hold a tag which says "Tallest in the room".
                    </h1>
                </div>
            </div>
            
            <div className='w-full mx-auto flex justify-center mt-4'>
                <div className='w-[157px] h-[20px]'>
                    <h1 className='text-[20px] text-white text-center'>Points : 300</h1>
                </div>
            </div>
            
           
        </div>
        <div className=' w-full flex items-center justify-center mb-8'>
                <button 
                    className='w-full h-[40px] bg-[#95400E] rounded-[12px]'
                    onClick={handleClick}
                >
                    <div className='flex justify-center gap-[7px]'>
                        <Camera className='text-white' />
                        <h1 className='text-white'>{fileUploaded ? 'Submit' : 'Capture'}</h1>
                    </div>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                />
            </div>
        </div>
    );
}

export default TeamGames;