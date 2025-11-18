import React, { useState } from "react";
// import useSessionManagement from "../../../hooks/admin/useSessionManagement";
// import useAdminAuth from "../../../hooks/admin/useAuth";

export const GameLevelChangePopup = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50/50 z-50 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
        <h2 className="text-xl font-bold text-center mb-2">
          Game Level Change
        </h2>

        <p className="text-center text-gray-700 mb-6">
          Are you sure you want to change the game level?
        </p>

        <div className="flex justify-between gap-4">
          <button
            onClick={onConfirm}
            className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Change
          </button>

          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const GameStatusChangePopup = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50/50 z-50 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
        <h2 className="text-xl font-bold text-center mb-2">
          Game Status Changes
        </h2>

        <p className="text-center text-gray-700 mb-6">
          Are you sure you want to change the game status?
        </p>

        <div className="flex justify-between gap-4">
          <button
            onClick={onConfirm}
            className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Change
          </button>

          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const GameTransactionChangePopup = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50/50 z-50 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
        <h2 className="text-xl font-bold text-center mb-2">
          Enable Transactions
        </h2>

        <p className="text-center text-gray-700 mb-6">
          Are you sure you want to enable game transactions?
        </p>

        <div className="flex justify-between gap-4">
          <button
            onClick={onConfirm}
            className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Change
          </button>

          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// export const EndSessionModal = ({ sessionId, onClose }) => {
//   const [adminPasscode, setAdminPasscode] = useState("");
//   const [passcodeError, setPasscodeError] = useState("");
//   const [apiError, setApiError] = useState("");
//   const { handleLogout } = useAdminAuth();

//   const { endSessionLoading, handleEndSession } = useSessionManagement({
//     sessionId,
//   });

//   const handleSubmit = async () => {
//     // Clear any previous errors
//     setPasscodeError("");
//     setApiError("");

//     // Validate passcode - must be exactly 4 digits
//     if (!adminPasscode.trim()) {
//       setPasscodeError("Admin passcode is required");
//       return;
//     }

//     // Check if passcode is exactly 4 digits
//     if (!/^\d{4}$/.test(adminPasscode)) {
//       setPasscodeError("Passcode must be exactly 4 digits");
//       return;
//     }

//     // Call the API
//     try {
//       const result = await handleEndSession({ adminPassword: adminPasscode });

//       if (result.success) {
//         handleLogout();
//         onClose();
//       } else {
//         setApiError(result.error);
//       }
//     } catch (error) {
//       setApiError("An unexpected error occurred");
//     }
//   };

//   const handlePasscodeChange = (e) => {
//     const value = e.target.value;
//     // Only allow numeric input and limit to 4 digits
//     if (/^\d{0,4}$/.test(value)) {
//       setAdminPasscode(value);
//       // Clear errors when user starts typing
//       if (passcodeError) {
//         setPasscodeError("");
//       }
//       if (apiError) {
//         setApiError("");
//       }
//     }
//   };

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-slate-50/50 z-50 backdrop-blur-[1px] px-2">
//       <div className="bg-white rounded-xl p-6 w-full max-w-xs sm:max-w-sm shadow-lg">
//         <h2 className="text-xl font-bold text-center mb-2">End Session</h2>

//         <p className="text-center text-gray-700 mb-4">
//           Are you sure you want to end this session?
//         </p>

//         {/* Admin Passcode Input */}
//         <div className="mb-4">
//           <label
//             htmlFor="adminPasscode"
//             className="block text-sm font-medium text-gray-700 mb-2"
//           >
//             Admin Passcode
//           </label>
//           <input
//             id="adminPasscode"
//             type="text"
//             inputMode="numeric"
//             pattern="[0-9]*"
//             value={adminPasscode}
//             onChange={handlePasscodeChange}
//             placeholder="Enter passcode"
//             maxLength={4}
//             className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent  ${
//               passcodeError || apiError ? "border-red-500" : "border-gray-300"
//             }`}
//             disabled={endSessionLoading}
//           />

//           {/* Validation Error */}
//           {passcodeError && (
//             <p className="text-red-500 text-sm mt-1">{passcodeError}</p>
//           )}

//           {/* API Error */}
//           {apiError && <p className="text-red-500 text-sm mt-1">{apiError}</p>}
//         </div>

//         <div className="flex flex-col sm:flex-row justify-between gap-4">
//           <button
//             onClick={handleSubmit}
//             disabled={endSessionLoading}
//             className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {endSessionLoading ? "Ending Session..." : "End Session"}
//           </button>

//           <button
//             onClick={onClose}
//             disabled={endSessionLoading}
//             className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
