const mongoose = require('mongoose')
const { stringify } = require('uuid')
const Schema = mongoose.Schema

const Examination = new Schema(
  {
    name: { type: String, required: true },
    totalMarks: {
      type: Number,
      required: true
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
      type: Number
    },
    class: {
      type: mongoose.Types.ObjectId,
      ref: 'institute.class'
    },
    description: String,
    questions: [
      {
        question: String,
        marks: Number,
        imagePath: String,
        options: [
          {
            option: String,
            imagePath: String,
            isRight: String
          }
        ]
      }
    ]
  },
  { timestamps: true }
)

// Examination.pre('save', async function (next) {
//   // Hash the password before saving the user model
//   examination = this
//   exam.IsComplete = false
//   var TotalQuestionMarks = exam.questions.reduce((sum, item) => {
//     sum += item.marks
//   }, 0)
//   if (TotalQuestionMarks == totalMarks) {
//     exam.IsComplete = true
//   }

//   next()
// })


module.exports = mongoose.model('examination', Examination)
