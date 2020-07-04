const express = require("express");
const router = express.Router();
const { getOpportunities, addOpportunity } = require("../controllers/opportunities");

router
	.route("/")
	.get(getOpportunities)
	.post(addOpportunity);


module.exports = router;