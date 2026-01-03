const mongoose = require('mongoose');
const TheUltimateChallenge = require('../../theUltimateChallenge/models/TheUltimateChallenge');
const SessionHistory = require('../../../models/sessionHistorySchema');
const Question = require('../../theUltimateChallenge/models/questionSchema');
const Admin = require('../../adminstrators/admin/models/adminSchema');
const axios = require('axios');
const Player = require('../../theUltimateChallenge/models/playerSchema');
const Team = require('../../theUltimateChallenge/models/teamSchema');
const { listObjects, deleteFile } = require('../../../services/s3/s3Service');

const createSession = async (req, res) => {
    try {
        const { name: companyName, adminName: admin, adminPin: password, gameConfig } = req.body;
        const {
            teamFormationGame = false,
            numberOfTeams,
            numberOfLevels,
            questionsPerLevel,
            isCustomQuestionSelection = false,
            selectedQuestions,
        } = gameConfig;


        // Validate required fields
        if (!companyName || !admin || !password || !numberOfTeams || !numberOfLevels || !questionsPerLevel) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: companyName, admin, password, numberOfTeams, numberOfLevels, questionsPerLevel'
            });
        }

        // Validate numberOfLevels
        if (![1, 2, 3].includes(numberOfLevels)) {
            return res.status(400).json({
                success: false,
                error: 'numberOfLevels must be 1, 2, or 3'
            });
        }

        // Validate questionsPerLevel
        if (questionsPerLevel > 13 || questionsPerLevel < 1) {
            return res.status(400).json({
                success: false,
                error: 'questionsPerLevel must be between 1 and 13'
            });
        }

        // Validate selectedQuestions
        if (!selectedQuestions || typeof selectedQuestions !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'selectedQuestions must be an object with levels 1, 2, and 3'
            });
        }

        // Validate question IDs and ensure they exist
        for (let level = 1; level <= numberOfLevels; level++) {
            const questionIds = selectedQuestions[level.toString()] || [];

            // Check if the number of questions matches questionsPerLevel
            if (questionIds.length !== questionsPerLevel) {
                return res.status(400).json({
                    success: false,
                    error: `Level ${level} must have exactly ${questionsPerLevel} questions`
                });
            }

            // Validate each question ID
            for (const questionId of questionIds) {
                if (!mongoose.Types.ObjectId.isValid(questionId)) {
                    return res.status(400).json({
                        success: false,
                        error: `Invalid question ID ${questionId} for level ${level}`
                    });
                }

                // Check if the question exists
                const question = await Question.findById(questionId);
                if (!question) {
                    return res.status(404).json({
                        success: false,
                        error: `Question with ID ${questionId} not found`
                    });
                }

                // Verify question level matches the selected level
                if (question.level !== level) {
                    return res.status(400).json({
                        success: false,
                        error: `Question ${questionId} does not belong to level ${level}`
                    });
                }
            }
        }

        // Ensure unused levels have empty arrays
        const formattedSelectedQuestions = {
            1: selectedQuestions['1'] || [],
            2: selectedQuestions['2'] || [],
            3: selectedQuestions['3'] || []
        };

        // Create new session
        const session = new TheUltimateChallenge({
            companyName,
            admin,
            passCode: password,
            teamFormationGame,
            numberOfTeams,
            numberOfLevels,
            questionsPerLevel,
            isCustomQuestionSelection,
            selectedQuestions: formattedSelectedQuestions
        });

        // Save session
        const savedSession = await session.save();
        console.log("Session created successfully:", savedSession._id);
        let playerGameLink = `${process.env.FRONTEND_URL}/theultimatechallenge/login/${savedSession._id.toString()}`;
        let adminGameLink = `${process.env.FRONTEND_URL}/admin/${savedSession._id.toString()}/login`;

        if (teamFormationGame) {
            const gameConfig = {
                gameSessionId: savedSession._id.toString(),
                gameLink: `${process.env.FRONTEND_URL}/theultimatechallenge/login/${savedSession._id.toString()}`,
                gameServerUrl: process.env.SERVER_URL,
                gameAdminLink: `${process.env.FRONTEND_URL}/admin/${savedSession._id.toString()}/login`,
                gameLinked: true
            }
            const teamFormationSessionResponse = await axios.post(`${process.env.TEAM_FORMATION_SERVER_URL}/create-session`, {
                gameConfig,
                adminPin: password,
                name: session.companyName,
                adminName: admin
            });
            if (teamFormationSessionResponse.status !== 201) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to create team formation session'
                });
            }
            // const teamFormationSessionId = teamFormationSessionResponse.data.data._id;
            // const { playerGameLink: playerLink, adminGameLink: adminLink } = teamFormationSessionResponse.data.data;
            const teamFormationSessionId = teamFormationSessionResponse.data.data.sessionId;
            const { playerLink, adminLink } = teamFormationSessionResponse.data.data;

            savedSession.teamFormationSessionId = teamFormationSessionId;
            playerGameLink = playerLink;
            adminGameLink = adminLink;
            await savedSession.save();
        }

        // Create session history entry
        const sessionHistory = new SessionHistory({
            session: savedSession._id,
            sessionType: 'TheUltimateChallenge',
            sessionPaused: false,
            status: 'live',
            startedAt: new Date()
        });

        // Save session history
        await sessionHistory.save();

        // Create admin entry
        const newAdmin = new Admin({
            adminName: admin,
            session: savedSession._id.toString(),
            passCode: password,
            // socketId can be added later when the admin connects
        });

        // Save admin
        await newAdmin.save();


        // Return success response
        return res.status(201).json({
            success: true,
            data: {
                playerLink: playerGameLink,
                adminLink: adminGameLink,
                sessionId: savedSession._id.toString(),
                // session: { ...savedSession, playerGameLink, adminGameLink },
                // sessionHistory,
                // admin: newAdmin
            },
            message: 'Session and admin created successfully'
        });

    } catch (error) {
        console.error('Error creating session:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}


const updateSession = async (req, res) => {
    const { sessionId, name, adminName, adminPin } = req.body;

    console.log("SessionId", sessionId);
    console.log("Name", name);
    console.log("AdminName", adminName);
    console.log("AdminPin", adminPin);

    try {
        if (!sessionId || !name || !adminName || !adminPin) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: sessionID, name, adminName, adminPin'
            });
        }

        const session = await TheUltimateChallenge.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }


        session.companyName = name;
        session.admin = adminName;
        session.passCode = adminPin;

        const updatedSession = await session.save();

        const admin = await Admin.findOne({
            session: sessionId,
        });
        admin.adminName = adminName;
        admin.passCode = adminPin;
        await admin.save();
        return res.status(200).json({
            success: true,
            data: updatedSession,
            message: 'Session updated successfully'
        });
    } catch (error) {
        console.error('Error updating session:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}


const endSession = async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: sessionId'
        });
    }

    const session = await TheUltimateChallenge.findById(sessionId);
    if (!session) {
        return res.status(404).json({
            success: false,
            error: 'Session not found'
        });
    }

    session.sessionEnded = true;
    session.completionDate = new Date();
    await session.save();

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

}


const deleteSessionData = async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: sessionId'
        });
    }

    try {
        // Validate sessionId format
        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid sessionId format'
            });
        }

        // Check if session exists
        const session = await TheUltimateChallenge.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        // Delete all files from S3 bucket under /answers/{sessionId}/ folder
        const s3FolderPrefix = `answers/${sessionId}/`;
        try {
            const s3Objects = await listObjects(s3FolderPrefix);

            if (s3Objects.length > 0) {
                console.log(`Deleting ${s3Objects.length} files from S3 folder: ${s3FolderPrefix}`);
                const deletePromises = s3Objects.map(obj => deleteFile(obj.Key));
                await Promise.all(deletePromises);
            } else {
                console.log(`No files found in S3 folder: ${s3FolderPrefix}`);
            }
        } catch (s3Error) {
            console.error('Error deleting S3 files:', s3Error);
            // Continue with database cleanup even if S3 deletion fails
        }

        // Delete all related database records
        const [
            deletedPlayers,
            deletedTeams,
            deletedAdmin,
            deletedSessionHistory,
            deletedSession
        ] = await Promise.all([
            Player.deleteMany({ session: sessionId }),
            Team.deleteMany({ session: sessionId }),
            Admin.deleteMany({ session: sessionId }),
            SessionHistory.deleteMany({ session: sessionId }),
            TheUltimateChallenge.findByIdAndDelete(sessionId)
        ]);
        return res.status(200).json({
            success: true,
            message: 'Session data deleted successfully',
            data: {
                playersDeleted: deletedPlayers.deletedCount,
                teamsDeleted: deletedTeams.deletedCount,
                adminsDeleted: deletedAdmin.deletedCount,
                sessionHistoriesDeleted: deletedSessionHistory.deletedCount,
                sessionDeleted: deletedSession ? 1 : 0
            }
        });
    }
    catch (error) {
        console.error('Error deleting session data:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
}
module.exports = {
    createSession,
    updateSession,
    endSession,
    deleteSessionData
};