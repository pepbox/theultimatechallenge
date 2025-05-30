const express = require('express');

const {createSession} = require("../controllers/ultimateSessionController")
const {loginSuperAdmin} = require("../controllers/loginController")

const {superAdminAuthMiddleware} = require("../middleware/superAdminAuthMiddleware")
const router = express.Router();




router.post('/createsession',superAdminAuthMiddleware , createSession);
router.post('/login', loginSuperAdmin);
// router.post('/createsuperadmin', createSuperAdmin);


module.exports = router;
