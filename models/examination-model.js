const mongoose = require('mongoose')
const { stringify } = require('uuid')
const Schema = mongoose.Schema

const Examination = new Schema(
  {
    name: { type: String, required: true },
    class: {
      type: mongoose.Types.ObjectId,
      ref: 'institute.class'
    },
    description: String,
    questions: [
      {
        question: String,
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

module.exports = mongoose.model('examination', Examination)
