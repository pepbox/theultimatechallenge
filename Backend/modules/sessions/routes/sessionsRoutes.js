const { Router } = require("express");
const { createSession, updateSession, endSession, deleteSessionData } = require("../controllers/sessionsController");


const router = Router();

router.post("/create", createSession)
router.post("/update", updateSession);
router.post("/end-session", endSession);
router.post("/delete-session", deleteSessionData);


module.exports = router;    