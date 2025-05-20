import React from 'react';

const Popup = ({ playerName, onConfirm, onCancel }) => {
    return (
        <div className='absolute inset-0 bg-[#192741CC] z-50 backdrop-blur-[2px]'>
            <div className='text-white flex flex-col justify-center items-center px-6' style={{ minHeight: `${window.innerHeight}px` }}>
                <div className='w-[328px] h-[178px]'>
                    <h1 className='text-[16px] leading-[24px] font-mono text-center'>
                        Are You Sure?
                    </h1>
                    <h2 className='text-[14px] leading-[24px] font-mono text-center mt-3'>
                        You are about to vote for <span className='font-bold'>{playerName}</span> as your team captain.
                    </h2>

                    <div className='flex w-[100%] justify-between mt-3'>
                        <button 
                            className='w-[48%] h-[40px] bg-[#1E89E0] text-white rounded-[12px]'
                            onClick={onConfirm}
                        >
                            Confirm
                        </button>
                        <button 
                            className='w-[48%] h-[40px] bg-white text-black rounded-[12px]'
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Popup;