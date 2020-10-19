const express = require('express')
const testCtrl = require('../controllers/section.test.ctrl')
// const auth = require('../middlewares/auth.middleware')
// const {ROLE_LABLE } = require('../models/constants')

const router = express.Router()

router.post('/:sectionId/saveTestDetails', testCtrl.saveTest)
router.get('/:sectionId/getAllTestsBySection' , testCtrl.getAllTestsBySection)
router.get('/getTestById/:id' , testCtrl.GetTestById)
router.delete('/:sectionId/deleteTestById/:testId' , testCtrl.deleteTestById)
router.post('/:id/saveQuestion' , testCtrl.addQuestion)
router.get('/:id/getTestQuestions' , testCtrl.getQuestionListTest)
router.get('/getTestQuestionById/:QId' , testCtrl.getTestQuestionById)
router.post('/:id/deleteQuestion/' , testCtrl.deleteQuestionById)

router.get('/getStudentTests' , testCtrl.getStudentTests)
module.exports = router 