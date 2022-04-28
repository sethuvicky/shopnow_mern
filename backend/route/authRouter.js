const express = require("express");
const router  = express.Router();
const {isAuthenticateUser} = require("../middlewares/auth")
const {registerUser,loginUser,logout,forgotPassword,
    resetPassword,
    getProfile,
    updatePassword,
    updateProfile,
    allUsers,
    getUserDetails,
    updateUser,
    deleteUser,
    user
} = require("../controllers/authController")
const {authorizeRoles} = require("../middlewares/auth")
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").get(logout)
router.route("/password/forgot").post(forgotPassword)
router.route("/password/reset/:token").put(resetPassword)
router.route("/profile").get(isAuthenticateUser, getProfile)
router.route("/password/update/:id").put(isAuthenticateUser, updatePassword)
router.route("/profile/update/:id").put(isAuthenticateUser,updateProfile )
router.route("/admin/users").get(isAuthenticateUser,authorizeRoles("admin"),allUsers )
router.route("/admin/user/:id").get(isAuthenticateUser,authorizeRoles("admin"),getUserDetails )
router.route("/user/:id").get(user)
.put(isAuthenticateUser,authorizeRoles("admin"),updateUser )

router.route("/admin/delete/:id").delete(isAuthenticateUser,authorizeRoles("admin"),deleteUser )


module.exports = router
