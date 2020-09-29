const express = require('express')
const examinationCtrl = require('../controllers/Examination.ctrl')
const auth = require('../middlewares/auth.middleware')
const {ROLE_LABLE } = require('../models/constants')


const router = express.Router()
router.get('/getAllClasssesDdr', examinationCtrl.GetClassesDdr)
// router.get('/getExamDetails/:id', examinationCtrl.GetExamDetail)
router.get('/getExam/:id', examinationCtrl.GetExamDetail)
router.post('/saveExamDetails', examinationCtrl.saveExamDetails)
router.get('/getAllExams', examinationCtrl.GetExams)
router.delete('/deleteExam/:id', examinationCtrl.deleteExam)

router.get('/getQuestionListExam/:id', examinationCtrl.getQuestionListExam)
router.get('/getQuestion/:id', examinationCtrl.getQuestion)
router.post('/:id/saveQuestion', examinationCtrl.addQuestion)
 router.delete('/deleteQuestion/:id',()=>{})

module.exports = router