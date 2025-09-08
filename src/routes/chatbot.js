const express = require("express");
const router = express.Router();
const {sendMessage} = require("../controllers/chatbotController");
router.post("/sendMessage", sendMessage);
module.exports = router;