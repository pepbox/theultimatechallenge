import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// Lightweight confetti without extra dependency
const Confetti = () => {
  const ref = useRef(null);
  useEffect(() => {
    const colors = ['#FFD700','#FF6B6B','#4ECDC4','#C7F464','#556270','#C44DFF'];
    const container = ref.current;
    const pieces = 120;
    for(let i=0;i<pieces;i++){
      const el = document.createElement('div');
      const size = Math.random()*8+4;
      el.style.position='absolute';
      el.style.top='-20px';
      el.style.left=(Math.random()*100)+'%';
      el.style.width=size+'px';
      el.style.height=size*0.6+'px';
      el.style.background=colors[Math.floor(Math.random()*colors.length)];
      el.style.opacity='0.9';
      el.style.transform=`rotate(${Math.random()*360}deg)`;
      el.style.borderRadius='2px';
      const fall=(Math.random()*5)+6;
      const delay=Math.random()*2;
      el.style.animation=`fall ${fall}s linear ${delay}s forwards`;
      container.appendChild(el);
      setTimeout(()=>el.remove(),(fall+delay)*1000);
    }
  },[]);
  return <div ref={ref} style={{position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden'}}/>;
};

const GameCompletion = () => {
  const { sessionId } = useParams();
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/theultimatechallenge/game-completion-data`,{
        params:{sessionId},
        withCredentials:true
      });
      if(res.data.success){
        setData(res.data);
      } else {
        setError(res.data.message || 'Failed to load');
      }
    } catch(e){
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ fetchData(); /* eslint-disable-next-line */ },[sessionId]);

  const handleLogout = async () => {
    try { await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/theultimatechallenge/logout`,{}, {withCredentials:true}); } catch(_) {}
    navigate(`/theultimatechallenge/login/${sessionId}`);
  };

  if(loading) return <div className='text-white p-6'>Loading...</div>;
  if(error) return <div className='text-red-400 p-6'>{error}</div>;
  if(!data) return null;

  const { leaderboard, yourTeam } = data;

  return (
    <div className='text-white px-4 py-8'>
      <Confetti />
      <h1 className='text-2xl font-bold text-center mb-6'>Game Completed</h1>
      <section className='mb-8'>
        <h2 className='text-xl font-semibold mb-3'>Leaderboard</h2>
        <div className='bg-[#2d2a46] rounded-lg overflow-hidden'>
          <div className='grid grid-cols-4 gap-2 text-sm font-semibold bg-[#37335a] py-2 px-3'>
            <div>Rank</div>
            <div>Team</div>
            <div className='text-center'>Score</div>
            <div className='text-right'>Answered</div>
          </div>
          {leaderboard.map(row => {
            const highlight = yourTeam && yourTeam.teamId === row.teamId;
            return (
              <div key={row.teamId} className={`grid grid-cols-4 gap-2 py-2 px-3 text-sm border-b border-[#3d3962] ${highlight? 'bg-[#443b74] font-semibold':''}`}> 
                <div>{row.rank}</div>
                <div className='truncate'>{row.teamName}</div>
                <div className='text-center'>{row.score}</div>
                <div className='text-right'>{row.answered}</div>
              </div>
            );
          })}
        </div>
      </section>
      {yourTeam && (
        <section className='mb-10'>
          <h2 className='text-xl font-semibold mb-3'>Your Team</h2>
            <div className='bg-[#2d2a46] rounded-lg p-4 space-y-4'>
              <div className='flex justify-between items-center'>
                <div>
                  <div className='text-lg font-bold'>{yourTeam.name}</div>
                  <div className='text-sm text-purple-200'>Rank #{yourTeam.rank}</div>
                </div>
                <div className='text-right'>
                  <div className='text-sm uppercase tracking-wide text-purple-300'>Score</div>
                  <div className='text-2xl font-bold'>{yourTeam.score}</div>
                </div>
              </div>
              <div className='grid grid-cols-4 gap-3 text-center text-xs'>
                <div className='bg-[#37335a] rounded p-2'>
                  <div className='font-semibold'>Answered</div>
                  <div>{yourTeam.answered}</div>
                </div>
                <div className='bg-[#37335a] rounded p-2'>
                  <div className='font-semibold'>Correct</div>
                  <div className='text-green-400'>{yourTeam.correct}</div>
                </div>
                <div className='bg-[#37335a] rounded p-2'>
                  <div className='font-semibold'>Incorrect</div>
                  <div className='text-red-400'>{yourTeam.incorrect}</div>
                </div>
                <div className='bg-[#37335a] rounded p-2'>
                  <div className='font-semibold'>Total</div>
                  <div>{yourTeam.totalQuestions}</div>
                </div>
              </div>
              <div>
                <div className='text-sm font-semibold mb-2'>Players</div>
                <ul className='space-y-1 text-sm'>
                  {yourTeam.players.map(p => (
                    <li key={p.id} className='flex items-center gap-2'>
                      <span>{p.name}</span>
                      {p.isCaption && <span className='text-[10px] bg-purple-600 px-2 py-[2px] rounded-full'>Captain</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
        </section>
      )}
      <div className='flex justify-center'>
        <button onClick={handleLogout} className='bg-red-500 hover:bg-red-600 transition-colors px-5 py-2 rounded-md text-sm font-semibold'>Logout</button>
      </div>
      <style>{`@keyframes fall { to { transform: translateY(110vh) rotate(720deg); opacity:0.9; } }`}</style>
    </div>
  );
};

export default GameCompletion;
