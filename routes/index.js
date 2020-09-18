const movieRouter = require('./movies.router')
const authRouter = require('./auth.router')
const courseRouter = require('./course.router')    
const branchRouter = require('./branch.router')    
const settingRouter = require('./setting.router')    


module.exports = function(app) {
    app.use('/api', movieRouter)
    app.use('/api/auth', authRouter)
    app.use('/api/course', courseRouter)
    app.use('/api/Branch', branchRouter)
    app.use('/api/setting', settingRouter)
}