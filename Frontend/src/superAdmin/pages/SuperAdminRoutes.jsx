import React from 'react'
import Background from "../assets/images/background/Background.jpg"

import { Routes, Route } from 'react-router-dom';
import Home from './home';
import GameManager from './GameManager';
import QuestionForm from './QuestionForm';
import { useEffect } from 'react';


function SuperAdminRoutes() {


  useEffect(()=>{
       
  },[])
  return (
    
        <div >
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/gamemanager" element={<GameManager />} />
                <Route path="/questionform" element={<QuestionForm />} />
                
            </Routes>
        </div>
    
    
  )
}

export default SuperAdminRoutes