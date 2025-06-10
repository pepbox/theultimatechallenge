import React, { useEffect, useState } from "react";
import { TextField, Button } from "@mui/material";
import CachedRoundedIcon from "@mui/icons-material/CachedRounded";
import LiveCard from "./LiveCard";
import GameHistory from "./GameHistory";
import Header from "../../components/Header";
import CreateSessionPopup from "./CreateSessionPopup";
import axios from "axios";
import { styled } from "@mui/material/styles";
import useGamesData from "../../../hooks/superadmin/useGamesData";

const RotatingIcon = styled(CachedRoundedIcon)(({ rotating }) => ({
  transition: "transform 1s ease",
  transform: rotating ? "rotate(360deg)" : "rotate(0deg)",
}));

function Homepage() {
  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  const [activeGame, setActiveGame] = useState("ultimate-challenge");
  const [liveGames, setLiveGames] = useState([]);
  const [filteredLiveGames, setFilteredLiveGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { handlefetchGameHistory, gameHistory } = useGamesData();

  const fetchLiveGames = async () => {
    setLoading(true);
    setLiveGames([]);
    setFilteredLiveGames([]);
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_BASE_URL
        }/api/v1/superadmin/fetchlivegames`
      );
      if (!response.data.success) {
        throw new Error("Failed to fetch live games");
      }

      setLiveGames(response.data.data);
      setFilteredLiveGames(response.data.data);
    } catch (error) {
      console.error("Error fetching live games:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLiveGames();
    handlefetchGameHistory();
  }, []);

  useEffect(() => {
    const filteredLiveGames = liveGames.filter((game) => {
      if (searchQuery === "") return true;
      const gameName = game.companyName.toLowerCase();
      const adminName = game.admin.toLowerCase();
      return (
        gameName.includes(searchQuery.toLowerCase()) ||
        adminName.includes(searchQuery.toLowerCase())
      );
    });
    setFilteredLiveGames(filteredLiveGames);
  }, [searchQuery]);


  const handleRefresh = () => {
    setIsRefreshing(true);
    Promise.all([fetchLiveGames(),handlefetchGameHistory()]).finally(() => {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000); 
    });
  };

 

  // const handleCreateSession = async (formData) => {
  //   try {
  //     const response = await fetch('/api/sessions', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     if (response.ok) {
  //       // Handle success - maybe refetch live games
  //       console.log('Session created successfully');
  //       // You might want to refresh the live games list here
  //     } else {
  //       throw new Error('Failed to create session');
  //     }
  //   } catch (error) {
  //     console.error('Error creating session:', error);
  //     alert('Failed to create session. Please try again.');
  //   }
  // };

  return (
    <div className="relative font-sans max-w-[1440px] w-[100%] mx-auto mb-10">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="bg-[#FCA61E]/10 h-[72px]">
        <div className="w-[80%] h-full mx-auto flex items-center">
          {" "}
          <div className="h-full w-full ">
            <h1 className="h-full font-bold text-[24px] flex items-center justify-center">
              Game Master Console
            </h1>
          </div>
          <div className="ml-4 cursor-pointer" onClick={handleRefresh}>
            <RotatingIcon rotating={isRefreshing ? 1 : 0} />
          </div>
        </div>
      </div>

      <div className="flex w-[85%] mx-auto ">
        <div className="w-[80%]">
          <h1 className="font-bold text-[16px] my-3">Games</h1>
          <div className="flex gap-2">
            <div className="w-[305px] h-[112px] bg-[#8C8C8C1A] rounded-[20px] p-4 ">
              <div>
                <p className="font-bold text-[16px]">The Ultimate Challenge</p>
              </div>
              <button
                className="w-[100%] h-[34px] cursor-pointer rounded-[12px] border mt-4 hover:bg-gray-100"
                onClick={() => {
                  setActiveGame("ultimate-challenge");
                  setCreateSessionOpen(true);
                }}
              >
                Create New Session
              </button>
            </div>

            {/* <div className='w-[305px] h-[112px] bg-[#8C8C8C1A] rounded-[20px] p-4 '>
              <div><p className='font-bold text-[16px]'>Team Naming</p></div>
              <button 
                className='w-[100%] h-[34px] rounded-[12px] border mt-4 hover:bg-gray-100'
                onClick={() => {
                  setActiveGame('team-naming');
                  setCreateSessionOpen(true);
                }}
              >
                Create New Session
              </button>
            </div> */}
          </div>

          <div className="font-sans font-bold my-3">Live Games</div>
          <div className="flex gap-3 flex-wrap">
            {loading ? (
              <p>Loading...</p>
            ) : filteredLiveGames.length ? (
              filteredLiveGames.map((game, index) => (
                <LiveCard key={index} game={game} />
              ))
            ) : (
              <div>No Games Found</div>
            )}
          </div>

          <div className='font-bold font-sans text-[16px] mt-12 px-4'>Game History</div>
          <GameHistory data={gameHistory}/>
        </div>

        <div className="w-[20%]">
          <div className="h-[64px] bg-[#B3D7FF] rounded-[16px] my-4 flex items-center">
            <div className="w-[100%] px-4 text-[16px] flex justify-between">
              <p>Live Games</p>
              <p>{liveGames.length}</p>
            </div>
          </div>
          <div className="h-[64px] bg-[#FBF3B9] rounded-[16px] my-4 flex items-center">
            <div className="w-[100%] px-4 text-[16px] flex justify-between">
              <p>Active Players</p>
              <p>
                {liveGames.length
                  ? liveGames.reduce((a, b) => a + b.playerCount, 0)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Session Popup */}
      <CreateSessionPopup
        isOpen={createSessionOpen}
        onClose={() => setCreateSessionOpen(false)}
        // onSubmit={handleCreateSession}
      />
    </div>
  );
}

export default Homepage;
