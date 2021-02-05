const mongoose = require('mongoose')
const Schema = mongoose.Schema
let softDelete = require('mongoosejs-soft-delete')

const Payments = new Schema(
  {
    paymentBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref : 'user',
        required : true
    },
    paymentAmount : {type : Number},
    objective : {type : String},
    objectiveDescription :  {type : String},
    objectiveId :{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref : 'courses',
        required : true
    },
    paymentDate : { type : Date , default : Date.now() }
  },
  
  { timestamps: true }
)

Payments.plugin(softDelete)
module.exports = mongoose.model('payments', Payments)
