const mongoose = require('mongoose');
const TheUltimateChallenge = require('../../../theUltimateChallenge/models/TheUltimateChallenge');
const SessionHistory = require('../../../../models/sessionHistorySchema');
const Question = require('../../../theUltimateChallenge/models/questionSchema');
const Admin = require('../../admin/models/adminSchema');

const createSession = async (req, res) => {
  try {
    const {
      companyName,
      admin,
      password,
      teamFormationGame = false,
      numberOfTeams,
      numberOfLevels,
      questionsPerLevel,
      isCustomQuestionSelection = false,
      selectedQuestions
    } = req.body;

    // Validate required fields
    if (!companyName || !admin || !password || !numberOfTeams || !numberOfLevels || !questionsPerLevel) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: companyName, admin, password, numberOfTeams, numberOfLevels, questionsPerLevel'
      });
    }

    // Validate numberOfLevels
    if (![1, 2, 3].includes(numberOfLevels)) {
      return res.status(400).json({
        success: false,
        error: 'numberOfLevels must be 1, 2, or 3'
      });
    }

    // Validate questionsPerLevel
    if (questionsPerLevel > 13 || questionsPerLevel < 1) {
      return res.status(400).json({
        success: false,
        error: 'questionsPerLevel must be between 1 and 13'
      });
    }

    // Validate selectedQuestions
    if (!selectedQuestions || typeof selectedQuestions !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'selectedQuestions must be an object with levels 1, 2, and 3'
      });
    }

    // Validate question IDs and ensure they exist
    for (let level = 1; level <= numberOfLevels; level++) {
      const questionIds = selectedQuestions[level.toString()] || [];
      
      // Check if the number of questions matches questionsPerLevel
      if (questionIds.length !== questionsPerLevel) {
        return res.status(400).json({
          success: false,
          error: `Level ${level} must have exactly ${questionsPerLevel} questions`
        });
      }

      // Validate each question ID
      for (const questionId of questionIds) {
        if (!mongoose.Types.ObjectId.isValid(questionId)) {
          return res.status(400).json({
            success: false,
            error: `Invalid question ID ${questionId} for level ${level}`
          });
        }

        // Check if the question exists
        const question = await Question.findById(questionId);
        if (!question) {
          return res.status(404).json({
            success: false,
            error: `Question with ID ${questionId} not found`
          });
        }

        // Verify question level matches the selected level
        if (question.level !== level) {
          return res.status(400).json({
            success: false,
            error: `Question ${questionId} does not belong to level ${level}`
          });
        }
      }
    }

    // Ensure unused levels have empty arrays
    const formattedSelectedQuestions = {
      1: selectedQuestions['1'] || [],
      2: selectedQuestions['2'] || [],
      3: selectedQuestions['3'] || []
    };

    // Create new session
    const session = new TheUltimateChallenge({
      companyName,
      admin,
      password,
      teamFormationGame,
      numberOfTeams,
      numberOfLevels,
      questionsPerLevel,
      isCustomQuestionSelection,
      selectedQuestions: formattedSelectedQuestions
    });

    // Save session
    const savedSession = await session.save();

    // Create session history entry
    const sessionHistory = new SessionHistory({
      session: savedSession._id,
      sessionType: 'TheUltimateChallenge',
      sessionPaused: false,
      status: 'live',
      startedAt: new Date()
    });

    // Save session history
    await sessionHistory.save();

    // Create admin entry
    const newAdmin = new Admin({
      adminName: admin,
      session: savedSession._id.toString(),
      passCode: password,
      // socketId can be added later when the admin connects
    });

    // Save admin
    await newAdmin.save();

    // Return success response
    return res.status(201).json({
      success: true,
      data: {
        session: savedSession,
        sessionHistory,
        admin: newAdmin
      },
      message: 'Session and admin created successfully'
    });

  } catch (error) {
    console.error('Error creating session:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  createSession
};