import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../features/login/Login";
import QuizCardSection from "../features/QuizSection/Layout";
import TeamGames from "../features/Games/TeamGame";
import MindGame from "../features/Games/MindGame";
import BodyGame from "../features/Games/BodyGame";
import TaskComplete from "../features/TaskComplete/TaskComplete";
import GameCompletion from "../features/GameCompletion/GameCompletion";
import { SessionProvider } from "../components/SessionProvider";

function TheUltimateChallengeRouter() {
  return (
    <SessionProvider>
      <div>
        <Routes>
          <Route path="/login/:sessionId" element={<Login />} />
          <Route path="/quizsection/:sessionId" element={<QuizCardSection />} />
          <Route path="/teamgame/:sessionId" element={<TeamGames />} />
          <Route path="/mindgame/:sessionId" element={<MindGame />} />
          <Route path="/bodygame/:sessionId" element={<BodyGame />} />
          <Route path="/taskcomplete/:sessionId" element={<TaskComplete />} />
          <Route path="/completion/:sessionId" element={<GameCompletion />} />
        </Routes>
      </div>
    </SessionProvider>
  );
}

export default TheUltimateChallengeRouter;
