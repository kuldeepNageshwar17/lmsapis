const authRouter = require('./auth.router')
const courseRouter = require('./course.router')    
const branchRouter = require('./branch.router')    
const settingRouter = require('./setting.router')    
const staffRouter = require('./staff.router')    


module.exports = function(app) {
    app.use('/api/auth', authRouter)
    app.use('/api/course', courseRouter)
    app.use('/api/Branch', branchRouter)
    app.use('/api/setting', settingRouter)
    app.use('/api/staff', staffRouter)
}