const jwt = require('jsonwebtoken')
const User = require('../models/user-model')
const Institute = require('../models/institute-model')
//require('../models/branch-model')
const mongoose = require('mongoose')

const { ROLE_LABLE } = require('../models/constants')

const permission = function (module, permissions = []) {
  return (req, res, next) => {
    if (req.header('Authorization')) {
      const token = req.header('Authorization').replace('Bearer ', '')
      const data = jwt.verify(token, process.env.JWT_KEY)
      var permission = false
      try {
        User.findOne({ _id: data._id, 'tokens.token': token })
          .populate('branches')
          .exec(async (err, user) => {
            if (err) {
              return res.status(401).send({ error: 'need to sign ' })
            }
            // console.log(user.roles)
            let branchId = req.headers.branchid
            var RolesPermission = await Institute.aggregate([
              {
                $match: {
                  branches: mongoose.Types.ObjectId(branchId)
                }
              },
              { $unwind: '$roles' },
              { $match: { 'roles.id': { $in: user.roles } } },
              { $replaceRoot: { newRoot: '$roles' } },
              { $unwind: '$permissions' },
              {
                $replaceRoot: { newRoot: '$permissions' }
              },
              {
                $group: { _id: { module: '$module', permission: '$permission' } }
              },
              {
                $replaceRoot: { newRoot: '$_id' }
              },
              { $match: { 'module':module,"permission": {$in:permissions}} } ])

              if(permissions.length<=RolesPermission.length){
                next()
              }
            else 
            return res.status(403).send({ error: 'not authrized for the request , permission denied' })
          })
    
      } catch (error) {
        return res
          .status(500)
          .send({ error: 'Not authorized to access this resource' })
      }
    } else {
      return res
        .status(401)
        .send({ error: 'Not authorized to access this resource' })
    }
  }
}
module.exports = permission
