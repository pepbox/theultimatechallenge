const mongoose = require('mongoose');

const sessionHistorySchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'sessionType' 
  },
  sessionType: {
    type: String,
    required: true,
    enum: ['TheUltimateChallenge', 'AnotherGameType'] 
  },
  sessionPaused: {
    type: Boolean,
    default : false
  }
  ,
  status: {
    type: String,
    required: true,
    enum: ['live', 'completed', 'cancelled'],
    default: 'live'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  }
});

module.exports = mongoose.model('SessionHistory', sessionHistorySchema);
