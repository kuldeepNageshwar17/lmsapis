const express = require('express')
const AuthCtrl = require('../controllers/auth.ctrl')
const auth = require('../middlewares/auth.middleware')
const studentAuth = require('../middlewares/studentAuth.middleware')
const {ROLE_LABLE } = require('../models/constants')

const router = express.Router()

router.post('/user', AuthCtrl.createUser)
router.get('/verifyUser' , AuthCtrl.verifyUser)
// router.post('/systemUser', auth([ROLE.Admin]), AuthCtrl.createsystemUser)
// router.get('/userList', auth([ROLE_LABLE.INSTITUTE_LABLE]), AuthCtrl.userList)
// router.post('/testBasic', auth([ROLE_LABLE.INSTITUTE_LABLE]), AuthCtrl.userList)
// router.get('/userList',  AuthCtrl.userList)
// router.post('/testBasic', AuthCtrl.userList)
router.post('/login', AuthCtrl.userLogin)
router.get('/me', AuthCtrl.getMe)
router.post('/logout', auth(Object.values(ROLE_LABLE)), AuthCtrl.logout)
router.post('/logoutAll', auth(Object.values(ROLE_LABLE)), AuthCtrl.logoutAll)

router.post('/studentLogin', AuthCtrl.StudentLogin)
router.get('/meStudent', studentAuth(), AuthCtrl.getMeStudent)
router.post('/studentLogout', studentAuth() , AuthCtrl.Studentlogout)
router.post('/studentLogoutAll', studentAuth() , AuthCtrl.studentLogoutAll)

module.exports = router