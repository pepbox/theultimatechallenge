import React, { useState } from 'react';

export const GameLevelChangePopup = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50/50 z-50 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
        <h2 className="text-xl font-bold text-center mb-2">Game Level Change</h2>
        
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
          <h2 className="text-xl font-bold text-center mb-2">Game Status Changes</h2>
          
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
          <h2 className="text-xl font-bold text-center mb-2">Enable Transactions</h2>
          
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

