const mongoose = require('mongoose')
const Schema = mongoose.Schema
let softDelete = require('mongoosejs-soft-delete')

const Institute = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    years: [],
    branches: [{ type: mongoose.Types.ObjectId, ref: 'branch' }],
    defaultBranch: { type: mongoose.Types.ObjectId, ref: 'branch' },
    classes: [
      {
        name: { type: String },
        description: { type: String },
        courses: [{ type: mongoose.Types.ObjectId, ref: 'courses' }],
        examinations: [{ type: mongoose.Types.ObjectId, ref: 'examination' }],
        fees:{type: Number,default: 0, },
        examSchedule : [{
          examId : {type: mongoose.Schema.Types.ObjectId },
          startDate  : { type: String, default: Date.now },
          endDate : { type: String, default: Date.now },
          isActive : { type: Boolean, default: true },
        }]
      }
    ],
    roles: [
      {
        id: { type: String },
        name: { type: String },
        type: { type: Number },
        isDefault: { type: Boolean,default:false },
        show: { type: Boolean, default: true },
        permissions: [
          {
            module:{type: String , required:true} ,
            permission: {type: Number , required:true} ,
          }
        ]
      }
    ],
    users: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'user'
      }
    ],
    changeRequest : [
      {
        entityId :  {
          type: mongoose.Types.ObjectId
        },
        entityName : String,
        fees : Number ,
        requestedFees : Number, 
        description : String,
        branchId :  {
          type: mongoose.Types.ObjectId,
          ref: 'branch'
        },
        requestedBy :  {
          type: mongoose.Types.ObjectId,
          ref: 'user'
        },
        actionBy :  {
          type: mongoose.Types.ObjectId,
          ref: 'user'
        },
        requestDate :{type : Date  } ,
        actionDate : {type : Date  } ,
        status : {type : String , default : "Pending"},
        requestType : String
      }
    ]
  },
  { timestamps: true }
)

Institute.plugin(softDelete)
Institute.pre('find', function () {
  this.where({ deleted: !true })
})
module.exports = mongoose.model('institute', Institute)
