import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetAdminState } from "../../redux/admin/adminSlice";


const useAdminAuth = () => {
    const dispatch = useDispatch();
    const navigate= useNavigate();

    const handleLogout = async () => {
    try {
      const adminToken = localStorage.getItem('admin_token');
      await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/logout`,
        {
          withCredentials: true,
          headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem('admin_token');
      dispatch(resetAdminState());
      navigate(`/admin/${sessionId}/login`);
    }
  };

  return {
    handleLogout
  }
}

export default useAdminAuth
