const mongoose = require('mongoose')
const Schema = mongoose.Schema
let softDelete = require('mongoosejs-soft-delete')

const Fees = new Schema(
  {
    feesAmount: { type: Number, required: true },
    studentId : {type : mongoose.Types.ObjectId , required : true},
    date : { type : Date , default : Date.now() }
  },
  
  { timestamps: true }
)

Fees.plugin(softDelete)
Fees.pre('find', function () {
  this.where({ deleted: !true })
})
module.exports = mongoose.model('fees', Fees)
