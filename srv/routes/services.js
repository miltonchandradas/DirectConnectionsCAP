const express = require("express");
const router = express.Router();
const { getServices, addService } = require("../controllers/services");
const { protect } = require("../middleware/auth");

router
	.route("/")
	.get(getServices)
	.post(protect, addService);
	
module.exports = router;