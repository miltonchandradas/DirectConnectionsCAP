const express = require("express");
const router = express.Router();
const { getActivities, updateRating, addActivity } = require("../controllers/activities");
const { protect } = require("../middleware/auth");

router
	.route("/")
	.get(getActivities)
    .post(addActivity);
    
router
    .route("/:id")
    .put(protect, updateRating);


module.exports = router;