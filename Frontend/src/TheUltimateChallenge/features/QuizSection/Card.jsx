import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSocket } from "../../../services/sockets/theUltimateChallenge";
import connectIcon from "../../assets/images/QuizSection/TeamGame/connect.png";
import EasyMeter from "../../assets/images/QuizSection/TeamGame/EasyMeter.png";
import MediumMeter from "../../assets/images/QuizSection/TeamGame/MediumMeter.png";
import HardMeter from "../../assets/images/QuizSection/TeamGame/HardMeter.png";
import heartBallonIcon from "../../assets/images/QuizSection/TeamGame/heart-ballon.png";
import playBasketballIcon from "../../assets/images/QuizSection/TeamGame/play-basketball.png";
import brainIcon from "../../assets/images/QuizSection/TeamGame/brain.png";

// Category-based configurations
const categoryConfig = {
  Collab: {
    backgroundColor: "#95400E4D",
    borderColor: "#95400E",
    headerColor: "#95400E",
    icon: connectIcon,
  },
  Discovery: {
    backgroundColor: "#0795AE4D",
    borderColor: "#0B7D85",
    headerColor: "#0B7D85",
    icon: heartBallonIcon,
  },
  "Mind-bender": {
    backgroundColor: "#295B084D",
    borderColor: "#387902",
    headerColor: "#387902",
    icon: brainIcon,
  },
  "Team Work": {
    backgroundColor: "#BA27324D",
    borderColor: "#9C2A2A",
    headerColor: "#9C2A2A",
    icon: playBasketballIcon,
  },
};

// Difficulty meter configurations
const difficultyMeterConfig = {
  easy: EasyMeter,
  medium: MediumMeter,
  hard: HardMeter,
};

// Status configurations
const statusConfig = {
  available: {
    color: "#00C853",
    text: "Play >",
    className: "w-[71px]",
  },
  attending: {
    color: "#F43844",
    text: "In Progress",
    className: "w-[110px]",
  },
  done: {
    color: "#2196F3",
    text: "Completed",
    className: "w-[95px]",
  },
};

const Card = ({
  id,
  category,
  points,
  level,
  difficulty,
  status,
  answerType,
  questionImageUrl,
  text,
  currentPlayer,
  pointsEarned,
  isPaused,
}) => {
  const navigate = useNavigate();
  const socket = getSocket();
  const { sessionId } = useParams();

  const config = categoryConfig[category] || categoryConfig["Mind-bender"];

  // Get the appropriate difficulty meter image
  const difficultyMeterImage =
    difficultyMeterConfig[difficulty?.toLowerCase()] ||
    difficultyMeterConfig.easy;

  const handleQuestionStart = () => {
    // Emit socket event to update question status
    socket.emit("start-question", { questionId: id });

    // Navigate to appropriate game page
    const gameType = answerType === "text" ? "mindgame" : "bodygame";
    navigate(`/theultimatechallenge/${gameType}/${sessionId}`, {
      state: {
        id,
        category,
        points,
        level,
        difficulty,
        answerType,
        questionImageUrl,
        text,
      },
    });
  };

  const StatusButton = () => {
    const {
      color,
      text: btnText,
      className,
    } = statusConfig[status] || statusConfig.available;

    return (
      <div
        className={`${className} h-[24px] bg-white rounded-[4px] mt-1 mx-auto flex items-center ${
          status === "available" ? "cursor-pointer" : ""
        }`}
      >
        <div
          className="w-[12px] h-[12px] rounded-full ml-1"
          style={{ backgroundColor: color }}
        />
        <p className="text-black text-[12px] ml-1">{btnText}</p>
      </div>
    );
  };

  return (
    <div
      className="h-[154px] rounded-[19px] shadow border backdrop-blur-[1px]"
      onClick={status === "available" ? handleQuestionStart : undefined}
      style={{
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor,
      }}
    >
      <div
        className="relative h-[44px] w-full rounded-t-[19px] flex justify-center items-center"
        style={{ backgroundColor: config.headerColor }}
      >
        <h1 className="font-bold text-[#FFFFFF]/70 text-[14px] tracking-[6px] text-center">
          {category}
        </h1>
        <div className="absolute bottom-[-16px] w-[32px] h-[32px] rounded-full bg-white flex justify-around items-center">
          <img src={config.icon} alt={category} className="w-6 h-6" />
        </div>
      </div>

      <div className="w-[138px] h-[48px] mx-auto mt-[22px] flex gap-1 flex-col">
        <div className="flex h-[22px] items-center w-[138px] justify-between">
          <p
            className="text-[12px] text-white tracking-[-10%]"
            style={{ wordSpacing: -3 }}
          >
            Points to gain
          </p>
          <h2 className="text-[14px] text-white font-bold">
            {pointsEarned > 0 ? pointsEarned : points}
          </h2>
        </div>
        <div className="flex h-[22px] items-center w-[138px] justify-between">
          <p
            className="text-[12px] text-white tracking-[-10%] capitalize"
            style={{ wordSpacing: -3 }}
          >
            {difficulty} Level
          </p>
          <img
            src={difficultyMeterImage}
            className="w-[41.16px] h-[24px]"
            alt="difficulty meter"
          />
        </div>
      </div>

      <div className="w-[154px]">
        <StatusButton />
      </div>
    </div>
  );
};

const CardList = ({ teamData }) => {
  if (!teamData?.questions?.length) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-136px)] text-white">
        No questions available
      </div>
    );
  }

  const currentLevelQuestions = teamData.questions.filter(
    (q) => q.level === teamData.teamInfo.currentLevel
  );

  return (
    <div
      className={`capture flex justify-center mt-[126px] overflow-scroll`}
      style={{ height: `${window.innerHeight - 136}px` }}
    >
      <div className="grid grid-cols-[154px_154px] gap-[19px] auto-rows-[154px] mb-2">
        {currentLevelQuestions.map((question) => (
          <Card key={question.id} {...question} />
        ))}
      </div>
    </div>
  );
};

export default function QuizCardSection({ teamData }) {
  return <CardList teamData={teamData} />;
}
