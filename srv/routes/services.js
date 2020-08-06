const express = require("express");
const router = express.Router();
const { getServices, subscribeService, addService } = require("../controllers/services");
const { protect } = require("../middleware/auth");

router
	.route("/")
	.get(getServices)
    .post(protect, addService);
    
router
    .route("/:id")
    .put(protect, subscribeService);
	
module.exports = router;