const express = require('express')
const CourseCtrl = require('../controllers/course.ctrl')
const auth = require('../middlewares/auth.middleware')
const {ROLE_LABLE } = require('../models/constants')
const router = express.Router()

router.get('/getContentType', CourseCtrl.getCourseContentTypes)
    // for update and create both
router.post('/courseCategory', CourseCtrl.createCourseCategory)
router.delete('/courseCategory/:id', CourseCtrl.deleteCourseCategory)
router.get('/courseCategory/:id', CourseCtrl.getCategory)
router.get('/courseCategory', CourseCtrl.getAllcategories)
router.post('/course', CourseCtrl.saveCourse)
router.delete('/course/:id', CourseCtrl.deleteCourse)
router.get('/course', CourseCtrl.getAllCourse)
router.get('/course/:id', CourseCtrl.getCourse)
router.post('/courseSection', CourseCtrl.saveCourseSection)
router.delete('/courseSection', CourseCtrl.deleteCourseSection)
router.post('/courseSectionContent', CourseCtrl.saveSectionContent)
router.post('/courseSectionContentFile', CourseCtrl.saveSectionContentFile)
router.delete('/courseSectionContent', CourseCtrl.deleteCourseSectionContent)





module.exports = router;