const Branch = require('../models/branch-model')
const Institute = require('../models/institute-model')
const User = require('../models/user-model')
const mongoose = require('mongoose')
const { ROLE_LABLE } = require('../models/constants')

var path = require('path')
const { response } = require('express')
createUserInstitute = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    var user = new User(req.body)
    user.roles = req.body.roles;
    if (!user.branch) {
      user.branch = branchId
    }
    if (req.body._id) {
      user = await User.findOne({ _id: req.body._id })
      user.name = req.body.name
      user.roles =req.body.roles;
      user.email = req.body.email
      user.mobile = req.body.mobile
      if (req.body.password) {
        user.password = req.body.password
      }
    }
    var institute = await Institute.findOne({
      branches: branchId
    })
    debugger
    // let role = institute.roles.filter(m => m.id.toString() == req.body.role)
    // console.log(JSON.stringify(institute.users))
    if (
      // role.length &&
      !institute.users.filter(m => m == user._id.toString()).length
    ) {
      institute.users.push(user._id)
    }

    if (!req.body._id) {
      if (req.body.branch) {
        await Branch.updateOne(
          { _id: req.body.branch },
          { $push: { users: user._id } }
        )
      } else {
        await Branch.updateOne(
          { _id: branchId },
          { $push: { users: user._id } }
        )
      }
    }
    await institute.save()
    await user.save()
   return res.status(200).send(user)
  } catch (error) {
    console.log(error)
    return  res.status(500).send(error)
  }
}
createUserBranch = async (req, res) => {
  try {
    const user = new User(req.body)  
    var branchId = req.headers.branchid
    user.branch = branchId
    if (!req.body._id) {
      await Branch.update({ _id: branchId }, { $push: { users: user._id } })
      await Institute.update({ branches: branchId }, { $push: { users: user._id } })
      await user.save()
    } else {
      await User.update(
        { _id: req.body._id },
        {
          $set: { name: user.name, password: user.password, email: user.email, mobile: user.mobile,roles:user.roles}
        }
      )
    }
    return res.status(200).send()
  } catch (error) {
    console.log(error)
    return  res.status(400).send(error)

  }
}

userRolesDdrBranch = async (req, res) => {
  try {
    //const user = new User(req.body)
    //var branch= await Branch.find({});
    // user.branches=[branch[0]._id];
    var branchId = req.headers.branchid
    var institute = await Institute.findOne({
      branches: branchId
    })
    let { roles } = institute
    return res.status(200).send(roles.filter(m => m.type == 2))
  } catch (error) {
    return res.status(400).send(error)
  }
}

userRolesDdrInstitute = async (req, res) => {
  try {
    //const user = new User(req.body)
    //var branch= await Branch.find({});
    // user.branches=[branch[0]._id];
    var branchId = req.headers.branchid
    var institute = await Institute.findOne({
      branches: branchId
    })
    let { roles } = institute
    return res.status(200).send(roles)
  } catch (error) {
    return res.status(500).send(error)
  }
}
getUsers = async (req, res) => {
  try {
    let branchId = req.headers.branchid
    let users = await User.aggregate([
      {$match : {$and : [{branch : mongoose.Types.ObjectId(branchId)} , {isDelete  : false} ]}},
      {$project : {name : 1 , email : 1 , mobile : 1}}
    ])
    
    // .find({ branch: branchId , isDelete : false})
    // let { users } = await Branch.findOne({ branches: branchId }).populate(
    //     'users'
    //   )
    return res.status(200).send(users)
  } catch (error) {
    return res.status(500).send(error)
  }
}

getUser = async (req, res) => {
  try {
    let branchId = req.headers.branchid
    let { id } = req.params
    let users = await User.findById(id)

    if (users.roles.length) {
      users.role = users.roles[0]
    }

    return res.status(200).send(users)
  } catch (error) {
    return res.status(500).send(error)
  }
}
deleteUser = async (req, res) => {
  try {
    let branchId = req.headers.branchid
    let id = req.params.id

    if (id != req.user._id) {
      await User.deleteOne({ _id: id })
      var update = await Institute.updateOne(
        { branches: 'id' },
        { $pull: { id } }
      )
    }

    return res.status(200).send()
  } catch (error) {
    return res.status(500).send(error)
  }
}
getUserInstitute = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    if(!branchId){
      return res.status(400).send("Please send the branchid")
    }
    var  users  = await Institute.aggregate([
      {$match : {branches: mongoose.Types.ObjectId(branchId)}},
      {$project : {users : 1 ,_id : 0}},
      
      {$lookup : {
        from: 'users',
        localField: 'users',
        foreignField: '_id',
        as: 'users'
      }},
      {$unwind : "$users"},
      {$replaceRoot: { newRoot: '$users' }},
      {$match : {isDelete : !true}},
      {$project : {name : 1 ,email : 1 , mobile :1}}
    ])

    return res.status(200).send(users)
  } catch (error) {
    return res.status(500).send(error)
  }
}

module.exports = {
  createUserInstitute,
  createUserBranch,
  userRolesDdrBranch,
  userRolesDdrInstitute,
  createUser,
  getUserInstitute,
  getUsers,
  getUser,
  deleteUser
}
