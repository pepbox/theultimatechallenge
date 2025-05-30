const  mongoose  = require("mongoose");

const superAdminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: {type:String , required:true},
  socketId: { type: String },
  createdAt: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('superAdmin', superAdminSchema);
