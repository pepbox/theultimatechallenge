const Question = require('../models/questionSchema');
const QuestionFolder = require('../models/questionFolderSchema');
const TheUltimateChallenge = require('../models/TheUltimateChallenge');
const { uploadFile } = require('../../../services/s3/s3Service');
const jwt = require('jsonwebtoken');
const path = require('path');
const { v4: uuidv4 } = require('crypto');

// ─── Auth helper ─────────────────────────────────────────────────────────────
const verifyAdminToken = (req) => {
  const token = req.cookies?.adminToken;
  if (!token) throw new Error('No admin token');
  return jwt.verify(token, process.env.JWT_SECRET);
};

// ─── QUESTIONS ────────────────────────────────────────────────────────────────

/**
 * GET /library/questions
 * Query: level, folder, search, difficulty, sort, page, limit
 */
const getQuestions = async (req, res) => {
  try {
    const admin = verifyAdminToken(req);
    const { level, folder, search, difficulty, sort = 'newest', page = 1, limit = 100 } = req.query;

    const filter = {};
    if (level) filter.level = Number(level);
    if (folder && folder !== 'all') filter.folder = folder;
    if (difficulty) filter.difficulty = difficulty;
    if (search) filter.$text = { $search: search };

    const sortObj = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [questions, total] = await Promise.all([
      Question.find(filter).sort(sortObj).skip(skip).limit(Number(limit)).lean(),
      Question.countDocuments(filter),
    ]);

    const questionsWithPermissions = questions.map(q => {
      let canModify = false;
      if (admin.isSuperAdmin) {
        canModify = true;
      } else if (q.createdBy && q.session && admin.adminId && admin.sessionId) {
        canModify = q.createdBy.toString() === admin.adminId.toString() && 
                    q.session.toString() === admin.sessionId.toString();
      }
      return {
        ...q,
        canModify
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        questions: questionsWithPermissions,
        pagination: { total, page: Number(page), limit: Number(limit) },
      },
    });
  } catch (error) {
    console.error('getQuestions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch questions', error: error.message });
  }
};

/**
 * POST /library/questions
 */
const createQuestion = async (req, res) => {
  try {
    const admin = verifyAdminToken(req);
    const { text, level, category, difficulty, points, answerType, correctAnswer, questionImageUrl, folder } = req.body;

    if (!text || !level || !category || !difficulty || !points || !answerType) {
      return res.status(400).json({ success: false, message: 'Missing required fields: text, level, category, difficulty, points, answerType' });
    }

    const question = new Question({
      text,
      level: Number(level),
      category,
      difficulty,
      points: Number(points),
      answerType,
      correctAnswer: correctAnswer || null,
      questionImageUrl: questionImageUrl || null,
      folder: folder || 'General',
      isCustom: true,
      session: admin.sessionId || null,
      createdBy: admin.adminId || null,
    });

    const saved = await question.save();

    // Ensure folder exists in folder collection
    if (folder && folder !== 'General') {
      await QuestionFolder.findOneAndUpdate({ name: folder }, { name: folder }, { upsert: true });
    }

    return res.status(201).json({ success: true, data: { question: saved } });
  } catch (error) {
    console.error('createQuestion error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create question', error: error.message });
  }
};

/**
 * PUT /library/questions/:id
 */
const updateQuestion = async (req, res) => {
  try {
    const admin = verifyAdminToken(req);
    const { id } = req.params;
    const { text, level, category, difficulty, points, answerType, correctAnswer, questionImageUrl, folder } = req.body;

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    if (!admin.isSuperAdmin) {
      const isCreator = question.createdBy && admin.adminId && question.createdBy.toString() === admin.adminId.toString();
      const isSameSession = question.session && admin.sessionId && question.session.toString() === admin.sessionId.toString();
      if (!isCreator || !isSameSession) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only edit questions created by you in this session' });
      }
    }

    if (text !== undefined) question.text = text;
    if (level !== undefined) question.level = Number(level);
    if (category !== undefined) question.category = category;
    if (difficulty !== undefined) question.difficulty = difficulty;
    if (points !== undefined) question.points = Number(points);
    if (answerType !== undefined) question.answerType = answerType;
    if (correctAnswer !== undefined) question.correctAnswer = correctAnswer;
    if (questionImageUrl !== undefined) question.questionImageUrl = questionImageUrl;
    if (folder !== undefined) question.folder = folder;

    const saved = await question.save();

    return res.status(200).json({ success: true, data: { question: saved } });
  } catch (error) {
    console.error('updateQuestion error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update question', error: error.message });
  }
};

/**
 * DELETE /library/questions/:id
 */
const deleteQuestion = async (req, res) => {
  try {
    const admin = verifyAdminToken(req);
    const { id } = req.params;

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    if (!admin.isSuperAdmin) {
      const isCreator = question.createdBy && admin.adminId && question.createdBy.toString() === admin.adminId.toString();
      const isSameSession = question.session && admin.sessionId && question.session.toString() === admin.sessionId.toString();
      if (!isCreator || !isSameSession) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only delete questions created by you in this session' });
      }
    }

    await Question.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('deleteQuestion error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete question', error: error.message });
  }
};

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────────

/**
 * POST /library/upload-image
 * multipart/form-data with field "image"
 */
const uploadQuestionImage = async (req, res) => {
  try {
    verifyAdminToken(req);
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });

    const ext = path.extname(req.file.originalname) || '.jpg';
    const key = `question-images/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    const result = await uploadFile({
      fileBuffer: req.file.buffer,
      key,
      contentType: req.file.mimetype,
    });

    return res.status(201).json({ success: true, data: { url: result.Location } });
  } catch (error) {
    console.error('uploadQuestionImage error:', error);
    return res.status(500).json({ success: false, message: 'Image upload failed', error: error.message });
  }
};

// ─── FOLDERS ─────────────────────────────────────────────────────────────────

/**
 * GET /library/folders
 */
const getFolders = async (req, res) => {
  try {
    verifyAdminToken(req);
    const folders = await QuestionFolder.find().sort({ name: 1 }).lean();
    const names = ['General', ...folders.map(f => f.name).filter(n => n !== 'General')];
    return res.status(200).json({ success: true, data: { folders: names } });
  } catch (error) {
    console.error('getFolders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch folders', error: error.message });
  }
};

/**
 * POST /library/folders
 * Body: { name }
 */
const createFolder = async (req, res) => {
  try {
    verifyAdminToken(req);
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Folder name is required' });
    }
    const trimmed = name.trim();
    if (trimmed === 'General') {
      return res.status(400).json({ success: false, message: '"General" folder always exists' });
    }
    const existing = await QuestionFolder.findOne({ name: trimmed });
    if (existing) return res.status(409).json({ success: false, message: 'Folder already exists' });

    await QuestionFolder.create({ name: trimmed });
    return res.status(201).json({ success: true, data: { folder: trimmed } });
  } catch (error) {
    console.error('createFolder error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create folder', error: error.message });
  }
};

/**
 * PUT /library/folders/:name
 * Body: { newName }
 */
const renameFolder = async (req, res) => {
  try {
    verifyAdminToken(req);
    const oldName = decodeURIComponent(req.params.name);
    const { newName } = req.body;

    if (oldName === 'General') return res.status(400).json({ success: false, message: 'Cannot rename the General folder' });
    if (!newName || !newName.trim()) return res.status(400).json({ success: false, message: 'New name is required' });
    const trimmed = newName.trim();

    const folder = await QuestionFolder.findOne({ name: oldName });
    if (!folder) return res.status(404).json({ success: false, message: 'Folder not found' });

    const conflict = await QuestionFolder.findOne({ name: trimmed });
    if (conflict) return res.status(409).json({ success: false, message: 'A folder with that name already exists' });

    folder.name = trimmed;
    await folder.save();

    // Update all questions in this folder
    await Question.updateMany({ folder: oldName }, { folder: trimmed });

    return res.status(200).json({ success: true, data: { folder: trimmed } });
  } catch (error) {
    console.error('renameFolder error:', error);
    return res.status(500).json({ success: false, message: 'Failed to rename folder', error: error.message });
  }
};

/**
 * DELETE /library/folders/:name
 * Moves all questions in folder → General, then removes folder record
 */
const deleteFolder = async (req, res) => {
  try {
    verifyAdminToken(req);
    const name = decodeURIComponent(req.params.name);

    if (name === 'General') return res.status(400).json({ success: false, message: 'Cannot delete the General folder' });

    await Question.updateMany({ folder: name }, { folder: 'General' });
    await QuestionFolder.deleteOne({ name });

    return res.status(200).json({ success: true, data: { fallbackFolder: 'General' } });
  } catch (error) {
    console.error('deleteFolder error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete folder', error: error.message });
  }
};

// ─── SESSION QUESTION SELECTION ───────────────────────────────────────────────

/**
 * POST /library/session/:sessionId/select-questions
 * Body: { level1: [id,...], level2: [id,...], level3: [id,...] }
 */
const selectQuestionsForSession = async (req, res) => {
  try {
    verifyAdminToken(req);
    const { sessionId } = req.params;
    const session = await TheUltimateChallenge.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const selectedQuestionsMap = {};
    let highestLevelWithQuestions = 0;
    for (let i = 1; i <= 10; i++) {
      const qIds = req.body[`level${i}`] || [];
      selectedQuestionsMap[i] = qIds;
      if (qIds.length > 0) {
        highestLevelWithQuestions = i;
      }
    }
    session.selectedQuestions = selectedQuestionsMap;
    session.isCustomQuestionSelection = true;
    
    // Automatically set numberOfLevels to the highest selected level (fallback to 3 if none)
    if (highestLevelWithQuestions > 0) {
      session.numberOfLevels = highestLevelWithQuestions;
    } else {
      session.numberOfLevels = 3;
    }
    await session.save();

    // Update questionStatus for all existing teams of this session
    const Team = require('../models/teamSchema');
    const teams = await Team.find({ session: sessionId });
    for (const team of teams) {
      const questionStatus = [];
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

    return res.status(200).json({ success: true, message: 'Questions saved to session', data: { selectedQuestions: session.selectedQuestions } });
  } catch (error) {
    console.error('selectQuestionsForSession error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save questions', error: error.message });
  }
};

/**
 * GET /library/session/:sessionId/selected-questions
 * Returns the currently selected question IDs per level for a session
 */
const getSelectedQuestionsForSession = async (req, res) => {
  try {
    verifyAdminToken(req);
    const { sessionId } = req.params;

    const session = await TheUltimateChallenge.findById(sessionId).select('selectedQuestions isCustomQuestionSelection numberOfLevels');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const fallback = {};
    for (let i = 1; i <= 10; i++) fallback[i] = [];

    return res.status(200).json({
      success: true,
      data: {
        selectedQuestions: session.selectedQuestions || fallback,
        isCustomQuestionSelection: session.isCustomQuestionSelection,
        numberOfLevels: session.numberOfLevels,
      },
    });
  } catch (error) {
    console.error('getSelectedQuestionsForSession error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch selected questions', error: error.message });
  }
};

/**
 * PUT /library/questions/move
 * Body: { questionIds: [...], targetFolder: "FolderName" }
 */
const moveQuestions = async (req, res) => {
  try {
    const admin = verifyAdminToken(req);
    const { questionIds, targetFolder } = req.body;

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ success: false, message: 'questionIds must be a non-empty array' });
    }
    if (!targetFolder) {
      return res.status(400).json({ success: false, message: 'targetFolder is required' });
    }

    const questions = await Question.find({ _id: { $in: questionIds } });
    if (!admin.isSuperAdmin) {
      for (const q of questions) {
        const isCreator = q.createdBy && admin.adminId && q.createdBy.toString() === admin.adminId.toString();
        const isSameSession = q.session && admin.sessionId && q.session.toString() === admin.sessionId.toString();
        if (!isCreator || !isSameSession) {
          return res.status(403).json({ success: false, message: 'Forbidden: You can only move questions created by you in this session' });
        }
      }
    }

    // Update the folder field for all matching questions
    await Question.updateMany(
      { _id: { $in: questionIds } },
      { $set: { folder: targetFolder } }
    );

    // Ensure target folder exists in folders list
    if (targetFolder !== 'General') {
      await QuestionFolder.findOneAndUpdate({ name: targetFolder }, { name: targetFolder }, { upsert: true });
    }

    return res.status(200).json({ success: true, message: `Successfully moved ${questionIds.length} question(s) to ${targetFolder}` });
  } catch (error) {
    console.error('moveQuestions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to move questions', error: error.message });
  }
};

/**
 * POST /library/questions/copy
 * Body: { questionIds: [...], targetFolder: "FolderName" }
 */
const copyQuestions = async (req, res) => {
  try {
    verifyAdminToken(req);
    const { questionIds, targetFolder } = req.body;

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ success: false, message: 'questionIds must be a non-empty array' });
    }
    if (!targetFolder) {
      return res.status(400).json({ success: false, message: 'targetFolder is required' });
    }

    // Fetch the original questions
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();
    if (questions.length === 0) {
      return res.status(404).json({ success: false, message: 'No questions found to copy' });
    }

    // Duplicate them with the new folder and clear _id
    const copies = questions.map(q => {
      const { _id, createdAt, updatedAt, ...rest } = q;
      return {
        ...rest,
        folder: targetFolder,
      };
    });

    await Question.insertMany(copies);

    // Ensure target folder exists in folders list
    if (targetFolder !== 'General') {
      await QuestionFolder.findOneAndUpdate({ name: targetFolder }, { name: targetFolder }, { upsert: true });
    }

    return res.status(200).json({ success: true, message: `Successfully copied ${questions.length} question(s) to ${targetFolder}` });
  } catch (error) {
    console.error('copyQuestions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to copy questions', error: error.message });
  }
};

module.exports = {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  uploadQuestionImage,
  getFolders,
  createFolder,
  renameFolder,
  deleteFolder,
  selectQuestionsForSession,
  getSelectedQuestionsForSession,
  moveQuestions,
  copyQuestions,
};
