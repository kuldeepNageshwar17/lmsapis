const mongoose = require('mongoose')
const Schema = mongoose.Schema
const TestResult = new Schema(
  {
    testId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'test',
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
    totalMarks: Number,
    obtainedMarks: Number,
    noOfRight : Number,
    noOfWrong : Number,
    attempted : Number,
    noOfTotalQuestion : Number,
    result: { 
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('testResult', TestResult)
