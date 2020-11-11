const express = require('express')
const examinationCtrl = require('../controllers/Examination.ctrl')
const auth = require('../middlewares/auth.middleware')
const studentAuth = require('../middlewares/studentAuth.middleware')
const {ROLE_LABLE } = require('../models/constants')

const router = express.Router()
router.get('/getAllClasssesDdr',auth([ROLE_LABLE.INSTITUTE_LABLE]), examinationCtrl.GetClassesDdr)
// router.get('/getExamDetails/:id', examinationCtrl.GetExamDetail)
router.get('/getExam/:id',auth([ROLE_LABLE.INSTITUTE_LABLE]), examinationCtrl.GetExamDetail)
router.post('/saveExamDetails',auth([ROLE_LABLE.INSTITUTE_LABLE]), examinationCtrl.saveExamDetails)
router.get('/getAllExams', auth([ROLE_LABLE.INSTITUTE_LABLE]),examinationCtrl.GetExams)
router.delete('/deleteExam/:id',auth([ROLE_LABLE.INSTITUTE_LABLE]), examinationCtrl.deleteExam)
router.get('/getQuestionListExam/:id',auth([ROLE_LABLE.INSTITUTE_LABLE]), examinationCtrl.getQuestionListExam)
router.get('/getQuestion/:id', auth([ROLE_LABLE.INSTITUTE_LABLE]),examinationCtrl.getQuestion)
router.post('/:id/saveQuestion',auth([ROLE_LABLE.INSTITUTE_LABLE]), examinationCtrl.addQuestion)
router.post('/deleteQuestion/:id',auth([ROLE_LABLE.INSTITUTE_LABLE]),examinationCtrl.deleteQuestion)
router.post('/examSchedule/:examId' , auth([ROLE_LABLE.INSTITUTE_LABLE]) , examinationCtrl.examSchedule)
router.get('/getExamSchedule' ,auth([ROLE_LABLE.INSTITUTE_LABLE]) , examinationCtrl.getExamSchedule )
 ////////student Routes
 
 router.get('/getExams',studentAuth(),examinationCtrl.getStudentExams)
 router.get('/getExamQuestion/:id',studentAuth(),examinationCtrl.getExamQuestions)
 router.post('/saveExamResult',studentAuth(),examinationCtrl.saveExamResult)
 router.get('/getLastResults',studentAuth(),examinationCtrl.getStudentLastExamsResults)

module.exports = router