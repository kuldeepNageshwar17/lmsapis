const express = require('express')
const courseCtrl = require('../controllers/course.ctrl')
const CourseCtrl = require('../controllers/course.ctrl')
const CourseTestCtrl = require('../controllers/course.test.ctrl')

const auth = require('../middlewares/auth.middleware')
const studentAuth = require('../middlewares/studentAuth.middleware')
const {ROLE_LABLE } = require('../models/constants')
const router = express.Router()

router.get('/getContentType', CourseCtrl.getCourseContentTypes)
    // for update and create both
// router.post('/courseCategory', CourseCtrl.createCourseCategory)
// router.delete('/courseCategory/:id', CourseCtrl.deleteCourseCategory)
// router.get('/courseCategory/:id', CourseCtrl.getCategory)
// router.get('/courseCategory', CourseCtrl.getAllcategories)
router.post('/course/:id',auth([ROLE_LABLE.INSTITUTE_LABLE]), CourseCtrl.saveCourse)
router.post('/uploadCourseProfile',auth([ROLE_LABLE.INSTITUTE_LABLE]), CourseCtrl.uploadCourseProfile)
router.delete('/course/:id',auth([ROLE_LABLE.INSTITUTE_LABLE]), CourseCtrl.deleteCourse)
router.get('/course/:id',auth([ROLE_LABLE.INSTITUTE_LABLE]), CourseCtrl.getCourse)
router.get('/courseList/:iid',auth([ROLE_LABLE.INSTITUTE_LABLE]), CourseCtrl.getClassCourses)
router.post('/courseSection',auth([ROLE_LABLE.INSTITUTE_LABLE]), CourseCtrl.saveCourseSection)
router.get('/courseSection/:id',auth([ROLE_LABLE.INSTITUTE_LABLE]), CourseCtrl.getSectionDetails)
router.delete('/courseSection/:id',auth([ROLE_LABLE.INSTITUTE_LABLE]), CourseCtrl.deleteCourseSection)
router.post('/SectionContent/:id', CourseCtrl.saveSectionContent)
router.get('/sectionContent/:id',auth([ROLE_LABLE.INSTITUTE_LABLE]), CourseCtrl.getSectionContent)
router.delete('/sectionContent/:id',auth([ROLE_LABLE.INSTITUTE_LABLE]), CourseCtrl.deleteCourseSectionContent)

router.post('/savefile/:id' , courseCtrl.getFilePath)




//////////////////////////////////////////////////////
/////////////////student Apis
//////////////////////////////////////////////////////
router.get('/StudentCourse/',studentAuth(), CourseCtrl.GetClassCourses)
router.get('/StudentCourseById/:courseId' , CourseCtrl.getCourseById)
router.get('/getSectionsByCourseId/:courseId' , courseCtrl.getSectionsByCourseId)


//Course Test API

router.post('/:courseId/saveTestDetails', CourseTestCtrl.saveTest)
router.get('/:courseId/getAllTestsByCourse' , CourseTestCtrl.getAllTestsBySection)
router.get('/getTestById/:id' , CourseTestCtrl.GetTestById)
router.delete('/:courseId/deleteTestById/:testId' , CourseTestCtrl.deleteTestById)
router.post('/:id/saveQuestion' , CourseTestCtrl.addQuestion)
router.get('/:id/getCourseTestQuestionList' , CourseTestCtrl.getCourseTestQuestionList)
router.get('/getCourseTestQuestionById/:QId' , CourseTestCtrl.getTestQuestionById)
router.post('/:id/deleteQuestion/' , CourseTestCtrl.deleteQuestionById)


module.exports = router;