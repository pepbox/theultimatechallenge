import React, { useEffect, useState } from 'react';
import connectIcon from '../../assets/images/QuizSection/TeamGame/connect.png';
import groupIcon from '../../assets/images/QuizSection/TeamGame/Group.png';
import heartBallonIcon from '../../assets/images/QuizSection/TeamGame/heart-ballon.png';
import playBasketballIcon from '../../assets/images/QuizSection/TeamGame/play-basketball.png';
import brainIcon from '../../assets/images/QuizSection/TeamGame/brain.png';
import { useNavigate } from 'react-router-dom';

// Category-based color configuration
const categoryColors = {
  Collab: {
    backgroundColor: "#95400E4D",
    borderColor: "#95400E",
    headerColor: "#95400E"
  },
  Discovery: {
    backgroundColor: "#0795AE4D",
    borderColor: "#0B7D85",
    headerColor: "#0B7D85"
  },
  "Mind-bender": {
    backgroundColor: "#295B084D",
    borderColor: "#387902",
    headerColor: "#387902"
  },
  "Team Work": {
    backgroundColor: "#BA27324D",
    borderColor: "#9C2A2A",
    headerColor: "#9C2A2A"
  }
};

// Category-based icon configuration
const categoryIcons = {
  Collab: connectIcon,
  Discovery: heartBallonIcon,
  "Mind-bender": brainIcon,
  "Team Work": playBasketballIcon
};

// Difficulty-based color configuration
const difficultyColors = {
  easy: "#00C853",
  medium: "#FFEB3B",
  difficult: "#F44336"
};

const Card = ({ 
  id,
  category, 
  icon, 
  points, 
  level, 
  difficulty, 
  status, 
  answerType,
  backgroundColor, 
  borderColor, 
  headerColor,
  questionImageUrl,
  text
}) => {
  const navigate = useNavigate();

  const getStatusButton = () => {
    const navigateTo = answerType === "text" ? "/mindgame" : "/bodygame";
    
    return (
      <div 
        className='w-[71px] h-[24px] bg-[#FFFFFF] rounded-[4px] mt-1 mx-auto flex items-center' 
        onClick={() => navigate(navigateTo, { 
          state: { 
            id,
            category, 
            points, 
            level, 
            difficulty, 
            answerType,
            questionImageUrl,
            text
          }
        })}
      >
        <div className='w-[12px] h-[12px] rounded-full bg-[#00C853] ml-1'></div>
        <p className='text-black text-[12px] ml-1 '>Play &gt;</p>
      </div>
    );
  };

  return (
    <div 
      className="h-[154px] rounded-[19px] shadow border backdrop-blur-[1px]"
      style={{ 
        backgroundColor: backgroundColor, 
        borderColor: borderColor 
      }}
    >
      <div 
        className='relative h-[44px] w-full rounded-t-[19px] flex justify-center items-center'
        style={{ backgroundColor: headerColor }}
      >
        <div><h1 className='font-bold text-[#FFFFFF]/70 text-[14px] tracking-[6px] text-center'>{category}</h1></div>
        <div className='absolute bottom-[-16px] w-[32px] h-[32px] rounded-full bg-white flex justify-around items-center'> 
          <img src={icon} alt={category} className='w-6 h-6' />
        </div>
      </div>
      
      <div className='w-[138px] h-[48px] mx-auto mt-[22px] flex gap-1 flex-col'>
        <div className='flex h-[22px] items-center w-[138px] justify-between'>
          <p className='text-[12px] text-[#FFFFFF] tracking-[-10%]' style={{ wordSpacing: -3 }}>Points to gain </p>
          <h2 className='text-[14px] text-[#FFFFFF] font-bold'>{points}</h2>
        </div>
        <div className='flex h-[22px] items-center w-[138px] justify-between'>
          <p className='text-[12px] text-[#FFFFFF] tracking-[-10%]' style={{ wordSpacing: -3 }}>
            <span>{difficulty}</span> Level
          </p>
          <img src={groupIcon} className='w-[41.16px] h-[24px]' alt='difficulty meter'/>
        </div>
      </div>
      
      <div className='w-[154px]'>
        {status === "Play" && getStatusButton()}
        {status === "In Progress" && (
          <div className='w-[110px] h-[24px] bg-[#FFFFFF] rounded-[4px] mt-1 mx-auto flex items-center'>
            <div className='w-[12px] h-[12px] rounded-full bg-[#FFC107] ml-1'></div>
            <p className='text-black text-[12px] ml-1 '>In Progress</p>
          </div>
        )}
        {status === "Completed" && (
          <div className='w-[95px] h-[24px] bg-[#FFFFFF] rounded-[4px] mt-1 mx-auto flex items-center'>
            <div className='w-[12px] h-[12px] rounded-full bg-[#2196F3] ml-1'></div>
            <p className='text-black text-[12px] ml-1 '>Completed</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CardList = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/theultimatechallenge/getquestions`);
        const data = await response.json();
        
        const formattedCards = data.map(question => ({
          id: question._id,
          category: question.category,
          icon: categoryIcons[question.category],
          points: question.points,
          level: question.level,
          difficulty: question.difficulty,
          difficultyColor: difficultyColors[question.difficulty],
          status: "Play",
          answerType: question.answerType,
          backgroundColor: categoryColors[question.category].backgroundColor,
          borderColor: categoryColors[question.category].borderColor,
          headerColor: categoryColors[question.category].headerColor,
          questionImageUrl: question.questionImageUrl,
          text: question.text
        }));

        setCards(formattedCards);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='capture flex justify-center mt-[126px] h-[calc(100vh-136px)] overflow-scroll'>
      <div className="grid grid-cols-[154px_154px] gap-[19px] auto-rows-[154px] mb-2">
        {cards.map(card => (
          <Card
            key={card.id}
            id={card.id}
            category={card.category}
            icon={card.icon}
            points={card.points}
            level={card.level}
            difficulty={card.difficulty}
            status={card.status}
            answerType={card.answerType}
            backgroundColor={card.backgroundColor}
            borderColor={card.borderColor}
            headerColor={card.headerColor}
            questionImageUrl={card.questionImageUrl}
            text={card.text}
          />
        ))}
      </div>
    </div>
  );
};

export default function QuizCardSection() {
  return <CardList />;
}