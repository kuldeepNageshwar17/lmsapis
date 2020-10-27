const express = require('express')
const testCtrl = require('../controllers/section.test.ctrl')
// const auth = require('../middlewares/auth.middleware')
// const {ROLE_LABLE } = require('../models/constants')
const studentAuth = require('../middlewares/studentAuth.middleware')
const router = express.Router()

router.post('/:sectionId/saveTestDetails', testCtrl.saveTest)
router.get('/:sectionId/getAllTestsBySection' , testCtrl.getAllTestsBySection)
router.get('/getTestById/:id' , testCtrl.GetTestById)
router.delete('/:sectionId/deleteTestById/:testId' , testCtrl.deleteTestById)
router.post('/:id/saveQuestion' , testCtrl.addQuestion)
router.get('/:id/getTestQuestions' , testCtrl.getQuestionListTest)
router.get('/getTestQuestionById/:QId' , testCtrl.getTestQuestionById)
router.post('/:id/deleteQuestion/' , testCtrl.deleteQuestionById)

router.get('/:sectionId/getallTestBySectionIdAdmin' , testCtrl.getallTestBySectionIdAdmin)

//for student 
router.get('/getStudentTests' , testCtrl.getStudentTests)
router.get('/getTestQuestionsById/:testId' , testCtrl.getTestQuestionsById)
router.post('/test/saveSectionTestResult' ,studentAuth(), testCtrl.saveSectionTestResult)
router.get('/:sid/getSectionalTestResults',studentAuth(), testCtrl.getSectionalTestResults)
module.exports = router 