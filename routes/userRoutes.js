const express = require("express");
const { allUsers, registerUser, login, getSingleUser, allUsersBasedOnSearch, getAccessToken, logOut } = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");

const router=express.Router()



router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/accessToken").get(getAccessToken);
router.route("/getAllUsers").get(auth,allUsersBasedOnSearch);
router.route("/getSingleUser").get(auth,getSingleUser);
router.route("/allUsers").get(allUsers);
router.route("/logout").patch(logOut);



module.exports=router