import axios from 'axios';
import { useState } from 'react';

const useGamesData = () => {

    const [gameHistory, setGameHistory] = useState([]);

    const handlefetchGameHistory = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/superadmin/fetchgamehistory`
            );
            if (!response.data.success) {
                throw new Error("Failed to fetch game history");
            }
            setGameHistory(response.data.data);
            return response.data.data;

        } catch (error) {
            console.error("Error fetching game history:", error);
            return [];
        }
    }
    return { handlefetchGameHistory,gameHistory }
}

export default useGamesData
