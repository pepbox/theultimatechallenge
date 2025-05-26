const express = require('express');
const {loginAdmin,updateSocketId} = require("../controllers/loginController")

const router = express.Router();

router.post("/login",loginAdmin);
router.post("/updatesocketid",updateSocketId);



module.exports = router;
