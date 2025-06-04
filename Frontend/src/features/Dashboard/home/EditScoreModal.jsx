import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

const EditScoreModal = ({ team, onClose }) => {
  
  const [scoreChange, setScoreChange] = useState('');
  const [operation, setOperation] = useState('add'); // 'add' or 'subtract'

  const handleScoreChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && parseInt(value) >= 0)) {
      setScoreChange(value);
    }
  };

  const handleApplyChange = async () => {
    if (!scoreChange || isNaN(scoreChange) || parseInt(scoreChange) <= 0) {
      alert('Please enter a valid number');
      return;
    }

    const changeAmount = parseInt(scoreChange);
    const finalChange = operation === 'subtract' ? -changeAmount : changeAmount;

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/update-total-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: team.id,
          scoreChange: finalChange
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update score');
      }

      console.log(`${operation === 'add' ? 'Adding' : 'Subtracting'} ${changeAmount} points ${operation === 'add' ? 'to' : 'from'} Team ${team.name}`);
      onClose();
    } catch (error) {
      console.error('Error updating team score:', error);
      alert('Failed to update score: ' + error.message);
    }
  };

  const getNewScore = () => {
    if (!scoreChange || isNaN(scoreChange)) return team.score;
    const changeAmount = parseInt(scoreChange);
    return operation === 'add' ? team.score + changeAmount : team.score - changeAmount;
  };

  const getPreviewColor = () => {
    if (!scoreChange || isNaN(scoreChange)) return '';
    return operation === 'add' ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-sans">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Edit Score - Team {team?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Score Display */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Current Score:</p>
          <p className="text-xl font-bold text-gray-800">
            {team?.score.toLocaleString()} points
          </p>
        </div>

        {/* Operation Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Operation:
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setOperation('add')}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md border transition-colors ${
                operation === 'add' 
                  ? 'bg-green-100 border-green-300 text-green-700' 
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Plus size={16} className="mr-1" />
              Add Points
            </button>
            <button
              onClick={() => setOperation('subtract')}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md border transition-colors ${
                operation === 'subtract' 
                  ? 'bg-red-100 border-red-300 text-red-700' 
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Minus size={16} className="mr-1" />
              Subtract Points
            </button>
          </div>
        </div>

        {/* Points Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter points to {operation}:
          </label>
          <input
            type="number"
            value={scoreChange}
            onChange={handleScoreChange}
            placeholder="Enter points"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
          />
        </div>

        {/* New Score Preview */}
        {scoreChange && !isNaN(scoreChange) && parseInt(scoreChange) > 0 && (
          <div className={`mb-4 p-3 rounded-lg border ${getPreviewColor()}`}>
            <p className="text-sm">New Score after {operation}:</p>
            <p className="text-lg font-semibold">
              {getNewScore().toLocaleString()} points
              <span className="text-sm ml-2">
                ({operation === 'add' ? '+' : '-'}{parseInt(scoreChange).toLocaleString()})
              </span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyChange}
            className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
              operation === 'add' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {operation === 'add' ? 'Add' : 'Subtract'} Points
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditScoreModal;