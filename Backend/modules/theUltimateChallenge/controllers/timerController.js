const TheUltimateChallenge = require("../models/TheUltimateChallenge");



const getTimerStatus=async(req,res)=>{
    const {sessionId} = req.query;

    if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
    }

    const session= await TheUltimateChallenge.findById(sessionId)
        .select('timer')
        .lean();

    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    return res.status(200).json({
        success: true,
        timer: session.timer
    });
}   

module.exports = {
    getTimerStatus
};