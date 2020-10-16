const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ExamResult = new Schema(
  {
    // _id: { type: mongoose.Schema.Types.ObjectId },
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
    result: { 
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('examResult', ExamResult)
