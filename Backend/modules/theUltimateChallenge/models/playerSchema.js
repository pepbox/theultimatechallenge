const  mongoose  = require("mongoose");

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'TheUltimateChallenge', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  isCaption: { type: Boolean, default: false },
  socketId: { type: String },

  createdAt: { type: Date, default: Date.now, expires: '1d' } // TTL index: expires after 1 day
});

module.exports = mongoose.model('Player', playerSchema);
