import React from 'react'
import Caption from "../../assets/images/captionName/Caption.jpg"
import Star from "../../assets/images/captionName/Star.png"

function CaptionName() {
    return (
        <div className=' flex  items-center justify-center' style={{ minHeight: `${window.innerHeight}px` }}>
            <div className='w-[100%] flex flex-col  items-center justify-between py-10  mx-6' style={{ minHeight: `${window.innerHeight}px` }}>
                <div>
                    <div className='w-[283px] h-[58px]'>
                        <h1 className='font-bold text-[24px] text-white font-mono text-center'>Captain of the team is</h1>
                    </div>
                </div>
                <div className='relative flex flex-col w-[100%] gap-6'>
                    <div className='relative w-[112px] h-[112px] rounded-full bg-white overflow-hidden self-center'>
                        <img src={Caption} className='w-[112px] h-[112px] object-cover' />

                    </div>
                    <img src={Star} className='absolute top-1/2 left-1/2w-[92px] h-[52px] self-center' />
                    <p className='text-center font-bold text-[20px] font-mono text-white'>Aadhvita Sharma</p>
                </div>
                <button className='bg-[#1E89E0] text-white w-[100%] h-[40px] rounded-[12px]'>
                    Continue
                </button>
            </div>
        </div>
    )
}

export default CaptionName