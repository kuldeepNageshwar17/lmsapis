const express = require('express')
const CourseCtrl = require('../controllers/course.ctrl')
const auth = require('../middlewares/auth.middleware')
const {ROLE_LABLE } = require('../models/constants')
const router = express.Router()

router.get('/getContentType', CourseCtrl.getCourseContentTypes)
    // for update and create both
// router.post('/courseCategory', CourseCtrl.createCourseCategory)
// router.delete('/courseCategory/:id', CourseCtrl.deleteCourseCategory)
// router.get('/courseCategory/:id', CourseCtrl.getCategory)
// router.get('/courseCategory', CourseCtrl.getAllcategories)
router.post('/course/:id', CourseCtrl.saveCourse)
router.post('/uploadCourseProfile', CourseCtrl.uploadCourseProfile)
router.delete('/course/:id', CourseCtrl.deleteCourse)
router.get('/course/:id', CourseCtrl.getCourse)
router.get('/courseList/:iid', CourseCtrl.getClassCourses)
router.post('/courseSection', CourseCtrl.saveCourseSection)
router.get('/courseSection/:id', CourseCtrl.getSectionDetails)
router.delete('/courseSection', CourseCtrl.deleteCourseSection)
router.post('/courseSectionContent', CourseCtrl.saveSectionContent)
router.post('/courseSectionContentFile', CourseCtrl.saveSectionContentFile)
router.delete('/courseSectionContent', CourseCtrl.deleteCourseSectionContent)





module.exports = router;