const  mongoose  = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'TheUltimateChallenge', required: true },

  caption: {
    type: String, 
  },
  currentLevel: { type: Number, default: 1 },
  questionStatus: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    status: { type: String, enum: ['available', 'attending', 'done'], default: 'available' },
    currentPlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
    pointsEarned: { type: Number, default: 0 },
    answerUrl: {
      type: String,
      default: null
    }, 
    submittedAnswer:{
      type:String,
      default:null
    }  
  }],
  teamScore:{type:Number,default : 0},
  // currentLevel:{type:Number,default: 1}
});

module.exports = mongoose.model('Team', teamSchema);
