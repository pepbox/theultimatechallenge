const { createPlayer, continueToGame } = require("../controllers/teamFormationControllers")
const express = require("express")

const router = express.Router()

router.post("/continue-to-game", continueToGame)

router.post("/create-player", createPlayer)

module.exports = router