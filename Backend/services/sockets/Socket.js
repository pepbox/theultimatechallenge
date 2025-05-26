const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const Player = require("../../modules/theUltimateChallenge/models/playerSchema");
const Team = require("../../modules/theUltimateChallenge/models/teamSchema");
const Question = require("../../modules/theUltimateChallenge/models/questionSchema");

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

                // 4. Format response with complete question details
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
                        currentLevel: team.currentLevel,
                        teamScore: team.teamScore,
                        caption: team.caption
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

                // 4. Update question status to "attending"
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

                // 5. Emit updated team data to all team members
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
                        currentLevel: updatedTeam.currentLevel,
                        teamScore: updatedTeam.teamScore,
                        caption: updatedTeam.caption
                    },
                    questions: questionData
                };

                // Emit to all team members
                teamSocketIds.forEach(socketId => {
                    io.to(socketId).emit("team-data", payload);
                });

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

                // 4. Update question status to "available"
                const questionStatus = team.questionStatus.find(
                    qs => qs.question.toString() === data.questionId
                );

                if (!questionStatus) {
                    if (callback) callback({ success: false, error: "Question not found for this team" });
                    return socket.emit("error", "Question not found for this team");
                }

              
                 if (!(questionStatus.status === "done")) {
                     
                      questionStatus.status = "available";
                    
                 }

                // Update status and clear current player
                questionStatus.currentPlayer = null;

                await team.save();

                // 5. Emit updated team data to all team members
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
                        currentLevel: updatedTeam.currentLevel,
                        teamScore: updatedTeam.teamScore,
                        caption: updatedTeam.caption
                    },
                    questions: questionData
                };

                // Emit to all team members
                teamSocketIds.forEach(socketId => {
                    io.to(socketId).emit("team-data", payload);
                });

                if (callback) callback({ success: true });

            } catch (err) {
                console.error("Error resetting question status:", err);
                const errorMsg = err.message || "Failed to reset question status";
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
                    currentLevel: team.currentLevel,
                    teamScore: team.teamScore,
                    caption: team.caption
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

module.exports = { setupSocket };