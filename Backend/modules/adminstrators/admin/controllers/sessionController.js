const Player = require("../../../theUltimateChallenge/models/playerSchema");
const Team = require("../../../theUltimateChallenge/models/teamSchema");
const TheUltimateChallenge = require("../../../theUltimateChallenge/models/TheUltimateChallenge");
const Admin = require("../models/adminSchema");
const axios = require('axios');

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

        const payload = {
            gameSessionId: session._id,
            totalPlayers: playerCount,
            totalTeams: teamsCount,
            completedOn: session.completionDate,
            status: "ENDED"
        };

        try {
            await axios.post(`${process.env.SUPER_ADMIN_SERVER_URL}/update`, payload);
        } catch (axiosError) {
            console.error('Error sending session data:', axiosError);
        }

        // Emit socket event to all players for game completion redirect
        const io = req.app.get('socketService');
        console.log("Emitting game-ended event to all players");
        if (io) {
            console.log("io connected, emitting game-ended event");
            const players = await Player.find({ session: sessionId }).select('socketId');
            players.forEach(p => { if (p.socketId) io.to(p.socketId).emit('game-ended', { sessionId }); });
        }

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
