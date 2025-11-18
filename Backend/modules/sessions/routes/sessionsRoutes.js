const { Router } = require("express");
const { createSession, updateSession,endSession } = require("../controllers/sessionsController");


const router = Router();

router.post("/create", createSession)
router.post("/update", updateSession);
router.post("/end-session", endSession);


module.exports = router;    