const  mongoose  = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'TheUltimateChallenge', required: true },

  caption: {
    type: String, // hardcoded for future tracking
    required: true
  },

  questionStatus: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    status: { type: String, enum: ['available', 'attending', 'done'], default: 'available' },
    currentPlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
    pointsEarned: { type: Number, default: 0 },
    answerUrl: {
      type: String,
      default: null
    },
    
  }]
});

module.exports = mongoose.model('Team', teamSchema);
