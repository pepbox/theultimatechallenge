const mongoose = require('mongoose');

const questionFolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TheUltimateChallenge',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('QuestionFolder', questionFolderSchema);
