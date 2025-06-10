import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetAdminState } from "../../redux/admin/adminSlice";


const useAdminAuth = () => {
    const dispatch = useDispatch();
    const navigate= useNavigate();

    const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/logout`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        dispatch(resetAdminState());
        navigate(`/admin/${sessionId}/login`);
      }
    } catch (error) {
      console.error("Logout error:", error);
      navigate(`/admin/${sessionId}/login`);
    }
  };

  return {
    handleLogout
  }
}

export default useAdminAuth
