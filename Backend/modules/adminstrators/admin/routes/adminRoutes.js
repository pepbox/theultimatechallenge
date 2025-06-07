const express = require('express');
const {loginAdmin,updateSocketId,logoutAdmin} = require("../controllers/loginController")
const {changeTeamLevels, getGameSettingsData} = require("../controllers/homeController")
const {updateQuestionStatus,updateTeamScore} = require("../controllers/teamData")

const router = express.Router();

router.post("/login",loginAdmin);
router.get("/logout",logoutAdmin)
router.post("/updatesocketid",updateSocketId);
router.post("/updatelevel",changeTeamLevels);
router.post("/update-question-status",updateQuestionStatus);
router.post("/update-total-score",updateTeamScore);
router.get("/get-game-settings",getGameSettingsData);



module.exports = router;
