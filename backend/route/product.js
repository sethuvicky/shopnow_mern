const express = require("express")
const router  = express.Router();

const {getProducts,newProducts,getsingleProduct,productUpdate,productDelete
    ,createProductReview,getProductReviews,deleteReview,getAdminProducts} = require("../controllers/productcontroller")
const {isAuthenticateUser,authorizeRoles} = require("../middlewares/auth")
router.route("/products").get(getProducts)
router.route("/admin/products/new/:id").post(isAuthenticateUser,authorizeRoles("admin"),newProducts)
router.route("/products/:id").get(getsingleProduct)
router.route("/admin/products/:id").put(isAuthenticateUser,authorizeRoles("admin"),productUpdate)
router.route("/admin/products/:id").delete(isAuthenticateUser,authorizeRoles("admin"),productDelete)
router.route("/review/:id").put(isAuthenticateUser,createProductReview)
router.route("/reviews").get(isAuthenticateUser,getProductReviews)
router.route("/reviews").delete(isAuthenticateUser,deleteReview)
router.route('/admin/products/:id').get(isAuthenticateUser, getAdminProducts);

module.exports = router
