const { Router } = require("express");
const { createSession, updateSession } = require("../controllers/sessionsController");


const router = Router();

router.post("/create", createSession)
router.post("/update", updateSession);


module.exports = router;    