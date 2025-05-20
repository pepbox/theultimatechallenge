const express = require('express');
const { addQuestion ,addMultipleQuestions,getAllQuestions} = require('../controllers/questionController');

const router = express.Router();




router.post('/add', addQuestion);
router.post('/addmultiple', addMultipleQuestions);
router.get('/getquestions', getAllQuestions);

module.exports = router;
