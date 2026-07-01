const mongoose = require('mongoose');

const theUltimateChallengeSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyLogo: { type: String, default: null },
  admin: { type: String, required: true },
  passCode: { type: String, required: true },
  teamFormationGame: { type: Boolean, default: false },
  teamFormationSessionId: { type: String, default: null },  
  currentLevel:{type:Number,default:1},
  teamType: { type: String, enum: ['number', 'color'], default: 'number' },
  numberOfTeams: { type: Number, required: true, default: 10 },
  numberOfTeamsJoined: { type: Number, default: 0 },
  numberOfPlayersJoined: { type: Number, required: true, default: 0 },
  numberOfLevels: { type: Number, required: true, default: 3 },
  questionsPerLevel: { type: Number, max: 13, required: true, default: 13 },
  isCustomQuestionSelection: { type: Boolean, default: false },
  isPaused: { type: Boolean, default: true },
  timer:{
    timerStatus : { type: String, enum: ['ON', 'OFF', 'PAUSED','NOT_SHOW'], default: 'NOT_SHOW' },
    pausedDuration: { type: Number, default: 0 },
    startTime: { type: Date, default: null },
    pausedTime: { type: Date, default: null }
  },
  sessionEnded: { type: Boolean, default: false },
  completionDate: { type: Date, default: null },
  selectedQuestions: {
    1: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    2: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    3: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    4: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    5: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    6: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    7: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    8: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    9: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    10: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TheUltimateChallenge', theUltimateChallengeSchema);
