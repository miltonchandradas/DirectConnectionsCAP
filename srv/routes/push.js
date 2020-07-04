const express = require("express");
const router = express.Router();
const { subscribe } = require("../controllers/push");
const { protect } = require("../middleware/auth");

router
	.route("/")
	.post(protect, subscribe);
	
module.exports = router;