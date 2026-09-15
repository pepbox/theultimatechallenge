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

router.get("/health", async (req, res) => {
  const { redis } = require("../../config/redis.js");
  const mongoose = require("mongoose");
  
  let redisStatus = "disconnected";
  let redisPing = null;
  try {
    if (redis && redis.status === "ready") {
      const start = Date.now();
      await redis.ping();
      redisPing = `${Date.now() - start}ms`;
      redisStatus = "connected";
    }
  } catch (err) {
    redisStatus = `error: ${err.message}`;
  }

  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  return res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: dbStatus,
    redis: {
      status: redisStatus,
      clientStatus: redis?.status || "unavailable",
      latency: redisPing
    }
  });
});

module.exports = router;

