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
router.get('/getAllTestListToAdmin' ,auth([ROLE_LABLE.INSTITUTE_LABLE]) , courseCtrl.getAllTestListToAdmin)
router.get('/getAllCoursesOfAllClasses' ,auth([ROLE_LABLE.INSTITUTE_LABLE])  , courseCtrl.getAllCoursesOfAllClasses)
router.get('/getAllClassNameForCourseAdd' , auth([ROLE_LABLE.INSTITUTE_LABLE]) , courseCtrl.getAllClassNameForCourseAdd)
router.get('/getAllClassCoursesNameForTestadd' ,auth([ROLE_LABLE.INSTITUTE_LABLE]) , courseCtrl.getAllClassCoursesNameForTestadd )
router.post('/saveAnnouncement/:courseId' , auth([ROLE_LABLE.INSTITUTE_LABLE]) , courseCtrl.saveAnnouncement )
router.get('/getAnnouncement/:courseId' , courseCtrl.getAnnouncement)
router.post('/saveFaq/:courseId' , auth([ROLE_LABLE.INSTITUTE_LABLE])  , courseCtrl.saveFaq)
router.get('/getFaq/:courseId' , courseCtrl.getFaq)
router.get('/getCourseContent/:courseId' ,auth([ROLE_LABLE.INSTITUTE_LABLE]) , courseCtrl.getCourseContentByCourseId )
router.post('/:courseId/addDiscussionAnswer/:sectionId/:contentId/:discussionId' ,auth([ROLE_LABLE.INSTITUTE_LABLE]) , courseCtrl.addDiscussionAnswer )
router.get('/:courseId/:sectionId/:contentId/getCourseDiscussion' , auth([ROLE_LABLE.INSTITUTE_LABLE])  ,courseCtrl.getCourseDiscussion )
router.post('/convertAudioFromVideo' , courseCtrl.convertAudioFromVideo)
// router.get('/getContentByContentId/:id' , courseCtrl.getContentByContentId)
//Course Test API
router.post('/regexMatchName' , courseCtrl.regexMatchName)
router.post("/regexMatch" , courseCtrl.regexMatch)
router.post("/getMoreCourses" , courseCtrl.getMoreCourses)





router.post('/:courseId/saveTestDetails', CourseTestCtrl.saveTest)
router.get('/:courseId/getAllTestsByCourse' , CourseTestCtrl.getAllTestsByCourseId)
router.get('/getTestById/:id' , CourseTestCtrl.GetTestById)
router.delete('/:courseId/deleteTestById/:testId' , CourseTestCtrl.deleteTestById)
router.post('/:id/saveQuestion' , CourseTestCtrl.addQuestion)
router.get('/:id/getCourseTestQuestionList' , CourseTestCtrl.getCourseTestQuestionList)
router.get('/getCourseTestQuestionById/:QId' , CourseTestCtrl.getTestQuestionById)
router.post('/:id/deleteQuestion/' , CourseTestCtrl.deleteQuestionById)



//////////////////////////////////////////////////////
/////////////////student Apis
//////////////////////////////////////////////////////
router.get('/StudentCourse/',studentAuth(), CourseCtrl.GetClassCoursesForStudent)
router.get('/StudentCourseById/:courseId' , CourseCtrl.getCourseById)
router.get('/getSectionsByCourseId/:courseId' , courseCtrl.getSectionsByCourseId)
router.get('/tests/:courseId' , courseCtrl.getCourseTests)
router.get('/test/:testId' ,courseCtrl.getCourseTestById )
router.get('/test/questions/:testId' , courseCtrl.getTestQuestionsById)
router.post('/test/saveExamResult',studentAuth(),courseCtrl.saveCourseTestResult)
router.get('/:courseId?/getLastResults',studentAuth(),courseCtrl.getStudentLastTestsResults)
router.get('/:resultId/resultById' , courseCtrl.getStudentSingleTestResult)
router.get('/courseReviewData' , studentAuth()  , courseCtrl.courseReviewData)
router.get('/getRecentCourses' , studentAuth() , courseCtrl.getRecentCourses)
router.get('/getCourseWithProgress/:courseId' , studentAuth() , courseCtrl.getSectionsProgressByCourseId)
router.get('/courseDetailByCourseId/:courseId'  , courseCtrl.courseDetailByCourseId)
router.post('/saveReview/:courseId' , studentAuth() , courseCtrl.saveReview)
router.get("/getReviews/:courseId"  ,  courseCtrl.getReviews)
router.post('/giveRating/:courseId',studentAuth() , courseCtrl.giveRating)
router.get('/getRatings/:courseId'  , courseCtrl.getRatings)
router.get('/getAverageRatings/:courseId'  , courseCtrl.getAverageRatings)
router.get('/noOfStudentInCourse/:courseId' , courseCtrl.noOfStudentInCourse)
router.post('/:courseId/createDiscussioninCourse/:sectionId/:contentId' ,studentAuth() , courseCtrl.createDiscussioninCourse )
router.get('/:courseId/:contentId/getDiscussion' , studentAuth() , courseCtrl.getDiscussion)







module.exports = router;