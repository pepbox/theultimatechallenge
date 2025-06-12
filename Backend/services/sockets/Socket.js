const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const Player = require("../../modules/theUltimateChallenge/models/playerSchema");
const Team = require("../../modules/theUltimateChallenge/models/teamSchema");
const Question = require("../../modules/theUltimateChallenge/models/questionSchema");
const TheUltimateChallenge = require("../../modules/theUltimateChallenge/models/TheUltimateChallenge");
const Admin = require("../../modules/adminstrators/admin/models/adminSchema");

let ioInstance;

function setupSocket(io) {
    io.on('connection', (socket) => {
        console.log('A user connected', socket.id);

        socket.on("request-team-data", async (callback) => {
            try {
                // 1. Extract JWT from cookie
                const cookies = socket.handshake.headers.cookie;
                if (!cookies) {
                    if (callback) callback({ success: false, error: "No cookies found" });
                    return socket.emit("error", "No cookies found");
                }
                
                const parsedCookies = cookie.parse(cookies);
                const token = parsedCookies.token;
                
                if (!token) {
                    if (callback) callback({ success: false, error: "JWT token missing in cookie" });
                    return socket.emit("error", "JWT token missing in cookie");
                }

                // 2. Verify JWT
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const playerId = decoded.playerId;

                // 3. Fetch player and team data
                const player = await Player.findById(playerId);
                if (!player) {
                    if (callback) callback({ success: false, error: "Player not found" });
                    return socket.emit("error", "Player not found");
                }

                const team = await Team.findById(player.team).populate({
                    path: "questionStatus.question",
                    model: "Question"
                });

                if (!team) {
                    if (callback) callback({ success: false, error: "Team not found" });
                    return socket.emit("error", "Team not found");
                }

                // 4. Fetch session to get isPaused status
                const session = await TheUltimateChallenge.findById(team.session);
                if (!session) {
                    if (callback) callback({ success: false, error: "Session not found" });
                    return socket.emit("error", "Session not found");
                }

                // 5. Format response with complete question details
                const questionData = team.questionStatus.map(q => ({
                    id: q.question._id,
                    text: q.question.text,
                    level: q.question.level,
                    category: q.question.category,
                    answerType: q.question.answerType,
                    correctAnswer: q.question.correctAnswer,
                    questionImageUrl: q.question.questionImageUrl,
                    points: q.question.points,
                    difficulty: q.question.difficulty,
                    status: q.status,
                    currentPlayer: q.currentPlayer,
                    pointsEarned: q.pointsEarned,
                    answerUrl: q.answerUrl
                }));

                const payload = {
                    teamInfo: {
                        name: team.name,
                        currentLevel: session.currentLevel,
                        teamScore: team.teamScore,
                        caption: team.caption,
                        isPaused: session.isPaused
                    },
                    questions: questionData
                };

                socket.emit("team-data", payload);
                if (callback) callback({ success: true, data: payload });

            } catch (err) {
                console.error("Team data error:", err);
                const errorMsg = err.message || "Failed to retrieve team data";
                socket.emit("error", errorMsg);
                if (callback) callback({ success: false, error: errorMsg });
            }
        });

        socket.on("start-question", async (data, callback) => {
            try {
                // 1. Extract JWT from cookie
                const cookies = socket.handshake.headers.cookie;
                if (!cookies) {
                    if (callback) callback({ success: false, error: "No cookies found" });
                    return socket.emit("error", "No cookies found");
                }
                
                const parsedCookies = cookie.parse(cookies);
                const token = parsedCookies.token;
                
                if (!token) {
                    if (callback) callback({ success: false, error: "JWT token missing in cookie" });
                    return socket.emit("error", "JWT token missing in cookie");
                }

                // 2. Verify JWT
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const playerId = decoded.playerId;

                // 3. Get player and team
                const player = await Player.findById(playerId);
                if (!player) {
                    if (callback) callback({ success: false, error: "Player not found" });
                    return socket.emit("error", "Player not found");
                }

                const team = await Team.findById(player.team);
                if (!team) {
                    if (callback) callback({ success: false, error: "Team not found" });
                    return socket.emit("error", "Team not found");
                }

                // 4. Fetch session to get isPaused status
                const session = await TheUltimateChallenge.findById(team.session);
                if (!session) {
                    if (callback) callback({ success: false, error: "Session not found" });
                    return socket.emit("error", "Session not found");
                }

                // 5. Update question status to "attending"
                const questionStatus = team.questionStatus.find(
                    qs => qs.question.toString() === data.questionId
                );

                if (!questionStatus) {
                    if (callback) callback({ success: false, error: "Question not found for this team" });
                    return socket.emit("error", "Question not found for this team");
                }

                // Update status and set current player
                questionStatus.status = "attending";
                questionStatus.currentPlayer = playerId;

                await team.save();

                // 6. Emit updated team data to all team members
                const teamPlayers = await Player.find({ team: team._id });
                const teamSocketIds = teamPlayers.map(p => p.socketId).filter(id => id);
                
                // Get updated team data
                const updatedTeam = await Team.findById(team._id).populate({
                    path: "questionStatus.question",
                    model: "Question"
                });

                // Format response
                const questionData = updatedTeam.questionStatus.map(q => ({
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

                const payload = {
                    teamInfo: {
                        name: updatedTeam.name,
                        currentLevel: session.currentLevel,
                        teamScore: updatedTeam.teamScore,
                        caption: updatedTeam.caption,
                        isPaused: session.isPaused
                    },
                    questions: questionData
                };

                // Emit to all team members
                teamSocketIds.forEach(socketId => {
                    io.to(socketId).emit("team-data", payload);
                });

                // 7. Emit all-teams-data to admin
                const teams = await Team.find({ session: session._id }).populate({
                    path: "questionStatus.question",
                    model: "Question"
                });

                const teamData = await Promise.all(teams.map(async (t) => {
                    const players = await Player.find({ team: t._id });
                    const qData = t.questionStatus.map(q => ({
                        id: q.question._id,
                        text: q.question.text,
                        level: q.question.level,
                        category: q.question.category,
                        answerType: q.question.answerType,
                        questionImageUrl: q.question.questionImageUrl,
                        points: q.question.points,
                        difficulty: q.question.difficulty,
                        status: q.status,
                        currentPlayer: q.currentPlayer,
                        pointsEarned: q.pointsEarned,
                        answerUrl: q.answerUrl,
                        submittedAnswer: q.submittedAnswer
                    }));

                    return {
                        teamInfo: {
                            id: t._id,
                            name: t.name,
                            currentLevel: session.currentLevel,
                            teamScore: t.teamScore,
                            caption: t.caption,
                            isPaused: session.isPaused
                        },
                        players: players.map(p => ({
                            id: p._id,
                            name: p.name,
                            isCaption: p.isCaption
                        })),
                        questions: qData
                    };
                }));

                const allTeamsPayload = {
                    sessionId: session._id,
                    isPaused: session.isPaused,
                    currentLevel: session.currentLevel,
                    teams: teamData
                };

                // Find admin and emit to their socket
                const admin = await Admin.findOne({ session: session._id });
                if (admin && admin.socketId) {
                    io.to(admin.socketId).emit("all-teams-data", allTeamsPayload);
                }

                if (callback) callback({ success: true });

            } catch (err) {
                console.error("Error starting question:", err);
                const errorMsg = err.message || "Failed to start question";
                socket.emit("error", errorMsg);
                if (callback) callback({ success: false, error: errorMsg });
            }
        });

        socket.on("reset-question-status", async (data, callback) => {
            try {
                // 1. Extract JWT from cookie
                const cookies = socket.handshake.headers.cookie;
                if (!cookies) {
                    if (callback) callback({ success: false, error: "No cookies found" });
                    return socket.emit("error", "No cookies found");
                }

                const parsedCookies = cookie.parse(cookies);
                const token = parsedCookies.token;

                if (!token) {
                    if (callback) callback({ success: false, error: "JWT token missing in cookie" });
                    return socket.emit("error", "JWT token missing in cookie");
                }

                // 2. Verify JWT
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const playerId = decoded.playerId;

                // 3. Get player and team
                const player = await Player.findById(playerId);
                if (!player) {
                    if (callback) callback({ success: false, error: "Player not found" });
                    return socket.emit("error", "Player not found");
                }

                const team = await Team.findById(player.team);
                if (!team) {
                    if (callback) callback({ success: false, error: "Team not found" });
                    return socket.emit("error", "Team not found");
                }

                // 4. Fetch session to get isPaused status
                const session = await TheUltimateChallenge.findById(team.session);
                if (!session) {
                    if (callback) callback({ success: false, error: "Session not found" });
                    return socket.emit("error", "Session not found");
                }

                // 5. Update question status to "available"
                const questionStatus = team.questionStatus.find(
                    qs => qs.question.toString() === data.questionId
                );

                if (!questionStatus) {
                    if (callback) callback({ success: false, error: "Question not found for this team" });
                    return socket.emit("error", "Question not found for this team");
                }

                if (questionStatus.status !== "done") {
                    questionStatus.status = "available";
                }

                // Update status and clear current player
                questionStatus.currentPlayer = null;

                await team.save();

                // 6. Emit updated team data to all team members
                const teamPlayers = await Player.find({ team: team._id });
                const teamSocketIds = teamPlayers.map(p => p.socketId).filter(id => id);

                // Get updated team data
                const updatedTeam = await Team.findById(team._id).populate({
                    path: "questionStatus.question",
                    model: "Question"
                });

                // Format response
                const questionData = updatedTeam.questionStatus.map(q => ({
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

                const payload = {
                    teamInfo: {
                        name: updatedTeam.name,
                        currentLevel: session.currentLevel,
                        teamScore: updatedTeam.teamScore,
                        caption: updatedTeam.caption,
                        isPaused: session.isPaused
                    },
                    questions: questionData
                };

                // Emit to all team members
                teamSocketIds.forEach(socketId => {
                    io.to(socketId).emit("team-data", payload);
                });

                // 7. Emit all-teams-data to admin
                const teams = await Team.find({ session: session._id }).populate({
                    path: "questionStatus.question",
                    model: "Question"
                });

                const teamData = await Promise.all(teams.map(async (t) => {
                    const players = await Player.find({ team: t._id });
                    const qData = t.questionStatus.map(q => ({
                        id: q.question._id,
                        text: q.question.text,
                        level: q.question.level,
                        category: q.question.category,
                        answerType: q.question.answerType,
                        questionImageUrl: q.question.questionImageUrl,
                        points: q.question.points,
                        difficulty: q.question.difficulty,
                        status: q.status,
                        currentPlayer: q.currentPlayer,
                        pointsEarned: q.pointsEarned,
                        answerUrl: q.answerUrl,
                        submittedAnswer: q.submittedAnswer
                    }));

                    return {
                        teamInfo: {
                            id: t._id,
                            name: t.name,
                            currentLevel: session.currentLevel,
                            teamScore: t.teamScore,
                            caption: t.caption,
                            isPaused: session.isPaused
                        },
                        players: players.map(p => ({
                            id: p._id,
                            name: p.name,
                            isCaption: p.isCaption
                        })),
                        questions: qData
                    };
                }));

                const allTeamsPayload = {
                    sessionId: session._id,
                    isPaused: session.isPaused,
                    currentLevel: session.currentLevel,
                    teams: teamData
                };

                // Find admin and emit to their socket
                const admin = await Admin.findOne({ session: session._id });
                if (admin && admin.socketId) {
                    io.to(admin.socketId).emit("all-teams-data", allTeamsPayload);
                }

                if (callback) callback({ success: true });

            } catch (err) {
                console.error("Error resetting question status:", err);
                const errorMsg = err.message || "Failed to reset question status";
                socket.emit("error", errorMsg);
                if (callback) callback({ success: false, error: errorMsg });
            }
        });

        socket.on("toggle-session-pause", async (data, callback) => {
            try {
                // 1. Verify admin token
                const cookies = socket.handshake.headers.cookie;
                if (!cookies) {
                    return callback({ success: false, error: "No cookies found" });
                }
                
                const parsedCookies = cookie.parse(cookies);
                const token = parsedCookies.adminToken;
                
                if (!token) {
                    return callback({ success: false, error: "Admin token missing" });
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                // 2. Get the session
                const session = await TheUltimateChallenge.findById(decoded.sessionId);
                if (!session) {
                    return callback({ success: false, error: "Session not found" });
                }

                // 3. Set the pause status based on provided data
                if (typeof data.isPaused !== 'boolean') {
                    return callback({ success: false, error: "Invalid isPaused value" });
                }
                session.isPaused = data.isPaused;
                await session.save();

                // 4. Emit to all players and admin in this session
                const teams = await Team.find({ session: session._id });
                const teamIds = teams.map(team => team._id);
                const players = await Player.find({ team: { $in: teamIds } });
                const playerSocketIds = players.map(p => p.socketId).filter(id => id);

                // Emit to all players
                playerSocketIds.forEach(socketId => {
                    io.to(socketId).emit("session-pause-updated", { 
                        isPaused: session.isPaused 
                    });
                });

                // Also notify admin
                const admin = await Admin.findById(decoded.adminId);
                if (admin && admin.socketId) {
                    io.to(admin.socketId).emit("session-pause-updated", { 
                        isPaused: session.isPaused 
                    });
                }

                // 5. Notify all-teams-data listeners
                const teamData = await Promise.all(teams.map(async (team) => {
                    const players = await Player.find({ team: team._id });
                    const questionData = team.questionStatus.map(q => ({
                        id: q.question._id,
                        text: q.question.text,
                        level: q.question.level,
                        category: q.question.category,
                        answerType: q.question.answerType,
                        questionImageUrl: q.question.questionImageUrl,
                        points: q.question.points,
                        difficulty: q.question.difficulty,
                        status: q.status,
                        currentPlayer: q.currentPlayer,
                        pointsEarned: q.pointsEarned,
                        answerUrl: q.answerUrl,
                        submittedAnswer: q.submittedAnswer
                    }));

                    return {
                        teamInfo: {
                            id: team._id,
                            name: team.name,
                            currentLevel: session.currentLevel,
                            teamScore: team.teamScore,
                            caption: team.caption,
                            isPaused: session.isPaused
                        },
                        players: players.map(p => ({
                            id: p._id,
                            name: p.name,
                            isCaption: p.isCaption
                        })),
                        questions: questionData
                    };
                }));

                const allTeamsPayload = {
                    sessionId: decoded.sessionId,
                    isPaused: session.isPaused,
                    currentLevel: session.currentLevel,
                    teams: teamData
                };

                // Emit to admin
                if (admin && admin.socketId) {
                    io.to(admin.socketId).emit("all-teams-data", allTeamsPayload);
                }

                callback({ success: true, isPaused: session.isPaused });

            } catch (err) {
                console.error("Error toggling session pause:", err);
                callback({ success: false, error: err.message });
            }
        });

        socket.on("request-all-teams-data", async (callback) => {
            try {
                // 1. Extract JWT from cookie
                const cookies = socket.handshake.headers.cookie;
                if (!cookies) {
                    if (callback) callback({ success: false, error: "No cookies found" });
                    return socket.emit("error", "No cookies found");
                }

                const parsedCookies = cookie.parse(cookies);
                const token = parsedCookies.adminToken;

                if (!token) {
                    if (callback) callback({ success: false, error: "Admin token missing" });
                    return socket.emit("error", "Admin token missing");
                }

                // 2. Verify JWT
                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                // 3. Fetch session
                const session = await TheUltimateChallenge.findById(decoded.sessionId);
                if (!session) {
                    if (callback) callback({ success: false, error: "Session not found" });
                    return socket.emit("error", "Session not found");
                }

                // 4. Fetch all teams for the session
                const teams = await Team.find({ session: decoded.sessionId }).populate({
                    path: "questionStatus.question",
                    model: "Question"
                });

                if (!teams || teams.length === 0) {
                    if (callback) callback({ success: false, error: "No teams found for this session" });
                    return socket.emit("error", "No teams found for this session");
                }

                // 5. Fetch players for each team
                const teamData = await Promise.all(teams.map(async (team) => {
                    const players = await Player.find({ team: team._id });
                    const questionData = team.questionStatus.map(q => ({
                        id: q.question._id,
                        text: q.question.text,
                        level: q.question.level,
                        category: q.question.category,
                        answerType: q.question.answerType,
                        questionImageUrl: q.question.questionImageUrl,
                        points: q.question.points,
                        difficulty: q.question.difficulty,
                        status: q.status,
                        currentPlayer: q.currentPlayer,
                        pointsEarned: q.pointsEarned,
                        answerUrl: q.answerUrl,
                        submittedAnswer: q.submittedAnswer
                    }));

                    return {
                        teamInfo: {
                            id: team._id,
                            name: team.name,
                            currentLevel: session.currentLevel,
                            teamScore: team.teamScore,
                            caption: team.caption,
                            isPaused: session.isPaused
                        },
                        players: players.map(p => ({
                            id: p._id,
                            name: p.name,
                            isCaption: p.isCaption
                        })),
                        questions: questionData
                    };
                }));

                // 6. Emit all teams data to admin
                const payload = {
                    sessionId: decoded.sessionId,
                    isPaused: session.isPaused,
                    teams: teamData
                };

                socket.emit("all-teams-data", payload);
                if (callback) callback({ success: true, data: payload });

            } catch (err) {
                console.error("Error retrieving all teams data:", err);
                const errorMsg = err.message || "Failed to retrieve teams data";
                socket.emit("error", errorMsg);
                if (callback) callback({ success: false, error: errorMsg });
            }
        });

        socket.on('disconnect', async () => {
            console.log('A user disconnected', socket.id);

            try {
                const player = await Player.findOne({ socketId: socket.id });
                if (!player) return;

                const team = await Team.findById(player.team).populate({
                    path: "questionStatus.question",
                    model: "Question"
                });
                if (!team) return;

                // Fetch session to get isPaused status
                const session = await TheUltimateChallenge.findById(team.session);
                if (!session) {
                    console.error("Session not found during disconnect");
                    return;
                }

                let updated = false;

                // Check and reset any "attending" question by this player
                for (let q of team.questionStatus) {
                    if (q.status === 'attending' && q.currentPlayer?.toString() === player._id.toString()) {
                        q.status = 'available';
                        q.currentPlayer = null;
                        updated = true;
                    }
                }

                if (updated) {
                    await team.save();

                    // Notify all team members
                    const teamPlayers = await Player.find({ team: team._id });
                    const teamSocketIds = teamPlayers.map(p => p.socketId).filter(id => id);

                    const questionData = team.questionStatus.map(q => ({
                        id: q.question._id,
                        text: q.question.text,
                        level: q.question.level,
                        category: q.question.category,
                        answerType: q.question.answerType,
                        correctAnswer: q.question.correctAnswer,
                        questionImageUrl: q.question.questionImageUrl,
                        points: q.question.points,
                        difficulty: q.question.difficulty,
                        status: q.status,
                        currentPlayer: q.currentPlayer,
                        pointsEarned: q.pointsEarned,
                        answerUrl: q.answerUrl
                    }));

                    const payload = {
                        teamInfo: {
                            name: team.name,
                            currentLevel: session.currentLevel,
                            teamScore: team.teamScore,
                            caption: team.caption,
                            isPaused: session.isPaused
                        },
                        questions: questionData
                    };

                    teamSocketIds.forEach(socketId => {
                        io.to(socketId).emit("team-data", payload);
                    });
                }

            } catch (err) {
                console.error("Error during disconnect cleanup:", err);
            }
        });

    });
}

module.exports = { setupSocket, ioInstance };