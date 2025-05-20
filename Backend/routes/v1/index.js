const express = require('express');
const router = express.Router()
const UltimateChallengeRouter = require("../../modules/theUltimateChallenge/routes/theUltimateChallengeRoutes")
const SuperAdminRouter = require("../../modules/adminstrators/superAdmin/routes/superAdminRoutes")



router.use("/theultimatechallenge",UltimateChallengeRouter)
router.use("/superadmin",SuperAdminRouter)


if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "..", "..", "Frontend", "dist");
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(buildPath, "index.html"));
  });
}


module.exports = router ;

