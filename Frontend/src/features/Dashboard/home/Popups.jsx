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

export const GameStatusChangePopup = ({ isOpen, onClose, onConfirm, numQuestionsSelected, numTeamsJoined, numTeamsCreated, isTurningOn }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50/50 z-50 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl p-6 w-[340px] shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-center mb-2 text-gray-900 font-sans">
          Game Status Change
        </h2>

        <div className="text-center text-gray-600 mb-6 space-y-3 font-sans">
          <p className="text-sm">
            Are you sure you want to turn the game status <strong>{isTurningOn ? "ON" : "OFF"}</strong>?
          </p>
          {isTurningOn && (
            <div className="bg-slate-50 rounded-lg p-3 text-left text-xs space-y-2 border border-slate-100 mt-2 font-sans">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Selected Questions:</span>
                <span className="font-bold text-gray-800">{numQuestionsSelected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Teams Joined:</span>
                <span className="font-bold text-gray-800">{numTeamsJoined} / {numTeamsCreated}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={onConfirm}
            className="flex-1 bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm font-sans"
          >
            Confirm
          </button>

          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm text-gray-700 font-sans"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const CreateTeamsPopup = ({ isOpen, onClose, onConfirm }) => {
  const [count, setCount] = useState("5");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    const num = Number(count);
    if (isNaN(num) || num < 1 || num > 100) {
      setError("Please enter a number between 1 and 100");
      return;
    }
    setError("");
    onConfirm(num);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50/50 z-50 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl p-6 w-80 shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-center mb-2 text-gray-900 font-sans">
          Create Teams
        </h2>

        <p className="text-center text-xs text-gray-500 mb-4 font-sans">
          Specify the number of new teams to generate sequential names for (e.g. Team 1, Team 2, etc.)
        </p>

        <div className="mb-4">
          <input
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-lg font-bold font-mono"
          />
          {error && <p className="text-red-500 text-xs mt-1 text-center font-sans">{error}</p>}
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-[#FCA61E] hover:bg-[#e09115] text-white py-2.5 rounded-lg font-medium transition-colors text-sm font-sans"
          >
            Create
          </button>

          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm text-gray-700 font-sans"
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

export const GameStartBlockedPopup = ({ isOpen, onClose, numQuestionsSelected, numTeamsCreated }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50/50 z-50 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl p-6 w-[360px] shadow-lg border border-gray-100 font-sans">
        <div className="text-center mb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-red-600 mb-2">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            Cannot Start Game
          </h2>
        </div>

        <div className="text-center text-sm text-gray-600 mb-6 space-y-3">
          <p>
            Please complete the following setup steps before turning the game status <strong>ON</strong>:
          </p>
          <div className="bg-red-50 rounded-lg p-3 text-left text-xs space-y-2 border border-red-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">1. Select Questions:</span>
              <span className={`font-bold ${numQuestionsSelected > 0 ? "text-green-600" : "text-red-600"}`}>
                {numQuestionsSelected > 0 ? `✓ Selected (${numQuestionsSelected})` : "✗ None Selected"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">2. Create Teams:</span>
              <span className={`font-bold ${numTeamsCreated > 0 ? `✓ Created (${numTeamsCreated})` : "✗ No Teams"}`}>
                {numTeamsCreated > 0 ? `✓ Created (${numTeamsCreated})` : "✗ No Teams"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
};

