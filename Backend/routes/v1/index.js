const express = require('express');
const router = express.Router()
const UltimateChallengeRouter = require("../../modules/theUltimateChallenge/routes/theUltimateChallengeRoutes")
const SuperAdminRouter = require("../../modules/adminstrators/superAdmin/routes/superAdminRoutes")
const AdminRouter = require("../../modules/adminstrators/admin/routes/adminRoutes")
const TeamFormationRouter = require("../../modules/teamFormation/routes/teamFormationRoutes")
const SessionRouter = require("../../modules/sessions/routes/sessionsRoutes")

router.use("/theultimatechallenge", UltimateChallengeRouter)
router.use("/superadmin", SuperAdminRouter)
router.use("/admin", AdminRouter)

router.use("/server", TeamFormationRouter)
router.use("/sessions", SessionRouter)




module.exports = router;

