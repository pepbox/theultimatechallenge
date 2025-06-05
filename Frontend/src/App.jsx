import { Routes, Route } from 'react-router-dom';
import './App.css';
import TheUltimateChallengeRoutes from "./pages/users/TheUltimateChallengeRoutes.jsx"
import AdminRoutes from "./pages/admin/AdminRoutes.jsx"

import GameNameRoutes from "./GameName/pages/GameNameRoutes.jsx"
import SuperAdminRoutes from "./superAdmin/pages/SuperAdminRoutes.jsx"

 


function App() {


  return (
    <>
    <Routes>
      <Route path='/theultimatechallenge/*' element={<TheUltimateChallengeRoutes/>}/>
      <Route path='/admin/*' element={<AdminRoutes/>}/>
      <Route path='/gamename/*' element={<GameNameRoutes/>}/>
      <Route path='/superadmin/*' element={<SuperAdminRoutes/>}/>
    </Routes>
    </>
  )
}

export default App;
