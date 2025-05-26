const jwt = require('jsonwebtoken');
const Player = require('../models/playerSchema');
const Team = require('../models/teamSchema');
const TheUltimateChallenge = require('../models/TheUltimateChallenge');
const Question = require('../models/questionSchema');

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





const joinSession = async (req, res) => {
  try {
    const { firstName, lastName, sessionId, socketId, teamName } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !sessionId || !teamName) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, session ID, and team name are required'
      });
    }

    const name = `${firstName} ${lastName}`;

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

    // Generate JWT token (for cookie only)
    const token = jwt.sign(
      { playerId: player._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set cookie (only place token is sent)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Return only player and team info
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
  getNumberOfTeams,joinSession,updateSocketId
};