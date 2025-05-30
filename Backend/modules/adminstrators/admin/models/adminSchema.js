const  mongoose  = require("mongoose");

const adminSchema = new mongoose.Schema({
  adminName: { type: String, required: true },
  session: { type: String, required: true },
  socketId: { type: String },
  passCode: {type:String , required:true},
   currentLevel:{type:String , default:"1"},
  createdAt: { type: Date, default: Date.now, expires: '1d' } // TTL index: expires after 1 day
});

module.exports = mongoose.model('Admin', adminSchema);
