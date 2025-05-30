const express = require('express');
const {loginAdmin,updateSocketId,logoutAdmin} = require("../controllers/loginController")
const {changeTeamLevels} = require("../controllers/homeController")

const router = express.Router();

router.post("/login",loginAdmin);
router.get("/logout",logoutAdmin)
router.post("/updatesocketid",updateSocketId);
router.post("/updatelevel",changeTeamLevels);



module.exports = router;
