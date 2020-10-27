const mongoose = require('mongoose')
let softDelete = require('mongoosejs-soft-delete');

var Course = new mongoose.Schema({
    title: String,
    Description: String,
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "courseCategories"
    }],
    createDate: { type: Date, default: Date.now },
    modifiedDate: { type: Date, default: Date.now },
    posterImageUrl: String,
    overview: String,
    timeInHours: Number,
    timeInMinutes: Number,
    sections: [{
        name: String,
        order: Number,
        createDate: { type: Date, default: Date.now },
        modifiedDate: { type: Date, default: Date.now },
        timeInHours: Number,
        timeInMinutes: Number,
        deleted: { type: Boolean, default: false },
        test : [{type : mongoose.Schema.Types.ObjectId,  ref: 'tests'}] ,
        contents: [{
            title: String,
            videoUrl : String,
            videoDescription  : String,
            imageUrl : String,
            imageDescription : String,
            pdfUrl : String,
            pdfDescription : String,
            textDescription : String,
            audioUrl : String,
            audioDescription : String,
            deleted: { type: Boolean, default: false },
        }]
    }],
    rating: { type: Number, default: 0 },
    numberOfRatings: { type: Number, default: 0 },
    numberOfStudent: { type: Number, default: 0 },
    class:{type:mongoose.Schema.Types.ObjectId},
    deleted: { type: Boolean, default: false },
    test : [{type : mongoose.Schema.Types.ObjectId,  ref: 'tests'}] ,
    createdBy : {type : mongoose.Schema.Types.ObjectId , ref: 'user'}
})

Course.plugin(softDelete)
Course.pre('find', function() {
    this.where({ deleted: !true });
});
module.exports = mongoose.model('courses', Course)