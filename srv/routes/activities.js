const express = require("express");
const router = express.Router();
const { getActivities, addActivity } = require("../controllers/activities");

router
	.route("/")
	.get(getActivities)
	.post(addActivity);


module.exports = router;