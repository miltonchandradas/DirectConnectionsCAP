const express = require("express");
const router = express.Router();
const { getCodeOfConduct } = require("../controllers/conductcode");

router
	.route("/")
	.get(getCodeOfConduct);
	
module.exports = router;