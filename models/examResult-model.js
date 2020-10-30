const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ExamResult = new Schema(
  {
    examId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'examination',
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

module.exports = mongoose.model('examResult', ExamResult)
