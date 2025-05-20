import React, { useState } from 'react';
import { Close, ArrowForward } from '@mui/icons-material';
import { Switch } from '@mui/material';
import QuestionsSelector from './QuestionsSelector';

const CreateSessionPopup = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    admin: '',
    password: '',
    teamFormationGame: false,
    numberOfTeams: 2,
    numberOfLevels: 3,
    questionsPerLevel: 13,
    isCustomQuestionSelection: false,
    selectedQuestions: {
      1: [],
      2: [],
      3: []
    }
  });
  
  const [questionsModalOpen, setQuestionsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createNewSession = async (sessionData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/superadmin/createsession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      

      return await response.json();
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseInt(value) || 0;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
      selectedQuestions: name === 'questionsPerLevel' ? {
        1: [],
        2: [],
        3: []
      } : prev.selectedQuestions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Format selectedQuestions to match backend schema
    const formattedFormData = {
      ...formData,
      selectedQuestions: {
        1: formData.selectedQuestions[1].map(q => q._id),
        2: formData.selectedQuestions[2].map(q => q._id),
        3: formData.selectedQuestions[3].map(q => q._id)
      }
    };

    try {
      const response = await createNewSession(formattedFormData);

      console.log(response.data)
      
      // if (onSubmit) {
      //   await onSubmit(response.data);

      // }
      setFormData({
    companyName: '',
    admin: '',
    password: '',
    teamFormationGame: false,
    numberOfTeams: 2,
    numberOfLevels: 3,
    questionsPerLevel: 13,
    isCustomQuestionSelection: false,
    selectedQuestions: {
      1: [],
      2: [],
      3: []
    }
  })
      
      onClose();
    } catch (error) {
      console.error('Error creating session:', error);
      alert(error.message || 'Failed to create session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionsSelected = (level, questions) => {
    setFormData(prev => ({
      ...prev,
      selectedQuestions: {
        ...prev.selectedQuestions,
        [level]: questions
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[80%] max-w-[1152px] mx-auto">
        {questionsModalOpen ? (
          <QuestionsSelector 
            onClose={() => setQuestionsModalOpen(false)}
            selectedQuestions={formData.selectedQuestions}
            onQuestionsSelected={handleQuestionsSelected}
            maxQuestionsPerLevel={formData.questionsPerLevel}
            numberOfLevels={formData.numberOfLevels}
            isCustomSelectionAllowed={!formData.isCustomQuestionSelection}
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="text-center w-full">
                <h2 className="text-2xl font-bold">The Ultimate Challenge</h2>
                <h3 className="text-xl font-semibold">Create New Session</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <Close className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
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
                </div>
                
                <div className="grid grid-cols-2 gap-4">
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
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="****"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Addons (Coming soon)
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2">Team Formation Game</span>
                    <Switch
                      name="teamFormationGame"
                      checked={formData.teamFormationGame}
                      onChange={handleChange}
                      color="primary"
                      disabled={true}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium mb-3">Game Rules</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Number of Teams*
                      </label>
                      <input
                        type="number"
                        name="numberOfTeams"
                        value={formData.numberOfTeams}
                        onChange={handleNumberChange}
                        min="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Number of Questions (per level)*
                      </label>
                      <select
                        name="questionsPerLevel"
                        value={formData.questionsPerLevel}
                        onChange={handleNumberChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none"
                        required
                      >
                        {[...Array(13)].map((_, i) => (
                          <option key={i+1} value={i+1}>{i+1}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">
                      Game Levels (Max 3)*
                    </label>
                    <select
                      name="numberOfLevels"
                      value={formData.numberOfLevels}
                      onChange={handleNumberChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none"
                      required
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">
                      Questions
                    </label>
                    <div className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          name="isCustomQuestionSelection"
                          checked={formData.isCustomQuestionSelection}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600 rounded" 
                        />
                        <span className="ml-2">
                          {formData.selectedQuestions[1].length + formData.selectedQuestions[2].length + formData.selectedQuestions[3].length} / {formData.questionsPerLevel * formData.numberOfLevels} Questions Selected
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setQuestionsModalOpen(true)}
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                      >
                        Edit Selection
                        <ArrowForward className="h-4 w-4 ml-1" />
                      </button>
                    </div>
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
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateSessionPopup;