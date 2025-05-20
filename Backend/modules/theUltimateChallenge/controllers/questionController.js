const Question = require('../models/questionSchema'); 


const addQuestion = async (req, res) => {
  try {
    const {
      level,
      text,
      category,
      correctAnswer,
      points,
      difficulty,
      answerType,
      questionImageUrl
    } = req.body;

    const newQuestion = new Question({
      level,
      text,
      category,
      correctAnswer,
      points,
      difficulty,
      answerType,
      questionImageUrl
    });

    const savedQuestion = await newQuestion.save();

    res.status(201).json({
      message: 'Question added successfully',
      data: savedQuestion
    });
  } catch (error) {
    console.error('Error adding question:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};


const addMultipleQuestions = async (req, res) => {
  try {
    const questions = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array of questions' });
    }

    const createdQuestions = [];

    for (const questionData of questions) {
      const newQuestion = new Question(questionData);
      const saved = await newQuestion.save();
      createdQuestions.push(saved);
    }

    res.status(201).json({
      message: 'Questions added successfully',
      data: createdQuestions
    });
  } catch (error) {
    console.error('Error adding multiple questions:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find(); 
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error.message);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};


module.exports = {
  addQuestion,
  addMultipleQuestions,
  getAllQuestions
};
