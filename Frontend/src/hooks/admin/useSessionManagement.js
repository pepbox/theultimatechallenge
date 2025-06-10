import axios from "axios";
import useAdminAuth from "./useAuth";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { resetAdminState } from "../../redux/admin/adminSlice";

const useSessionManagement = ({ sessionId }) => {
    const [endSessionLoading, setEndSessionLoading] = useState(false);
    const {handleLogout}=useAdminAuth();
    const dispatch = useDispatch();

    const handleEndSession = async () => {
        setEndSessionLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/end-session`,
                { sessionId },
                { withCredentials: true }
            );
            if (response.data.success) {
                handleLogout();
            } else {
                console.error("Error ending session:", response.data.error);
            }
        } catch (error) {
            console.error(
                "Error ending session:",
                error.response?.data?.error || error.message
            );
        }
        finally {
            setEndSessionLoading(false);
        }
    }
    return {
        endSessionLoading,
        handleEndSession
    }

}

export default useSessionManagement
