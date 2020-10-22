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
        examinations: [{ type: mongoose.Types.ObjectId, ref: 'examination' }]
      }
    ],
    roles: [
      {
        id: { type: String },
        name: { type: String },
        type: { type: Number },
        isDefault: { type: Boolean },
        show: { type: Boolean, default: true },
        permissions: [
          {
            module: String,
            permission: Number
          }
        ]
      }
    ],
    users: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'user'
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
