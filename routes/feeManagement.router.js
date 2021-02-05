const express = require('express')
const feeManagementCtrl = require('../controllers/FeeManagement.ctrl')
const auth = require('../middlewares/auth.middleware')
const {ROLE_LABLE } = require('../models/constants')
const studentAuth = require('../middlewares/studentAuth.middleware')
const router = express.Router()


//admin/branch
router.get('/GetStudentFeeDetail',auth([ROLE_LABLE.BRANCH_LABLE]), feeManagementCtrl.GetStudentFeeDetail)


//student
router.post('/submitClassFee' , studentAuth() , feeManagementCtrl.submitClassFee)
router.get('/getOwnFeeDetails' , studentAuth() ,feeManagementCtrl.getOwnFeeDetails)
module.exports = router