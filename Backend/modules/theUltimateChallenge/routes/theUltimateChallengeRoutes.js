const express = require('express');
const multer = require('multer');
const { addQuestion, addMultipleQuestions, getAllQuestions } = require('../controllers/questionController');

const { joinSession, getNumberOfTeams, updateSocketId, restoreCookie } = require('../controllers/loginController');
const { getTeamData } = require('../controllers/quizSectionController');
const { uploadFileAnswer, submitTextAnswer } = require("../controllers/taskCompleteController");
const { getTimerStatus } = require('../controllers/timerController');

const router = express.Router();




router.post('/add', addQuestion);
router.post('/addmultiple', addMultipleQuestions);
router.get('/getquestions', getAllQuestions);

router.post('/totalteams', getNumberOfTeams);
router.post('/createplayer', joinSession);
router.post("/restore-cookie",restoreCookie);

router.post("/updatesocketid", updateSocketId)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});
router.post('/uploadanswer', upload.single('answerFile'), uploadFileAnswer);
router.post('/uploadtextanswer', upload.single('answerFile'), submitTextAnswer);


router.get('/quizsectioninit', getTeamData)


router.get('/get-timer-status', getTimerStatus);

module.exports = router;
