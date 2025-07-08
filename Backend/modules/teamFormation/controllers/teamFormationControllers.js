const TeamModel = require("../../theUltimateChallenge/models/teamSchema");
const PlayerModel = require("../../theUltimateChallenge/models/playerSchema");
const TheUltimateChallenge = require("../../theUltimateChallenge/models/TheUltimateChallenge");
const AdminModel = require("../../adminstrators/admin/models/adminSchema");

const jwt = require("jsonwebtoken");

const continueToGame = async (req, res) => {
    const { sessionId, teams } = req.body;

    if (!sessionId || !teams || !Array.isArray(teams) || teams.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid request data"
        });
    }

    try {
        const session = await TheUltimateChallenge.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        const questionStatus = [];

        for (let level = 1; level <= session.numberOfLevels; level++) {
            const levelQuestions = session.selectedQuestions[level] || [];
            levelQuestions.forEach(questionId => {
                questionStatus.push({
                    question: questionId,
                    status: 'available'
                });
            });
        }

        let createdTeams = [];

        // Insert teams one by one to handle duplicates gracefully
        for (const team of teams) {
            try {
                const newTeam = await TeamModel.create({
                    _id: team.teamId,
                    name: team.teamName,
                    session: sessionId,
                    questionStatus: questionStatus,
                    currentLevel: 1
                });
                createdTeams.push(newTeam);
            } catch (error) {
                // Skip duplicate key errors and continue
                if (error.code !== 11000) {
                    console.error(`Error creating team ${team.teamName}:`, error);
                }
            }
        }

        const admin = await AdminModel.findOne({ session: sessionId });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found for this session"
            });
        }

        const tokenPayload = {
            adminId: admin._id,
            sessionId: session._id,
            adminName: admin.adminName
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        });

        return res.status(201).json({
            success: true,
            message: "Teams created successfully",
            data: {
                teams: createdTeams,
                adminToken: token
            }
        });

    } catch (error) {
        console.error("Error in continueToGame:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


const createPlayer = async (req, res) => {
    const { teamId, playerName, isLeader } = req.body;

    console.log("Creating player with data:", req.body);

    if (!teamId || !playerName) {
        return res.status(400).json({
            success: false,
            message: "Team ID and player name are required"
        });
    }

    try {
        const team = await TeamModel.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        const newPlayer = new PlayerModel({
            name: playerName,
            team: teamId,
            session: team.session,
            isCaptain: isLeader || false,
        })

        await newPlayer.save();

        const token = jwt.sign(
            { playerId: newPlayer._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.status(201).json({
            success: true,
            message: "Player added successfully",
            token,
        });
    } catch (error) {
        console.error("Error adding player:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


module.exports = {
    continueToGame,
    createPlayer
}