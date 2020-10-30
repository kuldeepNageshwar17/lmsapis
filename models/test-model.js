const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Test = new Schema(
  {
    name: { type: String, required: true },
    totalMarks: {
      type: Number,
      required: true
    },
    testLevel : {
      type : String,
      required : true
    },
    timeInHours: {
      type: Number,
      required: true
    },
    timeInMinutes: {
      type: Number,
      required: true
    },
    isComplete: {
      type: Boolean,
      default: false
    },
    passingMarks: {
      type: Number,
      required : true
    },
    description: {
        type: String
      },
    questions: [
      {
        question: String,
        marks: Number,
        imagePath: String,
        options: [
          {
            option: String,
            imagePath: String,
            isRight: Boolean
          }
        ]
      }
    ]
  },
  { timestamps: true }
)


module.exports = mongoose.model('test', Test)
