import React from 'react'
import Upload from "../../assets/images/login/upload.png"

function Login() {
  return (
    <div className='relative flex justify-center items-center h-[100%] w-[100%]   ' style={{ minHeight: `${window.innerHeight}px` }}>


      <div className='relative w-[100%] h-[348px] mx-[24px] bg-[#111111]/40 rounded-[24px] flex justify-center items-center  shadow-[0_0_15px_1px_white]/30'>
       <h1 className='absolute -top-1/4  text-[32px] font-bold font-mono text-white'>Game Name</h1>
        <div className='w-[247px] h-[301px] flex flex-col justify-between '>
          <div className=' flex justify-center flex-col items-center gap-2'>
            <div className='w-[78px] h-[78px] bg-[#1E89E0] rounded-full mx-auto flex justify-center items-center'>
              <img src={Upload} width={36} height={36} alt='avatar upload' />
            </div>
            <h1 className='font-bold text-[12px] text-white tracking-widest'>Upload your Selfie</h1>
          </div>
          <div className='flex flex-col gap-[15px]'>
            <input placeholder='Enter your First Name' className='h-[40px] w-[100%] bg-[#D8FEFF]/90 rounded-[4px] pl-3 font-mono text-[12px]' />
            <input placeholder='Enter your Last Name ' className='h-[40px] w-[100%] bg-[#D8FEFF]/90 rounded-[4px] pl-3 font-mono text-[12px]' />

            <button className='w-[100%] h-[40px] rounded-[12px] bg-[#1E89E0] text-white font-mono text-[12px] mt-3'>Start</button>
          </div>
        </div>


      </div>
    </div>
  )
}

export default Login;