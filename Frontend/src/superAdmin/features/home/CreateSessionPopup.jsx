import React, { useState, useEffect } from 'react';
import { Close, ArrowForward } from '@mui/icons-material';
import { Switch } from '@mui/material';
import QuestionsSelector from './QuestionsSelector';
import SuccessPopup from './SuccessPopup';

const initialFormData = {
  companyName: '',
  admin: '',
  password: '',
  teamFormationGame: false,
  numberOfTeams: 100,
  numberOfLevels: 2,
  questionsPerLevel: 13,
  isCustomQuestionSelection: true,
  selectedQuestions: {},
};

const CreateSessionPopup = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [questionsModalOpen, setQuestionsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [successPopupOpen, setSuccessPopupOpen] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    const initializeSelectedQuestions = () => {
      const selectedQuestions = {};
      for (let level = 1; level <= formData.numberOfLevels; level++) {
        selectedQuestions[level] = [];
      }
      return selectedQuestions;
    };

    setFormData(prev => ({
      ...prev,
      selectedQuestions: initializeSelectedQuestions()
    }));
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/theultimatechallenge/getquestions`);
        if (!response.ok) throw new Error('Failed to fetch questions');
        const data = await response.json();
        setAllQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (formData.isCustomQuestionSelection && allQuestions.length > 0) {
      setDefaultQuestions(allQuestions);
    }
  }, [formData.isCustomQuestionSelection, formData.numberOfLevels, formData.questionsPerLevel, allQuestions]);

  const setDefaultQuestions = (questions) => {
    const newSelections = {};
    for (let level = 1; level <= formData.numberOfLevels; level++) {
      const levelQuestions = questions
        .filter((q) => q.level === level)
        .slice(0, formData.questionsPerLevel);
      newSelections[level] = levelQuestions;
    }
    setFormData((prev) => ({
      ...prev,
      selectedQuestions: newSelections,
    }));
  };

  const createNewSession = async (sessionData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/superadmin/createsession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
        credentials: 'include'
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

    // Special handling for passcode field to allow only 4-digit numeric string
    if (name === 'password') {
      const digitOnly = value.replace(/\D/g, '').slice(0, 4); // max 4 digits
      return setFormData((prev) => ({
        ...prev,
        password: digitOnly,
      }));
    }

    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      if (name === 'isCustomQuestionSelection') {
        if (checked) {
          if (allQuestions.length > 0) {
            setDefaultQuestions(allQuestions);
          }
          if (questionsModalOpen) {
            setQuestionsModalOpen(false);
          }
        } else {
          const clearedSelections = {};
          for (let level = 1; level <= prev.numberOfLevels; level++) {
            clearedSelections[level] = [];
          }
          newFormData.selectedQuestions = clearedSelections;
        }
      }

      return newFormData;
    });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseInt(value) || 0;

    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: newValue,
      };

      if (name === 'numberOfLevels') {
        const newSelections = {};
        for (let level = 1; level <= newValue; level++) {
          newSelections[level] = prev.selectedQuestions[level] || [];
        }
        newFormData.selectedQuestions = newSelections;
      } else if (name === 'questionsPerLevel') {
        if (newFormData.isCustomQuestionSelection && allQuestions.length > 0) {
          setDefaultQuestions(allQuestions);
        }
      }

      return newFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedFormData = {
      ...formData,
      selectedQuestions: Object.fromEntries(
        Object.entries(formData.selectedQuestions).map(([level, questions]) => [
          level,
          questions.map((q) => q._id),
        ])
      ),
    };

    try {
      const response = await createNewSession(formattedFormData);

      const apiSessionData = {
        sessionName: formData.companyName,
        adminName: formData.admin,
        adminPassword: formData.password,
        sessionId: response.data.admin.session || '',
      };

      setSessionData(apiSessionData);
      setSuccessPopupOpen(true);

      const initializeSelectedQuestions = () => {
        const selectedQuestions = {};
        for (let level = 1; level <= initialFormData.numberOfLevels; level++) {
          selectedQuestions[level] = [];
        }
        return selectedQuestions;
      };

      setFormData({
        ...initialFormData,
        selectedQuestions: initializeSelectedQuestions()
      });
    } catch (error) {
      console.error('Error creating session:', error);
      alert(error.message || 'Failed to create session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionsSelected = (level, questions) => {
    setFormData((prev) => ({
      ...prev,
      selectedQuestions: {
        ...prev.selectedQuestions,
        [level]: questions,
      },
    }));
  };

  const handleSuccessPopupClose = () => {
    setSuccessPopupOpen(false);
    setSessionData(null);
    onClose();
  };

  const handleSuccessPopupEdit = () => {
    setSuccessPopupOpen(false);
  };

  if (!isOpen) return null;

  const totalSelectedQuestions =
    (formData.selectedQuestions[1] || []).length +
    (formData.selectedQuestions[2] || []).length +
    (formData.selectedQuestions[3] || []).length;

  return (
    <>
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
              allQuestions={allQuestions}
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
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
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
                            {`${totalSelectedQuestions} / ${formData.questionsPerLevel * formData.numberOfLevels} Questions Selected`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setQuestionsModalOpen(true)}
                          className="text-blue-500 hover:text-blue-700 flex items-center"
                          disabled={allQuestions.length === 0}
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

      {successPopupOpen && (
        <SuccessPopup
          sessionData={sessionData}
          onClose={handleSuccessPopupClose}
          onEdit={handleSuccessPopupEdit}
        />
      )}
    </>
  );
};

export default CreateSessionPopup;
