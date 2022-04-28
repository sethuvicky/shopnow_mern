const express = require("express")
const router  = express.Router();
const {processPayment,sendStripApi} = require("../controllers/paymentController")
const {isAuthenticateUser}  = require("../middlewares/auth")

router.route('/payment/process/:id').post(isAuthenticateUser,processPayment)
router.route('/stripeapi/:id').get(isAuthenticateUser,sendStripApi)



module.exports = router
