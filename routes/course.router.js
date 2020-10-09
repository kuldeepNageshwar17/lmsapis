const express = require('express')
const CourseCtrl = require('../controllers/course.ctrl')

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
router.post('/SectionContent/:id',auth([ROLE_LABLE.INSTITUTE_LABLE]), CourseCtrl.saveSectionContent)
router.get('/sectionContent/:id',auth([ROLE_LABLE.INSTITUTE_LABLE]), CourseCtrl.getSectionContent)
router.delete('/sectionContent/:id',auth([ROLE_LABLE.INSTITUTE_LABLE]), CourseCtrl.deleteCourseSectionContent)





//////////////////////////////////////////////////////
/////////////////student Apis
//////////////////////////////////////////////////////
router.get('/StudentCourse/',studentAuth(), CourseCtrl.GetClassCourses)

module.exports = router;