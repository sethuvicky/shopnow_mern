const express = require("express")
const router  = express.Router();
const {newOrder,getSingleOrder,myOrders,updateOrder,deleteOrder,allOrders} = require("../controllers/orderControllers")
const {isAuthenticateUser,authorizeRoles}  =require("../middlewares/auth")

router.route('/order/new/:id').post(isAuthenticateUser,newOrder)
router.route('/order/:id').get(isAuthenticateUser,getSingleOrder)
router.route('/orders/me/:id').get(isAuthenticateUser,myOrders)
router.route('/admin/orders/:id').get(isAuthenticateUser,authorizeRoles("admin"),myOrders)
router.route('/admin/allorders/:id').get(isAuthenticateUser,authorizeRoles("admin"),allOrders)

router.route('/admin/order/:id')
    .put(isAuthenticateUser, authorizeRoles('admin'), updateOrder)
    .delete(isAuthenticateUser, authorizeRoles('admin'), deleteOrder);


module.exports = router
