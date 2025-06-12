const Player = require("../../../theUltimateChallenge/models/playerSchema");
const Team = require("../../../theUltimateChallenge/models/teamSchema");
const TheUltimateChallenge = require("../../../theUltimateChallenge/models/TheUltimateChallenge");
const Admin = require("../models/adminSchema");

const endSession = async (req, res) => {
    try {
        const { sessionId, adminPassword } = req.body;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Session ID is required'
            });
        }

        const session = await TheUltimateChallenge.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        const admin = await Admin.findOne({ session: sessionId });

        if (!admin) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized - Admin not found for this session'
            });
        }

        if (!adminPassword || adminPassword !== admin.passCode) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized - Incorrect admin password'
            });
        }
        
        // count number of players in the session
        const playerCount = await Player.countDocuments({ session: sessionId });
        const teamsCount = await Team.countDocuments({ session: sessionId });

        session.numberOfPlayers = playerCount;
        session.numberOfTeamsJoined = teamsCount;

        session.sessionEnded = true;
        session.completionDate = new Date();
        await session.save();
        return res.status(200).json({
            success: true,
            message: 'Session ended successfully',
        });

    } catch (error) {
        console.error('Error ending session:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}


module.exports = {
    endSession
};
