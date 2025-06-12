const express = require('express');
const multer = require('multer');
const { addQuestion, addMultipleQuestions, getAllQuestions } = require('../controllers/questionController');

const { joinSession, getNumberOfTeams, updateSocketId } = require('../controllers/loginController');
const { getTeamData } = require('../controllers/quizSectionController');
const { uploadFileAnswer, submitTextAnswer } = require("../controllers/taskCompleteController")

const router = express.Router();




router.post('/add', addQuestion);
router.post('/addmultiple', addMultipleQuestions);
router.get('/getquestions', getAllQuestions);

router.post('/totalteams', getNumberOfTeams);
router.post('/createplayer', joinSession)
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

module.exports = router;
