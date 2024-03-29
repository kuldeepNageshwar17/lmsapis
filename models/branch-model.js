const mongoose = require('mongoose')
const Schema = mongoose.Schema
let softDelete = require('mongoosejs-soft-delete')

const Branch = new Schema(
  {
    name: { type: String, required: true },
    address: {
      location : {
        latitude : String , 
        longitude : String
      },
      address: String,
      pincode : String ,
      division : String,
      city: String,
      state: String,
      default: { address: '',division : '' ,  city: '', state: ''  }
    },
    batches: [
      {
        name: String,
        description: String,
        class: { type: mongoose.Types.ObjectId }
      }
    ],
    institute: {
      type: mongoose.Types.ObjectId,
      required : true,
      ref: 'institute'
    },
    users: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'user'
      }
    ],
    classesFees: [{ class: mongoose.Types.ObjectId, fees: Number   }]
  },
  { timestamps: true }
)

Branch.plugin(softDelete)
Branch.pre('find', function () {
  this.where({ deleted: !true })
})
module.exports = mongoose.model('branch', Branch)
