const express = require("express");
const router = express.Router();
const { addRating } = require("../controllers/ratings");
const { protect } = require("../middleware/auth");

router
    .route("/")
	.post(protect, addRating);
	
module.exports = router;