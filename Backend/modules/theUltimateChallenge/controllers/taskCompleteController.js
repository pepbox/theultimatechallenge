const AWS = require('aws-sdk');
const Team = require('../models/teamSchema');
const Player = require('../models/playerSchema');
const Question = require('../models/questionSchema');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Configure S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

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
    const questionStatus = team.questionStatus.find(q => q.question.equals(questionId));
    if (!questionStatus) return res.status(404).json({ error: 'Question not assigned to team' });
    if (questionStatus.status === 'done') return res.status(400).json({ error: 'Question already answered' });

    // Upload file to S3
    const file = req.file;
    const fileExtension = file.originalname.split('.').pop();
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const s3Key = `answers/${uniqueId}.${fileExtension}`;

    await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype
    }).promise();

    const answerUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
    const pointsEarned = question.points; // Grant points for file upload

    // Update team questionStatus and score
    await Team.updateOne(
      { _id: team._id, 'questionStatus.question': questionId },
      {
        $set: {
          'questionStatus.$.status': 'done',
          'questionStatus.$.answerUrl': answerUrl,
          'questionStatus.$.pointsEarned': pointsEarned
        },
        $inc: {
          teamScore: pointsEarned // Add points to team score
        }
      }
    );

    // Check if all questions in current level are done
    const currentLevelQuestions = team.questionStatus.filter(q => 
      question.level === team.currentLevel && q.status === 'done'
    );
    const totalLevelQuestions = team.questionStatus.filter(q => 
      question.level === team.currentLevel
    );

    // If all questions in current level are done, increment level
    if (currentLevelQuestions.length === totalLevelQuestions.length && team.currentLevel < 3) {
      await Team.updateOne(
        { _id: team._id },
        { $inc: { currentLevel: 1 } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded and marked done',
      url: answerUrl,
      pointsEarned,
      isCorrect: true // Assuming file upload is considered correct
    });

  } catch (err) {
    console.error('File upload error:', err);
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

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const team = await Team.findById(player.team._id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    // Find question status in team
    const questionStatus = team.questionStatus.find(q => q.question.equals(questionId));
    if (!questionStatus) return res.status(404).json({ error: 'Question not assigned to team' });
    if (questionStatus.status === 'done') return res.status(400).json({ error: 'Question already answered' });

    // Check if answer is correct
    const isCorrect = question.correctAnswer && 
                      question.correctAnswer.toLowerCase().trim() === answer.toLowerCase().trim();
    const pointsEarned = isCorrect ? question.points : 0;

    // Only update status and submittedAnswer if the answer is correct
    if (isCorrect) {
      await Team.updateOne(
        { _id: team._id, 'questionStatus.question': questionId },
        {
          $set: {
            'questionStatus.$.status': 'done',
            'questionStatus.$.pointsEarned': pointsEarned,
            'questionStatus.$.submittedAnswer': answer.trim() // Store the submitted answer
          },
          $inc: {
            teamScore: pointsEarned // Add points to team score
          }
        }
      );

      // Check if all questions in current level are done
      const currentLevelQuestions = team.questionStatus.filter(q => 
        question.level === team.currentLevel && q.status === 'done'
      );
      const totalLevelQuestions = team.questionStatus.filter(q => 
        question.level === team.currentLevel
      );

      // If all questions in current level are done, increment level
      if (currentLevelQuestions.length === totalLevelQuestions.length && team.currentLevel < 3) {
        await Team.updateOne(
          { _id: team._id },
          { $inc: { currentLevel: 1 } }
        );
      }
    }

    return res.status(200).json({
      success: true,
      isCorrect,
      pointsEarned,
      message: isCorrect ? 'Correct answer!' : 'Incorrect answer'
    });

  } catch (err) {
    console.error('Text answer submission error:', err);
    return res.status(500).json({ error: 'Failed to submit answer' });
  }
};

module.exports = { uploadFileAnswer,submitTextAnswer };
