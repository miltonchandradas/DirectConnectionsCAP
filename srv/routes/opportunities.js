const express = require("express");
const router = express.Router();
const { getOpportunities, subscribeOpportunity, addOpportunity } = require("../controllers/opportunities");

const {
    protect
} = require("../middleware/auth");

router
    .route("/")
    .get(getOpportunities)
    .post(addOpportunity);

router
    .route("/:id")
    .put(protect, subscribeOpportunity);


module.exports = router;