import React, { useState } from 'react';

const QuestionForm = () => {
  const [formData, setFormData] = useState({
    level: '',
    text: '',
    correctAnswer: '',
    points: '',
    difficulty: '',
    answerType: '',
    questionImageFile: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState([]);

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.level) {
      newErrors.push('Question Level is required');
    }
    if (!formData.points || formData.points < 1) {
      newErrors.push('Points must be a number greater than or equal to 1');
    }
    if (!formData.text.trim()) {
      newErrors.push('Question Text is required');
    }
    if (!formData.difficulty) {
      newErrors.push('Difficulty Level is required');
    }
    if (!formData.answerType) {
      newErrors.push('Answer Type is required');
    }
    if (formData.answerType === 'text' && !formData.correctAnswer.trim()) {
      newErrors.push('Correct Answer is required for Text answer type');
    }
    if ((formData.answerType === 'image' || formData.answerType === 'video') && !formData.questionImageFile) {
      newErrors.push('Question Image is required for File Upload answer type');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear errors when field is edited
    setErrors([]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      questionImageFile: file || null
    });
    
    // Clear errors when file is selected or cleared
    setErrors([]);
    
    // Create preview
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      
      const questionData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'questionImageFile' && formData[key]) {
          questionData.append('questionImage', formData[key]);
        } else {
          questionData.append(key, formData[key]);
        }
      });
      // Send questionData to your API here
    } else {
      console.log('Form validation failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/50">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl text-gray-600 font-medium">The Ultimate Challenge</h1>
          <h2 className="text-3xl font-bold">Create New Question</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Level*
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                required
              >
                <option value="">Select Level</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Points*
              </label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                required
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text*
            </label>
            <textarea
              name="text"
              value={formData.text}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level*
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                required
              >
                <option value="">Select Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="difficult">Difficult</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answer Type*
              </label>
              <select
                name="answerType"
                value={formData.answerType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                required
              >
                <option value="">Select Answer Type</option>
                <option value="text">Text</option>
                <option value="fileUpload">File Upload</option>
              </select>
            </div>
          </div>

          {formData.answerType === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correct Answer*
              </label>
              <input
                type="text"
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                required
              />
            </div>
          )}

          {formData.answerType === 'fileUpload' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Image*
              </label>
              <div className="mt-1 flex items-center">
                <input
                  id="questionImage"
                  name="questionImage"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  required
                />
                <label
                  htmlFor="questionImage"
                  className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Upload Image
                </label>
                <span className="ml-3 text-sm text-gray-500">
                  {formData.questionImageFile ? formData.questionImageFile.name : 'No file chosen'}
                </span>
              </div>
              {imagePreview && (
                <div className="mt-3">
                  <img 
                    src={imagePreview} 
                    alt="Question preview" 
                    className="max-h-40 rounded-md border border-gray-300" 
                  />
                </div>
              )}
            </div>
          )}

          {errors.length > 0 && (
            <div className="mt-4">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">{error}</p>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md bg-black text-white hover:bg-gray-800"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;