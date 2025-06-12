import { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

const TeamInfoModal = ({ teamId, teamName, onClose }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchTeamInfo = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/get-teamplayers`,
        {
          params: { teamId },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setPlayers(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching team info", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchTeamInfo();
  }, []);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-sans">
      <div className="bg-white rounded-lg p-6 w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold font-sans tracking-tight">
            Team :{teamName}
          </h2>
          <button
            onClick={onClose}
            className="text-black hover:bg-gray-200 rounded-full p-2 cursor-pointer transition-colors duration-200"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        {players.map((player, index) => (
          <p key={index}>{index+1}. {player.name}</p>
        ))}
      </div>
    </div>
  );
};

export default TeamInfoModal;
