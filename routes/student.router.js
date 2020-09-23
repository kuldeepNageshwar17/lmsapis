const express = require('express')
const StudentCtrl = require('../controllers/student.ctrl')
const auth = require('../middlewares/auth.middleware')
const {ROLE_LABLE } = require('../models/constants')

const router = express.Router()
router.post('/Student',auth([ROLE_LABLE.BRANCH_LABLE]), StudentCtrl.addStudent)
router.get('/Student/:id',auth([ROLE_LABLE.BRANCH_LABLE]), StudentCtrl.getStudent)
router.get('/Student',auth([ROLE_LABLE.BRANCH_LABLE]), StudentCtrl.getStudents)
router.get('/Batchesddr',auth([ROLE_LABLE.BRANCH_LABLE]), StudentCtrl.getBatchesDdr)
router.post('/StudentPasswordReset/:id',auth([ROLE_LABLE.BRANCH_LABLE]), StudentCtrl.resetPassword)
router.post('/ChangeProfileImage/:id',auth([ROLE_LABLE.BRANCH_LABLE]), StudentCtrl.UploadProfileImage)

module.exports = router