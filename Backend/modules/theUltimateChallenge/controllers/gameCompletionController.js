const TheUltimateChallenge = require('../models/TheUltimateChallenge');
const Team = require('../models/teamSchema');
const Player = require('../models/playerSchema');
const jwt = require('jsonwebtoken');

// Helper to compute leaderboard with tie-breakers
const buildLeaderboard = (teams) => {
  const rows = teams.map(t => {
    const answered = t.questionStatus.filter(q => q.status === 'done').length;
    return {
      teamId: t._id.toString(),
      teamName: t.name,
      score: t.teamScore || 0,
      answered
    };
  });
  rows.sort((a,b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.answered !== a.answered) return b.answered - a.answered;
    return a.teamName.localeCompare(b.teamName);
  });
  rows.forEach((r,idx) => r.rank = idx + 1);
  return rows;
};

const getGameCompletionData = async (req,res) => {
  try {
    const { sessionId } = req.query;
    if(!sessionId) return res.status(400).json({success:false,message:'sessionId is required'});

    const session = await TheUltimateChallenge.findById(sessionId);
    if(!session) return res.status(404).json({success:false,message:'Session not found'});
    if(!session.sessionEnded) return res.status(403).json({success:false,message:'Session not ended yet'});

    let player = null;
    const token = req.cookies?.token;
    if(token){
      try { const decoded = jwt.verify(token, process.env.JWT_SECRET); player = await Player.findById(decoded.playerId); } catch(_){}
    }

    const teams = await Team.find({ session: sessionId });
    const leaderboard = buildLeaderboard(teams);

    let yourTeamBlock = null;
    if(player){
      const playerTeam = teams.find(t => t._id.toString() === player.team.toString());
      if(playerTeam){
        const answered = playerTeam.questionStatus.filter(q => q.status === 'done');
        const correct = answered.filter(q => (q.pointsEarned || 0) > 0).length;
        const incorrect = answered.filter(q => (q.pointsEarned || 0) < 0).length;
        const total = playerTeam.questionStatus.length;
        const lbRow = leaderboard.find(r => r.teamId === playerTeam._id.toString());
        const playersList = await Player.find({ team: playerTeam._id }).select('name isCaption');
        yourTeamBlock = {
          teamId: playerTeam._id.toString(),
          name: playerTeam.name,
          rank: lbRow?.rank || null,
          score: playerTeam.teamScore || 0,
          answered: lbRow?.answered || answered.length,
          correct,
          incorrect,
          totalQuestions: total,
          players: playersList.map(pl => ({ id: pl._id.toString(), name: pl.name, isCaption: pl.isCaption }))
        };
      }
    }

    return res.status(200).json({
      success:true,
      sessionId: sessionId,
      leaderboard,
      yourTeam: yourTeamBlock
    });
  } catch(error){
    console.error('getGameCompletionData error',error);
    return res.status(500).json({success:false,message:'Failed to fetch game completion data',error:error.message});
  }
};

const logoutPlayer = async (req,res) => {
  try {
    res.clearCookie('token');
    return res.status(200).json({success:true,message:'Logged out'});
  } catch(error){
    return res.status(500).json({success:false,message:'Logout failed',error:error.message});
  }
};

module.exports = { getGameCompletionData, logoutPlayer };
