const express = require('express')
const paymentCtrl = require('../controllers/payment.ctrl')
const auth = require('../middlewares/auth.middleware')
const studentAuth = require('../middlewares/studentAuth.middleware')
const {ROLE_LABLE } = require('../models/constants')
const userAuth = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/paymentForPurchaseCourse',userAuth(),paymentCtrl.paymentForPurchaseCourse)









module.exports = router