import { useParams } from "react-router-dom"
import useTimer from "../hooks/useTimer"

const UserTimer = ({sessionId}) => {
  const {timer,isTimerVisible}=useTimer({sessionId,mode:"USER"})

  return (
    <div className={`py-2 z-10 w-full ${isTimerVisible?"block":"hidden"}`}>
      <p className="text-white text-center text-lg font-bold">
        Time Elapsed : {timer}
      </p>
    </div>
  )
}

export default UserTimer
