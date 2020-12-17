const mongoose = require('mongoose')
const Schema = mongoose.Schema
const TestResult = new Schema(
  {
    testId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'test',
      required : true
    },
    batchId: { type: mongoose.Schema.Types.ObjectId },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'students',
      required: true
    },
    anshwerSheet: [
      {
        qid: { type: mongoose.Schema.Types.ObjectId },
        options: [{ type: mongoose.Schema.Types.ObjectId }],
        isTrue: {
          type: Boolean,
          default: false
        },
        marks:Number,
      }
    ],
    TimeLeft : Number ,
    totalMarks: Number,
    obtainedMarks: Number,
    noOfRight : Number,
    noOfWrong : Number,
    attempted : Number,
    noOfTotalQuestion : Number,
    category : String,
    sectionId : String,
    courseId : String,
    result: { 
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('testResult', TestResult)
