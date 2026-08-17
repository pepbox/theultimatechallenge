import { useState, useEffect } from "react";
import axios from "axios";
import { X, Trash2 } from "lucide-react";

const TeamInfoModal = ({ teamId, teamName, onClose }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [deletingPlayer, setDeletingPlayer] = useState(null);
  const [confirmStep, setConfirmStep] = useState(0);

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

  const handleRemovePlayer = async () => {
    if (!deletingPlayer) return;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/remove-player`,
        { playerId: deletingPlayer._id },
        { withCredentials: true }
      );
      if (response.data.success) {
        fetchTeamInfo();
      } else {
        alert(response.data.error || "Failed to remove player");
      }
    } catch (error) {
      console.error("Error removing player", error);
      alert(error.response?.data?.error || "Failed to remove player");
    } finally {
      setDeletingPlayer(null);
      setConfirmStep(0);
    }
  };

  useEffect(() => {
    fetchTeamInfo();
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-sans">
        <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto mx-4 shadow-xl border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-sans tracking-tight text-gray-900">
              Team: {teamName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 cursor-pointer transition-colors duration-200"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <p className="text-center py-4 text-sm text-gray-500 font-medium">Loading players...</p>
            ) : players.length === 0 ? (
              <p className="text-center py-4 text-sm text-gray-500 font-medium">No players in this team.</p>
            ) : (
              players.map((player, index) => (
                <div key={player._id || index} className="flex justify-between items-center py-3 px-1 hover:bg-gray-50/50 rounded-lg transition">
                  <span className="text-gray-800 text-sm font-semibold">
                    {index + 1}. {player.name}
                  </span>
                  <button
                    onClick={() => {
                      setDeletingPlayer(player);
                      setConfirmStep(1);
                    }}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Remove player from session"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {deletingPlayer && confirmStep === 1 && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] font-sans">
          <div className="bg-white rounded-xl p-6 w-96 max-w-[90vw] shadow-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Remove Player</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to remove player <span className="font-semibold text-gray-900">"{deletingPlayer.name}"</span> from team <span className="font-semibold text-gray-900">"{teamName}"</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeletingPlayer(null);
                  setConfirmStep(0);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setConfirmStep(2)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingPlayer && confirmStep === 2 && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] font-sans">
          <div className="bg-white rounded-xl p-6 w-96 max-w-[90vw] shadow-2xl border border-red-200">
            <h3 className="text-lg font-bold text-red-600 mb-2">Double Verification Required</h3>
            <p className="text-sm text-gray-600 mb-6 font-medium">
              WARNING: This will log the user out and completely eject them from the active session. This action is irreversible. Are you absolutely sure?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeletingPlayer(null);
                  setConfirmStep(0);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRemovePlayer}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg shadow-sm transition"
              >
                Yes, Permanently Eject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamInfoModal;
