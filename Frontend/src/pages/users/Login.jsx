import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    
    
    
    const navigate = useNavigate();


   

    return (
        <div className=" relative flex justify-center items-center font-mono" style={{ height: `${window.innerHeight}px` }}>
            <div className="h-[378px] w-[100%]  bg-[#A9A1EB33] rounded-[20px] flex items-center justify-center mx-[24px]" >
                <div className="w-[100%] mx-[48px] h-[284px] text-[20ox] font-bold text-center flex flex-col gap-[40px]  ">
                    <div className='w-[157px] h-[48px] mx-auto '>
                        <h1 className='text-[20px] text-white leading-[120%] '>The Ultimate
                            Challenge</h1>
                    </div>
                    <div className='space-y-[20px]'>
                    <div className='flex flex-col gap-[8px]'>
                        <input className='bg-white w-full h-[40px] rounded-[4px] text-[12px] pl-4 text-[#111111B2]/85 outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter your First Name' />
                        <input className='bg-white w-full h-[40px] rounded-[4px] text-[12px] pl-4 text-[#111111B2]/85 outline-none focus:ring-2 focus:ring-blue-500 ' placeholder='Enter your Last Name' />
                        <div className="relative w-full">
                            
                            <svg
                                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 text-gray-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>

                           
                            <select
                                className="appearance-none bg-white w-full h-[40px] rounded-[4px] pl-4  text-[12px] text-[#111111B2]/50 outline-none focus:ring-2 focus:ring-blue-500"
                                defaultValue=""
                            >
                                <option value="" disabled>Team Number</option>
                                <option value="1" className='text-[#111111B2]/90'>Team 1</option>
                                <option value="2" className='text-[#111111B2]/90'>Team 2</option>
                                <option value="3" className='text-[#111111B2]/90'>Team 3</option>
                                <option value="4" className='text-[#111111B2]/90'>Team 4</option>
                            </select>
                        </div>

                    </div>
                    <button className='bg-[#A34332] w-full h-[40px] text-white font-mono rounded-[12px]' onClick={()=> navigate("/quizsection")}>Log in</button></div>
                </div>
            </div>
        </div>
    );
}

export default Login;
