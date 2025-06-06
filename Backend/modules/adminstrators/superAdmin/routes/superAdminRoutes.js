const express = require('express');

const {createSession} = require("../controllers/ultimateSessionController")
const {loginSuperAdmin, createSuperAdmin, validateSuperAdmin, logoutSuperAdmin} = require("../controllers/loginController")

const {superAdminAuthMiddleware} = require("../middleware/superAdminAuthMiddleware");
const { handleGetAllLiveGames } = require('../controllers/gamesController');
const router = express.Router();




router.post('/createsession',superAdminAuthMiddleware , createSession);
router.post('/login', loginSuperAdmin);
router.get("/logout",logoutSuperAdmin)
router.get('/validate-superadmin', validateSuperAdmin);
router.post('/createsuperadmin', createSuperAdmin);
router.get('/fetchlivegames', handleGetAllLiveGames);


module.exports = router;
