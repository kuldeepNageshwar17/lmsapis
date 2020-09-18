const mongoose = require('mongoose')
var CourseCategory = new mongoose.Schema({

    name: String,
    description: String,
    createDate: { type: Date, default: Date.now }
})
module.exports = mongoose.model('courseCategories', CourseCategory)