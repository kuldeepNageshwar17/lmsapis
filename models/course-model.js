const mongoose = require('mongoose')
let softDelete = require('mongoosejs-soft-delete');

var Course = new mongoose.Schema({
    title: {type : String, required : true},
    Description: String,
    // categories: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "courseCategories"
    // }],
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
            videoLength : String,
            videoDescription  : String,
            imageUrl : String,
            imageDescription : String,
            pdfUrl : String,
            pdfDescription : String,
            textDescription : String,
            audioUrl : String,
            audioDescription : String,
            deleted: { type: Boolean, default: false },
            discussion : [{
                question : {
                    questionText : String , 
                    QuestionBy : {type : mongoose.Schema.Types.ObjectId, ref : 'user' },
                    videoTime : String , 
                    exactTime : String ,
                    createdDate : { type: Date, default: Date.now }
                },
                answer : {
                    answerText : String,
                    AnsweredBy : {type : mongoose.Schema.Types.ObjectId, ref : 'user' },
                    createdDate : { type: Date, default: Date.now }
                }
            }]
        }]
    }],
    rating: { type: Number, default: 0 },
    numberOfRatings: { type: Number, default: 0 },
    numberOfStudent: { type: Number, default: 0 },
    class:{type:mongoose.Schema.Types.ObjectId},
    deleted: { type: Boolean, default: false },
    test : [{type : mongoose.Schema.Types.ObjectId,  ref: 'tests'}] ,
    createdBy : {type : mongoose.Schema.Types.ObjectId , ref: 'user'},
    announcement : [{title : String  , Description : String  , createDate: { type: Date, default: Date.now }}],
    reviews : [{
        reviewBy :{type : mongoose.Schema.Types.ObjectId,  ref: 'students' },
        createdAt : { type: Date, default: Date.now },
        review : {type : String }
    }],
    ratings : [{
        ratingBy :{type : mongoose.Schema.Types.ObjectId,  ref: 'students' },
        rating : {type : Number , min : 0 , max : 5},
        createdAt : { type: Date, default: Date.now },
    }],
    faq : [{
        question : String,
        answer : String,
        createdBy : {type : mongoose.Schema.Types.ObjectId, ref : 'user' },
        answerBy : {type : mongoose.Schema.Types.ObjectId, ref : 'user' },
        createdAt : { type: Date, default: Date.now }
    }]
})

Course.plugin(softDelete)
Course.pre('find', function() {
    this.where({ deleted: !true });
});
module.exports = mongoose.model('courses', Course)