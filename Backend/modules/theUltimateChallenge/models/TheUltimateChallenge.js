const mongoose = require('mongoose');

const theUltimateChallengeSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  admin: { type: String, required: true },
  passCode: { type: String, required: true },
  teamFormationGame: { type: Boolean, default: false },
  currentLevel:{type:Number,default:1},
  numberOfTeams: { type: Number, required: true },
  numberOfTeamsJoined: { type: Number, default: 0 },
  numberOfPlayersJoined: { type: Number, required: true, default: 0 },
  numberOfLevels: { type: Number, enum: [1, 2, 3], required: true },
  questionsPerLevel: { type: Number, max: 13, required: true },
  isCustomQuestionSelection: { type: Boolean, default: false },
  isPaused: { type: Boolean, default: true },
  sessionEnded: { type: Boolean, default: false },
  completionDate: { type: Date, default: null },
  selectedQuestions: {
    1: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    2: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    3: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TheUltimateChallenge', theUltimateChallengeSchema);
