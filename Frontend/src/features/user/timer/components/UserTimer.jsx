import { useParams } from "react-router-dom"
import useTimer from "../hooks/useTimer"

const UserTimer = ({sessionId}) => {
  const {timer,isTimerVisible}=useTimer({sessionId,mode:"USER"})

  return (
    <div className={`fixed bottom-[calc(env(safe-area-inset-bottom)+20px)] left-1/2 -translate-x-1/2 z-50 w-auto min-w-[220px] max-w-[90%] ${isTimerVisible ? "block" : "hidden"}`}>
      <div className="bg-[#2a2553]/90 backdrop-blur-[16px] border border-white/20 rounded-full py-2.5 px-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex justify-center items-center whitespace-nowrap">
        <p className="text-white text-center text-sm sm:text-base font-bold font-mono tracking-wider flex items-center gap-2">
          <span className="text-orange-400 animate-pulse">⏳</span> Time Elapsed : <span className="text-orange-300 font-extrabold">{timer}</span>
        </p>
      </div>
    </div>
  )
}

export default UserTimer
