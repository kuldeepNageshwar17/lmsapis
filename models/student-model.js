const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Year = new Schema(
  {
    name: { type: String, required: true },
    currentBatch: { type: String},
    branch:{type:mongoose.Schema.Types.ObjectId, ref:"branch"},
    oldBatches: [{type:mongoose.Schema.Types.ObjectId}],
    profileImage: { type: String },
    email: { type: String },
    mobile: { type: Integer },
    password: { type: String, required: true },

  },
  { timestamps: true }
)

module.exports = mongoose.model('year', Year)
