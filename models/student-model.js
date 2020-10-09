const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')

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
    password: { type: String, required: true },
    tokens: [{
      token: {
          type: String,
          required: true
      }
  }]
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



Student.methods.generateAuthToken = async function() {
  // Generate an auth token for the user
  const student = this
  const token = jwt.sign({ _id: student._id }, process.env.JWT_KEY)
  student.tokens = student.tokens.concat({ token })
  await student.save()
  return token
}

Student.statics.findByCredentials = async function(email, password) {
  // Search for a user by email and password.
  const student = await this.findOne({ email },{name:1,currentBatch:1,email:1,tokens:1,mobile:1,branch:1,profileImage:1,password:1})
  if (!student) {
      return student;
  }
  const isPasswordMatch = await bcrypt.compare(password, student.password)
  if (!isPasswordMatch) {
      throw new Error({ error: 'Invalid login password' })
  }
  return student
}

module.exports = mongoose.model('student', Student)
