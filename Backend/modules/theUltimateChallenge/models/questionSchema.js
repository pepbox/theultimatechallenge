const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  level: {
    type: Number,
    enum: [1, 2, 3],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  correctAnswer: {
    type: String,
    default: null
  },
  points: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  answerType: {
    type: String,
    enum: ['fileUpload', 'text'],
    required: true
  },
  questionImageUrl: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('Question', questionSchema);
