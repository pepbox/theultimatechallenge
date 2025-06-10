import { useState } from "react";
import { Close } from "@mui/icons-material";
import axios from "axios";

const EditSessionPopup = ({
  sessionId,
  sessionData,
  onClose,
  handleRefresh,
}) => {
  const [formData, setFormData] = useState({
    companyName: sessionData?.sessionName || "",
    admin: sessionData?.adminName || "",
    password: sessionData?.adminPassword || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_BASE_URL
        }/api/v1/superadmin/updatesession`,
        { ...formData, sessionId },
        {
          withCredentials: true,
        }
      );
      const data = response.data;
      if (data.success) {
        handleRefresh();
        onClose();
      } else {
        console.error("Failed to update session:", data.message);
      }
    } catch (error) {
      console.error("Error updating session:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-[80%] max-w-[1152px] mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="text-center w-full">
              <h2 className="text-2xl font-bold">The Ultimate Challenge</h2>
              <h3 className="text-xl font-semibold">Edit Session</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <Close className="h-6 w-6" />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Session Name*
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter session name"
              required
            />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Enter Admin Name*
                </label>
                <input
                  type="text"
                  name="admin"
                  value={formData.admin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Admin name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Admin Passcode*
                </label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="4-digit code"
                  pattern="\d{4}"
                  maxLength={4}
                  inputMode="numeric"
                  required
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditSessionPopup;
