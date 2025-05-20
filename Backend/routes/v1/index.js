const express = require('express');
const router = express.Router()
const UltimateChallengeRouter = require("../../modules/theUltimateChallenge/routes/theUltimateChallengeRoutes")
const SuperAdminRouter = require("../../modules/adminstrators/superAdmin/routes/superAdminRoutes")


router.use("/theultimatechallenge",UltimateChallengeRouter)
router.use("/superadmin",SuperAdminRouter)




module.exports = router ;

