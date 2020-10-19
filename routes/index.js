const authRouter = require('./auth.router')
const courseRouter = require('./course.router')    
const branchRouter = require('./branch.router')    
const settingRouter = require('./setting.router')    
const staffRouter = require('./staff.router')    
const studentRouter = require('./student.router')    
const ExamRouter = require('./Examination.router')   
const TestRouter = require('./section.test.router') 
const StreamRouter = require('./stream.router')
const permissionRouter = require('./permission.router')

module.exports = function(app) {
    app.use('/api/auth', authRouter)
    app.use('/api/course', courseRouter)
    app.use('/api/Branch', branchRouter)
    app.use('/api/setting', settingRouter)
    app.use('/api/staff', staffRouter)
    app.use('/api/student', studentRouter)
    app.use('/api/Examination', ExamRouter)
    app.use('/api/Test' , TestRouter)
    app.use('/api/permission' , permissionRouter)
    app.use('/api/video' , StreamRouter)

}