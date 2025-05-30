const jwt = require('jsonwebtoken');
const Player = require('../models/playerSchema');
const Team = require('../models/teamSchema');
const TheUltimateChallenge = require('../models/TheUltimateChallenge');
const Question = require('../models/questionSchema');
const Admin = require('../../adminstrators/admin/models/adminSchema');

const getNumberOfTeams = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required in the request body'
      });
    }

    const challengeSession = await TheUltimateChallenge.findById(sessionId)
      .select('numberOfTeams companyName')
      .lean();

    if (!challengeSession) {
      return res.status(404).json({
        success: false,
        message: 'Challenge session not found'
      });
    }

    res.status(200).json({
      success: true,
      companyName: challengeSession.companyName,
      numberOfTeams: challengeSession.numberOfTeams
    });

  } catch (error) {
    console.error('Error fetching number of teams:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching number of teams',
      error: error.message
    });
  }
};

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
            currentLevel: team.currentLevel,
            teamScore: team.teamScore,
            caption: team.caption,
            isPaused: session.isPaused,
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
      teams: teamData,
    };
    io.to(admin.socketId).emit('all-teams-data', payload);
  } catch (err) {
    console.error('Error emitting all teams data:', err);
  }
};

const joinSession = async (req, res) => {
  try {
    // Get io instance from app
    const io = req.app.get('socketService');
    if (!io) {
      return res.status(500).json({
        success: false,
        message: 'Socket.IO instance not found'
      });
    }

    // Validate required fields
    const { firstName, lastName, sessionId, socketId, teamName } = req.body;
    if (!firstName || !lastName || !sessionId || !teamName) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, session ID, and team name are required'
      });
    }

    const name = `${firstName} ${lastName}`;

    // Check for existing cookie
    const token = req.cookies?.token;
    if (token) {
      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const playerId = decoded.playerId;

        // Find existing player
        const player = await Player.findById(playerId).populate('team');
        if (player) {
          // Validate player details match request body
          const team = await Team.findById(player.team._id);
          if (!team) {
            return res.status(404).json({
              success: false,
              message: 'Team not found for existing player'
            });
          }

          const session = await TheUltimateChallenge.findById(sessionId);
          if (!session) {
            return res.status(404).json({
              success: false,
              message: 'Game session not found'
            });
          }

          const isMatching =
            player.name === name &&
            player.session.toString() === sessionId &&
            team.name === teamName;

          if (isMatching) {
            // Update socketId if provided
            if (socketId && player.socketId !== socketId) {
              player.socketId = socketId;
              await player.save();
            }

            // Generate new JWT token to refresh cookie
            const newToken = jwt.sign(
              { playerId: player._id },
              process.env.JWT_SECRET,
              { expiresIn: '1d' }
            );

            // Set new cookie
            res.cookie('token', newToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            // Emit all-team-data to admin
            await emitAllTeamsData(team.session, io);

            return res.status(200).json({
              success: true,
              message: 'Rejoined session with existing player',
              player: {
                _id: player._id,
                name: player.name,
                isCaption: player.isCaption,
                socketId: player.socketId
              },
              team: {
                _id: team._id,
                name: team.name
              }
            });
          }
          // If details don't match, proceed to create new user
        }
      } catch (error) {
        console.error('Invalid token:', error);
        // Continue with creating new player if token is invalid
      }
    }

    // Logic for creating new player
    // Check if session exists
    const session = await TheUltimateChallenge.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Game session not found'
      });
    }

    // Check if team exists or create new one
    let team = await Team.findOne({ 
      session: sessionId, 
      name: teamName 
    });

    let isCaptain = false;

    if (!team) {
      // Check team limit
      const existingTeamsCount = await Team.countDocuments({ session: sessionId });
      if (existingTeamsCount >= session.numberOfTeams) {
        return res.status(400).json({
          success: false,
          message: `Maximum number of teams (${session.numberOfTeams}) reached`
        });
      }

      // Create new team
      team = await Team.create({
        name: teamName,
        session: sessionId,
        caption: name
      });
      isCaptain = true;
    }

    // Create new player
    const player = await Player.create({
      name,
      session: sessionId,
      team: team._id,
      isCaption: isCaptain,
      socketId
    });

    // Initialize question status for team if new
    if (team.questionStatus.length === 0) {
      const questionStatus = [];
      
      // Add questions from all levels
      for (let level = 1; level <= session.numberOfLevels; level++) {
        const levelQuestions = session.selectedQuestions[level] || [];
        levelQuestions.forEach(questionId => {
          questionStatus.push({
            question: questionId,
            status: 'available'
          });
        });
      }

      team.questionStatus = questionStatus;
      await team.save();
    }

    // Generate JWT token
    const newToken = jwt.sign(
      { playerId: player._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Emit all-team-data to admin
    await emitAllTeamsData(sessionId, io);

    // Return player and team info
    res.status(201).json({
      success: true,
      player: {
        _id: player._id,
        name: player.name,
        isCaption: player.isCaption,
        socketId: player.socketId
      },
      team: {
        _id: team._id,
        name: team.name
      }
    });

  } catch (error) {
    console.error('Session join error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining game session',
      error: error.message
    });
  }
};

const updateSocketId = async (req, res) => {
  try {
    // Extract JWT token from cookie
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.playerId) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Extract socketId from request body
    const { socketId } = req.body;
    if (!socketId) {
      return res.status(400).json({ success: false, message: 'Socket ID is required' });
    }

    // Find and update player
    const player = await Player.findById(decoded.playerId);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    // Update socketId
    player.socketId = socketId;
    await player.save();

    return res.status(200).json({ 
      success: true,
      message: 'Socket ID updated successfully',
      player: {
        id: player._id,
        name: player.name,
        socketId: player.socketId
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    console.error('Error updating socket ID:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  getNumberOfTeams,
  joinSession,
  updateSocketId
};