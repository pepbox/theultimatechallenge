const express = require('express');

const {createSession} = require("../controllers/ultimateSessionController")
const router = express.Router();




router.post('/createsession', createSession);


module.exports = router;
