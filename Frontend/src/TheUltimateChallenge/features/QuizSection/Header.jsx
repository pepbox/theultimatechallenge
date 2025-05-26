import React, { useEffect, useState } from 'react'
import coin from '../../assets/images/QuizSection/TeamGame/Coin.png';
import Energy from '../../assets/images/QuizSection/TeamGame/Energy.png';

function Header({ teamData }) {
    const [task, setTask] = useState({})
    function getQuestionStatsByLevel(questions, level) {
        const levelQuestions = questions.filter(q => q.level === level);
        const availableCount = levelQuestions.filter(q => q.status !== "available").length;

        return {
            level: level,
            totalQuestions: levelQuestions.length,
            availableQuestions: availableCount
        };
    }

    useEffect(() => {
        setTask(getQuestionStatsByLevel(teamData.questions,teamData.teamInfo.currentLevel))
    }, [teamData])

    return (
        <>
            <header className='absolute top-0 left-0 w-[100%] h-[69px] bg-gradient-to-t from-[#595297]/50 to-[#23203E]/50 text-white rounded-b-[20px] font-mono backdrop-blur-[10px]'>
                <div className='absolute top-[52px] left-[24px] w-[108px] h-[32px] rounded-[20px]  flex items-center   bg-gradient-to-l from-[#595297] to-[#23203E]/70 backdrop-blur-[10px] z-10'>
                    <div className='mx-auto flex gap-2 py-1 pl-2 pr-1 items-center'>
                        <img
                            src={coin}
                            className="h-6 w-6"
                            style={{ filter: 'drop-shadow(0 0 6px rgba(242, 195, 92, 0.8))' }}
                            alt="coin"
                        />
                        <h1 className='font-mono text-sm' style={{ fontFamily: '"B612 Mono", monospace' }} >{teamData.teamInfo.teamScore}</h1>
                    </div>
                </div>
                <div className='absolute top-[52px] right-[24px] w-[108px] h-[32px] rounded-[20px] flex items-center   bg-gradient-to-l from-[#595297] to-[#23203E]/70 backdrop-blur-[10px] z-10'>
                    <div className='mx-auto flex gap-2 py-1 pl-2 pr-1 items-center'>
                        <h1 className='text-sm' style={{ fontFamily: '"B612 Mono", monospace' }} >Level-<span>{teamData.teamInfo.currentLevel}</span></h1>
                        <img
                            src={Energy}
                            className="h-6 w-6"
                            style={{ filter: 'drop-shadow(0 0 6px rgba(242, 195, 92, 0.8))' }}
                            alt="coin"
                        />
                    </div>
                </div>
                <div className='absolute top-[69px] left-1/2 -translate-x-1/2  w-[153px] h-[47px] rounded-b-[20px]  flex flex-col  bg-gradient-to-t from-[#595297]/60 to-[#23203E/70] backdrop-blur-[10px] border-b-[1px] border-white  '>
                    <h1 className='w-[55px] h-[24px] mt-1 mx-auto font-semibold text-[14px]' style={{ fontFamily: '"B612 Mono", monospace' }}>{teamData.teamInfo.name}</h1>
                    <h1 className='w-[94px] h-[24px] mt-0.5 text-xs mx-auto flex justify-center' style={{ fontFamily: '"B612 Mono", monospace' }}>{`Tasks- ${task.availableQuestions}/${task.totalQuestions}`}</h1>
                </div>
            </header></>
    )
}

export default Header
