const Team = require('../models/teamSchema');
const Player = require('../models/playerSchema');
const Question = require('../models/questionSchema');
const TheUltimateChallenge = require('../models/TheUltimateChallenge');
const Admin = require('../../adminstrators/admin/models/adminSchema');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sharp = require('sharp');
const { uploadFile } = require('../../../services/s3/s3Service');

// Helper function to emit all teams data to admin
const emitAllTeamsData = async (sessionId, io) => {
  try {
    // Fetch session
    const session = await TheUltimateChallenge.findById(sessionId);
    if (!session) {
      console.error('Session not found for emitting team data');
      return;
    }

    // Fetch all teams for the session
    const teams = await Team.find({ session: sessionId }).populate({
      path: 'questionStatus.question',
      model: 'Question',
    });

    if (!teams || teams.length === 0) {
      console.error('No teams found for session:', sessionId);
      return;
    }

    // Fetch players for each team and format data
    const teamData = await Promise.all(
      teams.map(async (team) => {
        const players = await Player.find({ team: team._id });
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

        return {
          teamInfo: {
            id: team._id,
            name: team.name,
            currentLevel: session.currentLevel,
            teamScore: team.teamScore,
            caption: team.caption,
            isPaused: session.isPaused,
            showScorecard: session.showScorecard || false,
          },
          players: players.map((p) => ({
            id: p._id,
            name: p.name,
            isCaption: p.isCaption,
          })),
          questions: questionData,
        };
      })
    );

    // Fetch admin for the session
    const admin = await Admin.findOne({ session: sessionId });
    if (!admin || !admin.socketId) {
      console.error('Admin or admin socketId not found for session:', sessionId);
      return;
    }

    // Emit to admin
    const payload = {
      sessionId,
      isPaused: session.isPaused,
      showScorecard: session.showScorecard || false,
      teams: teamData,
    };
    io.to(admin.socketId).emit('all-teams-data', payload);

    // If scorecard sharing is enabled, broadcast updated leaderboard to all players in the session
    if (session.showScorecard) {
      const sorted = teams.map(t => ({
        id: t._id.toString(),
        name: t.name,
        score: t.teamScore || 0
      })).sort((a, b) => b.score - a.score);

      let currentRank = 0;
      let prevScore = null;
      const leaderboard = sorted.map((t) => {
        if (t.score !== prevScore) {
          currentRank++;
          prevScore = t.score;
        }
        return {
          ...t,
          rank: currentRank
        };
      });

      const teamIds = teams.map(team => team._id);
      const playersList = await Player.find({ team: { $in: teamIds } });
      const playerSocketIds = playersList.map(p => p.socketId).filter(id => id);

      playerSocketIds.forEach(socketId => {
        io.to(socketId).emit("scorecard-visibility-updated", {
          showScorecard: true,
          leaderboard
        });
      });
    }
  } catch (err) {
    console.error('Error emitting all teams data:', err);
  }
};

// Helper function to emit team data to all players in the team
const emitTeamDataToPlayers = async (teamId, sessionId, io) => {
  try {
    const team = await Team.findById(teamId).populate({
      path: 'questionStatus.question',
      model: 'Question',
    });
    if (!team) {
      console.error('Team not found for emitting team data:', teamId);
      return;
    }

    const session = await TheUltimateChallenge.findById(sessionId);
    if (!session) {
      console.error('Session not found for emitting team data:', sessionId);
      return;
    }

    const players = await Player.find({ team: team._id });
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

    const payload = {
      teamInfo: {
        name: team.name,
        currentLevel: session.currentLevel,
        teamScore: team.teamScore,
        caption: team.caption,
        isPaused: session.isPaused,
        showScorecard: session.showScorecard || false,
      },
      questions: questionData,
    };

    const teamSocketIds = players.map((p) => p.socketId).filter((id) => id);
    teamSocketIds.forEach((socketId) => {
      io.to(socketId).emit('team-data', payload);
    });
  } catch (err) {
    console.error('Error emitting team data to players:', err);
  }
};

const uploadFileAnswer = async (req, res) => {
  try {
    // Verify token
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const playerId = decoded.playerId;
    const { questionId } = req.body;

    // Validate input
    if (!req.file || !questionId) {
      return res.status(400).json({ error: 'File and questionId are required' });
    }

    // Fetch player, team, and question
    const player = await Player.findById(playerId).populate('team');
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const team = await Team.findById(player.team._id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    // Find question status in team
    const questionStatus = team.questionStatus.find((q) => q.question.equals(questionId));
    if (!questionStatus) return res.status(404).json({ error: 'Question not assigned to team' });
    if (questionStatus.status === 'done') return res.status(400).json({ error: 'Question already answered' });

    // Image compression (if applicable)
    if (req.file && req.file.mimetype.startsWith('image/')) {
      try {
        let quality = 90;
        let compressedBuffer;

        do {
          compressedBuffer = await sharp(req.file.buffer)
            .jpeg({ quality })
            .toBuffer();
          quality -= 10;
        } while (compressedBuffer.length > 2 * 1024 * 1024 && quality > 10);

        req.file.buffer = compressedBuffer;
        req.file.size = compressedBuffer.length;
      } catch (error) {
        console.log('Image compression error:', error);
        return res.status(400).json({ error: 'Image compression failed' });
      }
    }

    // Upload file to S3 with progress tracking
    const file = req.file;
    const fileExtension = file.originalname.split('.').pop();
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const s3Key = `answers/${player.session}/Team-${team.name}-Player-${player.name}-${uniqueId}.${fileExtension}`;
    // Optional: If you want to emit progress via Socket.IO to the client
    const io = req.app.get("socketService");
    const socketId = req.headers['x-socket-id']; // Client should send their socket ID

    // Upload with progress tracking callback
    const uploadResult = await uploadFile({
      fileBuffer: file.buffer,
      key: s3Key,
      contentType: file.mimetype,
      onProgress: io && socketId ? (progress) => {
        io.to(socketId).emit('upload-progress', {
          questionId,
          progress: progress.percentCompleted,
          loaded: progress.loaded,
          total: progress.total
        });
      } : null
    });

    const answerUrl = uploadResult.Location;
    const pointsEarned = question.points;

    // Update team questionStatus and score
    await Team.updateOne(
      { _id: team._id, 'questionStatus.question': questionId },
      {
        $set: {
          'questionStatus.$.status': 'done',
          'questionStatus.$.answerUrl': answerUrl,
          'questionStatus.$.pointsEarned': pointsEarned,
        },
        $inc: {
          teamScore: pointsEarned,
        },
      }
    );

    // Emit updated team data to admin and players
    await emitAllTeamsData(team.session, io);
    await emitTeamDataToPlayers(team._id, team.session, io);

    res.status(200).json({
      success: true,
      message: 'File uploaded and marked done',
      url: answerUrl,
      pointsEarned,
      isCorrect: true,
    });
  } catch (err) {
    console.error('File upload error:', err);

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large' });
    }

    res.status(500).json({ error: 'Upload failed' });
  }
};

const submitTextAnswer = async (req, res) => {
  try {
    // Verify token
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const playerId = decoded.playerId;
    const { questionId, answer } = req.body;

    // Validate input
    if (!questionId || !answer) {
      return res.status(400).json({ error: 'questionId and answer are required' });
    }

    // Fetch player, team, and question
    const player = await Player.findById(playerId).populate('team');
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const session = await TheUltimateChallenge.findById(player.session);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const team = await Team.findById(player.team._id);
    if (!team) return res.status(404).json({ error: 'Team not found' });



    // Find question status in team
    const questionStatus = team.questionStatus.find((q) => q.question.equals(questionId));
    if (!questionStatus) return res.status(404).json({ error: 'Question not assigned to team' });
    if (questionStatus.status === 'done') return res.status(400).json({ error: 'Question already answered' });

    // Check if answer is correct
    const isCorrect =
      question.correctAnswer &&
      question.correctAnswer.toLowerCase().trim() === answer.toLowerCase().trim();
    const pointsEarned = isCorrect ? question.points : -10; // Deduct 10 points for wrong answer

    // Update team questionStatus and score
    await Team.updateOne(
      { _id: team._id, 'questionStatus.question': questionId },
      {
        $set: {
          'questionStatus.$.status': isCorrect ? "done" : "attending", // Set to 'done' regardless of correctness
          'questionStatus.$.pointsEarned': pointsEarned,
          'questionStatus.$.submittedAnswer': answer.trim(),
          'questionStatus.$.currentPlayer': playerId,
        },
        $inc: {
          teamScore: pointsEarned,
        },
      }
    );


    // Emit updated team data to admin and players
    const io = req.app.get("socketService");
    await emitAllTeamsData(team.session, io);
    await emitTeamDataToPlayers(team._id, team.session, io);

    return res.status(200).json({
      success: true,
      isCorrect,
      pointsEarned,
      message: isCorrect ? 'Correct answer!' : 'Incorrect answer, 10 points deducted',
    });
  } catch (err) {
    console.error('Text answer submission error:', err);
    return res.status(500).json({ error: 'Failed to submit answer' });
  }
};

const requestManualVerification = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const playerId = decoded.playerId;
    const { questionId } = req.body;

    if (!questionId) {
      return res.status(400).json({ error: 'questionId is required' });
    }

    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const team = await Team.findById(player.team).populate({
      path: 'questionStatus.question',
      model: 'Question'
    });
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const session = await TheUltimateChallenge.findById(team.session);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const questionStatus = team.questionStatus.find(
      qs => qs.question._id.toString() === questionId
    );
    if (!questionStatus) return res.status(404).json({ error: 'Question not found for team' });
    if (questionStatus.status === 'done') {
      return res.status(400).json({ error: 'Question already completed' });
    }

    // Update status and track requesting player
    questionStatus.status = 'pending_verification';
    questionStatus.currentPlayer = playerId;
    await team.save();

    const questionDoc = questionStatus.question;
    const io = req.app.get("socketService");

    if (io) {
      // Emit all-teams-data and manual-verification-request to admin
      await emitAllTeamsData(session._id, io);

      const admin = await Admin.findOne({ session: session._id });
      if (admin && admin.socketId) {
        io.to(admin.socketId).emit('manual-verification-request', {
          teamId: team._id,
          teamName: team.name,
          questionId: questionDoc._id,
          questionText: questionDoc.text,
          points: questionDoc.points,
        });
      }

      // Emit updated team data to players in the team
      await emitTeamDataToPlayers(team._id, session._id, io);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error requesting manual verification:', err);
    return res.status(500).json({ error: err.message || 'Failed to request manual verification' });
  }
};

module.exports = { uploadFileAnswer, submitTextAnswer, requestManualVerification, emitTeamDataToPlayers };