const Team = require('../../../theUltimateChallenge/models/teamSchema');
const Player = require('../../../theUltimateChallenge/models/playerSchema');
const TheUltimateChallenge = require('../../../theUltimateChallenge/models/TheUltimateChallenge');
const jwt = require('jsonwebtoken');
const archiver = require('archiver');
const { listObjects, getFileStream } = require('../../../../services/s3/s3Service');

const changeTeamLevels = async (req, res) => {
    try {
        // 1. Verify admin token
        const token = req.cookies.adminToken;
        if (!token) {
            return res.status(401).json({ error: 'Admin token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { sessionId, level } = req.body;

        // 2. Validate input
        if (!sessionId || !level) {
            return res.status(400).json({ error: 'sessionId and level are required' });
        }

        if (![1, 2, 3].includes(Number(level))) {
            return res.status(400).json({ error: 'Level must be 1, 2, or 3' });
        }

        // 3. Fetch session
        const session = await TheUltimateChallenge.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // 4. Update all teams' currentLevel
        const teams = await Team.find({ session: sessionId }).populate({
            path: 'questionStatus.question',
            model: 'Question'
        });

        if (!teams || teams.length === 0) {
            return res.status(404).json({ error: 'No teams found for this session' });
        }

        session.currentLevel = Number(level);
        await session.save();

        // 5. Update currentLevel for all teams
        // await Team.updateMany(
        //     { session: sessionId },
        //     { $set: { currentLevel: Number(level) } }
        // );

        // 6. Emit updated team data to all players
        const io = req.app.get("socketService");

        for (const team of teams) {
            // Fetch players for the team
            const teamPlayers = await Player.find({ team: team._id });
            const teamSocketIds = teamPlayers.map(p => p.socketId).filter(id => id);

            // Format question data
            const questionData = team.questionStatus.map(q => ({
                id: q.question._id,
                text: q.question.text,
                level: q.question.level,
                category: q.question.category,
                status: q.status,
                currentPlayer: q.currentPlayer,
                pointsEarned: q.pointsEarned,
                answerUrl: q.answerUrl,
                answerType: q.question.answerType,
                questionImageUrl: q.question.questionImageUrl,
                points: q.question.points,
                difficulty: q.question.difficulty
            }));

            // Create payload
            const payload = {
                teamInfo: {
                    name: team.name,
                    currentLevel: Number(level), // Use the new level
                    teamScore: team.teamScore,
                    caption: team.caption,
                    isPaused: session.isPaused
                },
                questions: questionData
            };

            // Emit to all team members
            teamSocketIds.forEach(socketId => {
                io.to(socketId).emit("team-data", payload);
            });
        }

        // 7. Return success response
        return res.status(200).json({
            success: true,
            message: `All teams in session ${sessionId} updated to level ${level}`
        });

    } catch (err) {
        console.error('Error updating team levels:', err);
        return res.status(500).json({
            error: err.message || 'Failed to update team levels'
        });
    }
};


const getGameSettingsData = async (req, res) => {
    try {
        const token = req.cookies.adminToken;
        if (!token) {
            return res.status(401).json({ error: 'Admin token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { sessionId } = req.query;
        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        const session = await TheUltimateChallenge.findById(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const playerGameLink = `${process.env.FRONTEND_URL}/theultimatechallenge/login/${session._id.toString()}`;
        const adminGameLink = `${process.env.FRONTEND_URL}/admin/${session._id.toString()}/login`;


        return res.status(200).json({
            success: true,
            data: {
                sessionId: session._id,
                numberOfLevels: session.numberOfLevels,
                isPaused: session.isPaused,
                adminName: session.admin,
                sessionName: session.companyName,
                currentLevel: session.currentLevel,
                playerGameLink,
                adminGameLink,
            }
        });
    }
    catch (err) {
        console.error('Error fetching game settings data:', err);
        return res.status(500).json({
            error: err.message || 'Failed to fetch game settings data'
        });
    }
}


const downloadSessionData = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;

        // Verify admin token
        const token = req.cookies.adminToken;
        if (!token) {
            return res.status(401).json({ error: 'Admin token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Validate sessionId
        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        // Verify session exists
        const session = await TheUltimateChallenge.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // List all objects in the S3 folder for this session
        const s3Prefix = `answers/${sessionId}/`;
        const files = await listObjects(s3Prefix);

        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'No files found for this session' });
        }

        // Set response headers for zip download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=session-${session.companyName}-${session.createdAt.toISOString()}.zip`
        );

        // Create archiver instance
        const archive = archiver('zip', { zlib: { level: 9 } });

        // Handle archiver errors
        archive.on('error', (err) => {
            console.error('Archive error:', err);
            throw err;
        });

        // Pipe archive to response
        archive.pipe(res);

        // Add each file from S3 to the archive
        for (const file of files) {
            try {
                // Get file stream from S3
                const fileStream = getFileStream(file.Key);

                // Extract filename from S3 key (remove prefix)
                const fileName = file.Key.replace(s3Prefix, '');

                // Add file to archive
                archive.append(fileStream, { name: fileName });
            } catch (fileErr) {
                console.error(`Error processing file ${file.Key}:`, fileErr);
                // Continue with other files
            }
        }

        // Finalize the archive (this is important!)
        await archive.finalize();

    } catch (err) {
        console.error('Error downloading session data:', err);

        // Only send error response if headers haven't been sent
        if (!res.headersSent) {
            return res.status(500).json({
                error: err.message || 'Failed to download session data'
            });
        }
    }
}

module.exports = { getGameSettingsData, changeTeamLevels, downloadSessionData };