const express = require('express');

const {createSession, updateSession} = require("../controllers/ultimateSessionController")
const {loginSuperAdmin, createSuperAdmin, validateSuperAdmin, logoutSuperAdmin} = require("../controllers/loginController")

const {superAdminAuthMiddleware} = require("../middleware/superAdminAuthMiddleware");
const { handleGetAllLiveGames, handleGetGameHistory } = require('../controllers/gamesController');
const router = express.Router();




router.post('/createsession',superAdminAuthMiddleware , createSession);
router.post('/updatesession',superAdminAuthMiddleware , updateSession);

router.post('/login', loginSuperAdmin);
router.get("/logout",logoutSuperAdmin)
router.get('/validate-superadmin', validateSuperAdmin);
router.post('/createsuperadmin', createSuperAdmin);
router.get('/fetchlivegames', handleGetAllLiveGames);
router.get('/fetchgamehistory', handleGetGameHistory);


module.exports = router;
