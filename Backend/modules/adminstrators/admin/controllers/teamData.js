const Team = require("../../../theUltimateChallenge/models/teamSchema");
const TheUltimateChallenge = require("../../../theUltimateChallenge/models/TheUltimateChallenge");
const Player = require("../../../theUltimateChallenge/models/playerSchema");
const Admin = require("../models/adminSchema");

const updateQuestionStatus = async (req, res) => {
  try {
    const io = req.app.get("socketService"); // Use socketService from app
    const { teamId, questionId } = req.body;

    // Validate input
    if (!teamId || !questionId) {
      return res.status(400).json({
        success: false,
        error: "Team ID and Question ID are required",
      });
    }

    // Find the team
    const team = await Team.findById(teamId).populate({
      path: "questionStatus.question",
      model: "Question",
    });
    if (!team) {
      return res.status(404).json({
        success: false,
        error: "Team not found",
      });
    }

    // Find the session
    const session = await TheUltimateChallenge.findById(team.session);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    // Find and update the question status
    const questionStatus = team.questionStatus.find(
      (qs) => qs.question._id.toString() === questionId
    );
    if (!questionStatus) {
      return res.status(404).json({
        success: false,
        error: "Question not found for this team",
      });
    }

    if (questionStatus.status !== "attending") {
      return res.status(400).json({
        success: false,
        error: "Question is not in attending status",
      });
    }

    // Update status to available and clear current player
    questionStatus.status = "available";
    questionStatus.currentPlayer = null;

    await team.save();

    // Prepare team-data payload
    const questionData = team.questionStatus.map((q) => ({
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
      submittedAnswer: q.submittedAnswer,
    }));

    const teamPayload = {
      teamInfo: {
        name: team.name,
        currentLevel: team.currentLevel,
        teamScore: team.teamScore,
        caption: team.caption,
        isPaused: session.isPaused,
      },
      questions: questionData,
    };

    // Fetch team players and socket IDs
    const teamPlayers = await Player.find({ team: team._id });
    const teamSocketIds = teamPlayers.map((p) => p.socketId).filter((id) => id);

    // Emit team-data to all team members
    teamSocketIds.forEach((socketId) => {
      io.to(socketId).emit("team-data", teamPayload);
    });

    // Emit question-status-changed-by-admin to all team members
    const questionStatusPayload = {
      teamId: team._id,
      questionId: questionStatus.question._id,
      status: questionStatus.status,
      message: `Question ${questionStatus.question._id} status changed to available by admin`,
    };
    teamSocketIds.forEach((socketId) => {
      io.to(socketId).emit("question-status-changed-by-admin", questionStatusPayload);
    });

    // Prepare all-teams-data payload
    const teams = await Team.find({ session: session._id }).populate({
      path: "questionStatus.question",
      model: "Question",
    });

    const allTeamsData = await Promise.all(
      teams.map(async (t) => {
        const players = await Player.find({ team: t._id });
        const qData = t.questionStatus.map((q) => ({
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
          submittedAnswer: q.submittedAnswer,
        }));

        return {
          teamInfo: {
            id: t._id,
            name: t.name,
            currentLevel: t.currentLevel,
            teamScore: t.teamScore,
            caption: t.caption,
            isPaused: session.isPaused,
          },
          players: players.map((p) => ({
            id: p._id,
            name: p.name,
            isCaption: p.isCaption,
          })),
          questions: qData,
        };
      })
    );

    const allTeamsPayload = {
      sessionId: session._id,
      isPaused: session.isPaused,
      currentLevel: session.currentLevel,
      teams: allTeamsData,
    };

    // Emit all-teams-data to admin
    const admin = await Admin.findOne({ session: session._id });
    if (admin && admin.socketId) {
      io.to(admin.socketId).emit("all-teams-data", allTeamsPayload);
    }

    return res.status(200).json({
      success: true,
      message: "Question status updated successfully",
    });
  } catch (error) {
    console.error("Error updating question status:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update question status",
    });
  }
};

const updateTeamScore = async (req, res) => {
  try {
    const io = req.app.get("socketService"); // Access socket.io instance
    const { teamId, scoreChange } = req.body;

    // Validate input
    if (!teamId || isNaN(scoreChange)) {
      return res.status(400).json({ success: false, error: "Invalid teamId or scoreChange" });
    }

    // Find the team
    const team = await Team.findById(teamId).populate({
      path: "questionStatus.question",
      model: "Question"
    });
    if (!team) {
      return res.status(404).json({ success: false, error: "Team not found" });
    }

    // Update team score
    team.teamScore = (team.teamScore || 0) + parseInt(scoreChange);
    await team.save();

    // Fetch session to get isPaused status
    const session = await TheUltimateChallenge.findById(team.session);
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    // Prepare team-data payload
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

    const teamPayload = {
      teamInfo: {
        id: team._id,
        name: team.name,
        currentLevel: team.currentLevel,
        teamScore: team.teamScore,
        caption: team.caption,
        isPaused: session.isPaused
      },
      questions: questionData
    };

    // Fetch team players and emit team-data and admin-updated-total-score to them
    const teamPlayers = await Player.find({ team: team._id });
    const teamSocketIds = teamPlayers.map(p => p.socketId).filter(id => id);
    teamSocketIds.forEach(socketId => {
      io.to(socketId).emit("team-data", teamPayload);
      io.to(socketId).emit("admin-updated-total-score", { teamId: team._id, teamScore: team.teamScore });
    });

    // Prepare all-teams-data payload
    const teams = await Team.find({ session: session._id }).populate({
      path: "questionStatus.question",
      model: "Question"
    });

    const allTeamsData = await Promise.all(teams.map(async (t) => {
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
          currentLevel: t.currentLevel,
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
      teams: allTeamsData
    };

    // Emit all-teams-data to admin
    const admin = await Admin.findOne({ session: session._id });
    if (admin && admin.socketId) {
      io.to(admin.socketId).emit("all-teams-data", allTeamsPayload);
    }

    res.status(200).json({ success: true, teamScore: team.teamScore });
  } catch (err) {
    console.error("Error updating team score:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to update team score" });
  }
};

module.exports = { updateQuestionStatus,updateTeamScore };