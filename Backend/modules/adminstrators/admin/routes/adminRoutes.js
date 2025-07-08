const express = require('express');
const { loginAdmin, updateSocketId, logoutAdmin, validateAdminSession, restoreCookie } = require("../controllers/loginController")
const { changeTeamLevels, getGameSettingsData } = require("../controllers/homeController")
const { updateQuestionStatus, updateTeamScore, getTeamPlayersInfo } = require("../controllers/teamData");
const { endSession } = require('../controllers/sessionController');

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/logout", logoutAdmin)
router.get("/validate-admin-session", validateAdminSession)
router.post("/updatesocketid", updateSocketId);
router.post("/updatelevel", changeTeamLevels);
router.post("/update-question-status", updateQuestionStatus);
router.post("/update-total-score", updateTeamScore);
router.get("/get-game-settings", getGameSettingsData);
router.get("/get-teamplayers", getTeamPlayersInfo);

router.post("/restore-cookie", restoreCookie)

router.post("/end-session", endSession);



module.exports = router;
