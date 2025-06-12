const Team = require("../../../theUltimateChallenge/models/teamSchema");
const TheUltimateChallenge = require("../../../theUltimateChallenge/models/TheUltimateChallenge");
const Player = require("../../../theUltimateChallenge/models/playerSchema");
const Admin = require("../models/adminSchema");

const updateQuestionStatus = async (req, res) => {
  try {
    const io = req.app.get("socketService"); // Use socketService from app
    const { teamId, changes } = req.body;

    // Validate input
    if (!teamId || !changes || !Array.isArray(changes) || changes.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Team ID and changes array are required",
      });
    }

    // Validate each change object
    for (const change of changes) {
      if (!change.questionId || !change.newStatus) {
        return res.status(400).json({
          success: false,
          error: "Each change must have questionId and newStatus",
        });
      }
      if (!['available', 'attending'].includes(change.newStatus)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status. Must be 'available' or 'attending'",
        });
      }
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

    // Process each change
    const updatedQuestions = [];
    const errors = [];

    for (const change of changes) {
      try {
        // Find the question status
        const questionStatus = team.questionStatus.find(
          (qs) => qs.question._id.toString() === change.questionId
        );
        
        if (!questionStatus) {
          errors.push(`Question ${change.questionId} not found for this team`);
          continue;
        }

        // Only allow changes from 'attending' status
        if (questionStatus.status !== "attending") {
          errors.push(`Question ${change.questionId} is not in attending status`);
          continue;
        }

        // Update status
        const oldStatus = questionStatus.status;
        questionStatus.status = change.newStatus;
        
        // Clear current player if setting to available
        if (change.newStatus === 'available') {
          questionStatus.currentPlayer = null;
        }

        updatedQuestions.push({
          questionId: change.questionId,
          oldStatus,
          newStatus: change.newStatus,
          question: questionStatus.question
        });

      } catch (error) {
        errors.push(`Error updating question ${change.questionId}: ${error.message}`);
      }
    }

    // If there are errors and no successful updates, return error
    if (errors.length > 0 && updatedQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No questions could be updated",
        details: errors,
      });
    }

    // Save the team with all changes
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
        currentLevel: session.currentLevel,
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

    // Emit question-status-changed-by-admin for each updated question
    updatedQuestions.forEach((update) => {
      const questionStatusPayload = {
        teamId: team._id,
        questionId: update.questionId,
        status: update.newStatus,
        message: `Question ${update.questionId} status changed to ${update.newStatus} by admin`,
      };
      teamSocketIds.forEach((socketId) => {
        io.to(socketId).emit("question-status-changed-by-admin", questionStatusPayload);
      });
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
            currentLevel: session.currentLevel,
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

    // Prepare response
    const response = {
      success: true,
      message: `Successfully updated ${updatedQuestions.length} question(s)`,
      updated: updatedQuestions.map(u => ({
        questionId: u.questionId,
        newStatus: u.newStatus
      }))
    };

    // Include errors if any (partial success)
    if (errors.length > 0) {
      response.warnings = errors;
      response.message += ` with ${errors.length} error(s)`;
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error("Error updating multiple question statuses:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update question statuses",
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
        currentLevel: session.currentLevel,
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


const getTeamPlayersInfo=async(req,res)=>{
  try {
    const { teamId } = req.query;

    if (!teamId) {
      return res.status(400).json({ success: false, error: "Team ID is required" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, error: "Team not found" });
    }

    const players = await Player.find({ team: team._id }).select('name');

    res.status(200).json({ success: true, data:players });
  } catch (error) {
    console.error("Error fetching team players info:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = { updateQuestionStatus,updateTeamScore,getTeamPlayersInfo };