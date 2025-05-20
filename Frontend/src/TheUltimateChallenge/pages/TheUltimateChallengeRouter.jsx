import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from '../features/login/Login'
import QuizCardSection from '../features/QuizSection/Layout'
import TeamGames from '../features/Games/TeamGame'
import MindGame from '../features/Games/MindGame'
import BodyGame from '../features/Games/BodyGame'
import TaskComplete from '../features/TaskComplete/TaskComplete'

function TheUltimateChallengeRouter() {
  return (
    <div>
        <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/quizsection" element={<QuizCardSection />} />
                    <Route path="/teamgame" element={<TeamGames />} />
                    <Route path="/mindgame" element={<MindGame />} />
                    <Route path="/bodygame" element={<BodyGame />} />
                    <Route path="/taskcomplete" element={<TaskComplete />} />
                </Routes>
    </div>
  )
}

export default TheUltimateChallengeRouter