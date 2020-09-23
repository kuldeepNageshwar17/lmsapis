const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')
const validator = require('validator')

const Student = new Schema(
  {
    name: { type: String, required: true },
    currentBatch: { type: String },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'branch' },
    oldBatches: [{ type: mongoose.Schema.Types.ObjectId }],
    profileImage: { type: String },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      validate: value => {
        if (!validator.isEmail(value)) {
          throw new Error({ error: 'Invalid Email address' })
        }
      }
    },
    mobile: { type: Number },
    password: { type: String, required: true }
  },
  { timestamps: true }
)

Student.pre('save', async function (next) {
  // Hash the password before saving the user model
  const student = this
  if (student.isModified('password')) {
    student.password = await bcrypt.hash(student.password, 8)
  }
  next()
})

module.exports = mongoose.model('student', Student)
