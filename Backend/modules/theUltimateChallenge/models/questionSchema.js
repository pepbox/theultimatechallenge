const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  level: {
    type: Number,
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
    enum: ['fileUpload', 'text','image','video'],
    required: true
  },
  questionImageUrl: {
    type: String,
    default: null
  },
  folder: {
    type: String,
    default: 'General',
    trim: true
  },
  isCustom: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

questionSchema.index({ folder: 1, level: 1, createdAt: -1 });

module.exports = mongoose.model('Question', questionSchema);
