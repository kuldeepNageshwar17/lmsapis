const express = require('express')
const userCtrl = require('../controllers/user.ctrl')
// const auth = require('../middlewares/auth.middleware')
// const {ROLE_LABLE } = require('../models/constants')
const userAuth = require('../middlewares/auth.middleware')
const router = express.Router()

router.post('/updateRecentUserData' ,userAuth() , userCtrl.updateRecentUserData)
router.post('/UserProgress' , userAuth() , userCtrl.UserProgress)
router.get('/getUserProgress/:courseId' , userAuth()  , userCtrl.getUserProgress)

module.exports = router 