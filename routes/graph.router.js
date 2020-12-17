const express = require('express')
const studentAuth = require('../middlewares/studentAuth.middleware')
const router = express.Router()
const graphController = require('../controllers/graph.ctrl')


router.get('/GetCourseTestResult/:courseId/:testId' ,studentAuth() ,graphController.GetCourseTestResult )
router.get('/getStudentCourseTestResultForPieChart/:courseId/:testId' ,studentAuth() ,graphController.getStudentCourseTestResultForPieChart )
router.get('/getNumbersInTestBatchWise/:testId' ,studentAuth() , graphController.getNumbersInTestBatchWise)
router.get('/getTestByTimeLeft/:testId' , studentAuth() , graphController.getTestByTimeLeft)

module.exports = router 