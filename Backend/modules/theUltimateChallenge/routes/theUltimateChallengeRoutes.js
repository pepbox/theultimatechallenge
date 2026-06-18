const express = require('express');
const multer = require('multer');
const { addQuestion, addMultipleQuestions, getAllQuestions } = require('../controllers/questionController');

const { joinSession, getNumberOfTeams, updateSocketId, restoreCookie } = require('../controllers/loginController');
const { getGameCompletionData, logoutPlayer } = require('../controllers/gameCompletionController');
const { getTeamData } = require('../controllers/quizSectionController');
const { uploadFileAnswer, submitTextAnswer } = require('../controllers/taskCompleteController');
const { getTimerStatus } = require('../controllers/timerController');
const {
  getQuestions, createQuestion, updateQuestion, deleteQuestion, uploadQuestionImage,
  getFolders, createFolder, renameFolder, deleteFolder,
  selectQuestionsForSession, getSelectedQuestionsForSession, moveQuestions, copyQuestions
} = require('../controllers/questionLibraryController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});




router.post('/add', addQuestion);
router.post('/addmultiple', addMultipleQuestions);
router.get('/getquestions', getAllQuestions);

router.post('/totalteams', getNumberOfTeams);
router.post('/createplayer', joinSession);
router.post("/restore-cookie",restoreCookie);

router.post("/updatesocketid", updateSocketId)

router.post('/uploadanswer', upload.single('answerFile'), uploadFileAnswer);
router.post('/uploadtextanswer', upload.single('answerFile'), submitTextAnswer);


router.get('/quizsectioninit', getTeamData)


router.get('/get-timer-status', getTimerStatus);

// Game completion
router.get('/game-completion-data', getGameCompletionData);
router.post('/logout', logoutPlayer);

// ─── Question Library (Admin) ─────────────────────────────────────────────────
router.get('/library/questions', getQuestions);
router.put('/library/questions/move', moveQuestions);
router.post('/library/questions/copy', copyQuestions);
router.post('/library/questions', createQuestion);
router.put('/library/questions/:id', updateQuestion);
router.delete('/library/questions/:id', deleteQuestion);
router.post('/library/upload-image', upload.single('image'), uploadQuestionImage);

router.get('/library/folders', getFolders);
router.post('/library/folders', createFolder);
router.put('/library/folders/:name', renameFolder);
router.delete('/library/folders/:name', deleteFolder);

router.post('/library/session/:sessionId/select-questions', selectQuestionsForSession);
router.get('/library/session/:sessionId/selected-questions', getSelectedQuestionsForSession);

module.exports = router;
