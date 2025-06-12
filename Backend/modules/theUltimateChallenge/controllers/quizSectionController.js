const Player = require('../models/playerSchema');
const Team = require('../models/teamSchema');
const Question = require('../models/questionSchema');
const TheUltimateChallenge = require('../models/TheUltimateChallenge');
const jwt = require('jsonwebtoken');

const getTeamData = async (req, res) => {
  try {
    // Verify JWT from cookie
    const token = req.cookies.token
    console.log(req.cookies)
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const playerId = decoded.playerId;

    // Find player by ID
    const player = await Player.findById(playerId)
      .select('team session')
      .lean();

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }


    const session = await TheUltimateChallenge.findById(player.session);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    
    // Find team with populated question details
    const team = await Team.findById(player.team)
      .populate({
        path: 'questionStatus.question',
        select: 'text category difficulty points answerType questionImageUrl'
      })
      .populate({
        path: 'questionStatus.currentPlayer',
        select: 'name'
      })
      .populate({
        path: 'session',
        select: 'companyName numberOfLevels questionsPerLevel'
      })
      .select('name caption questionStatus teamScore')
      .lean();

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Format response
    const response = {
      teamId: team._id,
      teamName: team.name,
      caption: team.caption,
      teamScore: team.teamScore,
      currentLevel: session.currentLevel,
      session: {
        companyName: team.session.companyName,
        numberOfLevels: team.session.numberOfLevels,
        questionsPerLevel: team.session.questionsPerLevel
      },
      questions: team.questionStatus.map(status => ({
        questionId: status.question._id,
        text: status.question.text,
        category: status.question.category,
        difficulty: status.question.difficulty,
        points: status.question.points,
        answerType: status.question.answerType,
        questionImageUrl: status.question.questionImageUrl,
        status: status.status,
        currentPlayer: status.currentPlayer ? {
          id: status.currentPlayer._id,
          name: status.currentPlayer.name
        } : null,
        pointsEarned: status.pointsEarned,
        answerUrl: status.answerUrl
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching team data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
module.exports = { getTeamData }