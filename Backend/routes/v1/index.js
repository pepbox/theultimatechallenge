const express = require('express');
const router = express.Router()
const UltimateChallengeRouter = require("../../modules/theUltimateChallenge/routes/theUltimateChallengeRoutes")
const SuperAdminRouter = require("../../modules/adminstrators/superAdmin/routes/superAdminRoutes")
const AdminRouter = require("../../modules/adminstrators/admin/routes/adminRoutes")

router.use("/theultimatechallenge",UltimateChallengeRouter)
router.use("/superadmin",SuperAdminRouter)
router.use("/admin",AdminRouter)


module.exports = router ;

