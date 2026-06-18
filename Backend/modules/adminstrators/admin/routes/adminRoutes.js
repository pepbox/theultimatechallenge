const express = require('express');
const multer = require('multer');
const { loginAdmin, updateSocketId, logoutAdmin, validateAdminSession, restoreCookie, loginWithSuperadminPasscode } = require("../controllers/loginController")
const { changeTeamLevels, getGameSettingsData, downloadSessionData, updateSessionBranding, getPopulatedQuestionsForSession, createTeams } = require("../controllers/homeController")
const { updateQuestionStatus, updateTeamScore, getTeamPlayersInfo } = require("../controllers/teamData");
const { endSession } = require('../controllers/sessionController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/logout", logoutAdmin)
router.get("/validate-admin-session", validateAdminSession)
router.post("/authenticate-library-passcode", loginWithSuperadminPasscode);
router.post("/updatesocketid", updateSocketId);
router.post("/updatelevel", changeTeamLevels);
router.post("/update-question-status", updateQuestionStatus);
router.post("/update-total-score", updateTeamScore);
router.get("/get-game-settings", getGameSettingsData);
router.get("/get-teamplayers", getTeamPlayersInfo);
router.post("/update-branding", upload.single('logo'), updateSessionBranding);
router.post("/create-teams", createTeams);

router.get("/session/:sessionId/populated-questions", getPopulatedQuestionsForSession);
router.get("/download-session-data/:sessionId", downloadSessionData)

router.post("/restore-cookie", restoreCookie)

// router.post("/end-session", endSession);



module.exports = router;
