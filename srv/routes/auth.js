const express = require("express");
const passport = require("passport");
const passportConf = require("../middleware/passport");
const router = express.Router();

const {
	getMe,
	register,
	login,
	logout,
	facebook
} = require("../controllers/auth");

const {
	protect
} = require("../middleware/auth");

router
	.route("/me")
	.get(protect, getMe);

router
	.route("/register")
	.post(register);

router
	.route("/login")
	.post(login);

router.route("/facebook").post(passport.authenticate("facebookToken", {session: false}), facebook);

router
	.route("/logout")
	.get(logout);

module.exports = router;