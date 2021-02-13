const express = require('express')
const instructorCtrl = require('../controllers//instructor.ctrl')


const auth = require('../middlewares/auth.middleware')
const userAuth = require('../middlewares/auth.middleware')
const studentAuth = require('../middlewares/studentAuth.middleware')
const {ROLE_LABLE } = require('../models/constants')
const router = express.Router()

router.get('/getAllInstructor', instructorCtrl.getAllInstructor)
router.get('/getInstructorDetail/:id' , instructorCtrl.getInstructorDetail)


module.exports = router;