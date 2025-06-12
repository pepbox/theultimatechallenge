import axios from "axios";
import useAdminAuth from "./useAuth";
import { useState } from "react";

const useSessionManagement = ({ sessionId }) => {
    const [endSessionLoading, setEndSessionLoading] = useState(false);
    const {handleLogout}=useAdminAuth();

    const handleEndSession = async ({ adminPassword }) => {
    setEndSessionLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/end-session`,
        { sessionId, adminPassword },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.error || 'Unknown error occurred' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Network error occurred';
      return { success: false, error: errorMessage };
    } finally {
      setEndSessionLoading(false);
    }
  };
    return {
        endSessionLoading,
        handleEndSession
    }

}

export default useSessionManagement
