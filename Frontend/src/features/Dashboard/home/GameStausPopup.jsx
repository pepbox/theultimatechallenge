import React, { useState } from 'react';

export const UpdatePlayingStatusPopup = ({ 
  isOpen, 
  onClose, 
  onSave, 
  level1Count = 20, 
  level2Count = 20,
  level3Count = 20
}) => {
  // Initialize states for active status of each level's numbers
  const [level1Status, setLevel1Status] = useState(
    Array(level1Count).fill(false).map((_, i) => i >= 6 && i !== 12 && i !== 13)
  );
  
  const [level2Status, setLevel2Status] = useState(
    Array(level2Count).fill(false).map((_, i) => i >= 5 && i !== 12 && i !== 13)
  );

  const [level3Status, setLevel3Status] = useState(
    Array(level3Count).fill(false).map((_, i) => i >= 4 && i !== 12 && i !== 13)
  );

  if (!isOpen) return null;

  // Toggle individual number status
  const toggleStatus = (level, index) => {
    if (level === 1) {
      const newStatus = [...level1Status];
      newStatus[index] = !newStatus[index];
      setLevel1Status(newStatus);
    } else if (level === 2) {
      const newStatus = [...level2Status];
      newStatus[index] = !newStatus[index];
      setLevel2Status(newStatus);
    } else {
      const newStatus = [...level3Status];
      newStatus[index] = !newStatus[index];
      setLevel3Status(newStatus);
    }
  };

  
  const activateAll = (level) => {
    if (level === 1) {
      setLevel1Status(Array(level1Count).fill(true));
    } else if (level === 2) {
      setLevel2Status(Array(level2Count).fill(true));
    } else {
      setLevel3Status(Array(level3Count).fill(true));
    }
  };

  
  const deactivateAll = (level) => {
    if (level === 1) {
      setLevel1Status(Array(level1Count).fill(false));
    } else if (level === 2) {
      setLevel2Status(Array(level2Count).fill(false));
    } else {
      setLevel3Status(Array(level3Count).fill(false));
    }
  };

 
  const handleSave = () => {
    onSave({ level1Status, level2Status, level3Status });
    onClose();
  };

  
  const renderLevelSection = (level, status, count) => (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Level {level}</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => activateAll(level)}
            className="px-3 py-1 border border-gray-300 rounded-full text-xs md:text-sm hover:bg-gray-50"
          >
            Activate All
          </button>
          <button 
            onClick={() => deactivateAll(level)}
            className="px-3 py-1 border border-red-300 text-red-500 rounded-full text-xs md:text-sm hover:bg-red-50"
          >
            Deactivate All
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={`l${level}-${i}`}
              onClick={() => toggleStatus(level, i)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${status[i] 
                  ? 'bg-[#81DE48] text-white' 
                  : i === 1 || i === 12 || i === 13 
                    ? 'border border-red-500 text-red-500' 
                    : 'bg-gray-200 text-gray-700'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50/50 z-50 p-4 backdrop-blur-[1px]">
      <div className="capture bg-white rounded-xl p-6 w-[552px] h-[610px] shadow-lg max-h-[90vh] overflow-y-auto ">
        <h2 className="text-2xl font-bold text-center mb-2">Update Playing Status</h2>
        <p className="text-center text-gray-700 mb-6">
          Tap on a number to toggle game status.
        </p>

        <div className="capture space-y-4 max-h-96 overflow-y-auto px-1">
          {/* Level 1 */}
          {renderLevelSection(1, level1Status, level1Count)}

          {/* Level 2 */}
          {renderLevelSection(2, level2Status, level2Count)}

          {/* Level 3 */}
          {renderLevelSection(3, level3Status, level3Count)}
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 mt-6">
          <button 
            onClick={handleSave}
            className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Save
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





// Demo component to show how to use the popup
const Demo = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  
  const handleSave = (data) => {
    console.log('Saved data:', data);
    setIsPopupOpen(false);
  };
  
  const handleClose = () => {
    console.log('Cancelled');
    setIsPopupOpen(false);
  };
  
  return (
    <div className="p-4">
      <button 
        onClick={() => setIsPopupOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Update Game Status
      </button>
      
      <UpdatePlayingStatusPopup 
        isOpen={isPopupOpen} 
        onClose={handleClose} 
        onSave={handleSave}
        level1Count={20}
        level2Count={20}
        level3Count={20}
      />
    </div>
  );
};

export default Demo;