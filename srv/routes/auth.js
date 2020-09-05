const express = require("express");
const passport = require("passport");
const passportConf = require("../middleware/passport");
const router = express.Router();

const {
    getMe,
    getAllUsers,
	register,
	login,
	logout,
    facebook,
    updateMe
} = require("../controllers/auth");

const {
	protect
} = require("../middleware/auth");

router
	.route("/me")
    .get(protect, getMe)
    .put(protect, updateMe);

router
	.route("/users")
    .get(protect, getAllUsers);

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