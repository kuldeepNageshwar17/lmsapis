const mongoose = require('mongoose')
let softDelete = require('mongoosejs-soft-delete');
var CourseCategory = new mongoose.Schema({

    name: String,
    description: String,
    createDate: { type: Date, default: Date.now }
})


CourseCategory.plugin(softDelete)
module.exports = mongoose.model('courseCategories', CourseCategory)