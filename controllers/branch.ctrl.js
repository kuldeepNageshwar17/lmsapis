const Branch = require('../models/branch-model')
const User = require('../models/user-model')
const Institute = require('../models/institute-model')

var path = require('path')
const { response } = require('express')

saveBranch = async (req, res) => {
  try {
    var branch = new Branch(req.body)

    if (req.body._id) {
      branch = await Branch.findByIdAndUpdate(
        { _id: req.body._id },
        {
          $set: {
            name: branch.name,
            code: branch.code,
            address: branch.address
          }
        },
        { new: true }
      )
      return res.status(200).send(branch)
    } else {
      var parentBranch = await Branch.findById(req.headers.branchid)
      if (!parentBranch) {
        return res.status(400).send(error)
      }
      branch.institute = parentBranch.institute
      await Institute.updateOne(
        { _id: parentBranch.institute },
        { $push: { branches: branch._id } }
      )

      await branch.save()
      // var user = await User.findById(req.user._id)
      // user.branches.push(branch._id)
      // await user.save()
    }
    return res.status(200).send(branch)
  } catch (error) {
    return res.status(500).send(error)
  }
}
deleteBranch = async (req, res) => {
  try {
    //  user.branches.pull(req.body._id);
    Branch.findByIdAndRemove(req.body.id, (err, result) => {
      if (!err) {
        User.updateMany({}, { $pull: { branches: req.body.id } }).exec()
        return res.status(200).send(result)
      } else {
        console.log(error)
      }
    })
  } catch (error) {
    return res.status(500).send(error)
  }
}
getBranches = async (req, res) => {
  var branchId = req.headers.branchid

  var { branches } = await Institute.findOne({
    branches: branchId
  }).populate('branches')
  // var branches= institute.branches
  return res.status(200).send(branches)
}
getBranch = async (req, res) => {
  try {
    Branch.findOne({ _id: req.params.id }).exec((err, response) => {
      if (err) {
        console.log(err)
        return res.status(500).send({ message: 'server error', error })
      }

      return res.status(200).send(response)
    })

    //  var branches=
  } catch (error) {
    return res.status(500).send({ message: 'internal server error' })
  }
}
saveClass = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    var institute = await Institute.findOne({
      branches: branchId
    })

    if (institute) {
      if (req.body.id) {
        let c = institute.classes.find(x => x._id == req.body.id)
        c.name = req.body.name
        c.description = req.body.description
        
      } else {
        //var result = await Branch.findOneAndUpdate(

        institute.classes.push({
          name: req.body.name,
          description: req.body.description
        })
        // { _id: branchId, branchOwners: req.user._id },
        // {
        //   $push: {
        //     classes: {
        //       name: req.body.name,
        //       description: req.body.description
        //     }
        //   }
        //},{ new: true }
        //)
      }
      institute.save()
      return res.status(200).send()
    } else {
      return res.status(401).send('institute id  not find')
    }
  } catch (error) {
    return res.status(500).send({ message: 'server error', error })
  }
}

getClasses = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    if (branchId) {
      var institute = await Institute.findOne(
        {
          branches: branchId
        },
        { classes: 1 }
      )
      return res.status(200).send(institute.classes)
    }
    return res.status(400).send({ message: 'bad request' })
  } catch (error) {
    return res.status(500).send({ message: 'server error', error })
  }
}
getClass = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    var classid = req.params.id

    if (branchId) {
      var institute = await Institute.findOne(
        {
          branches: branchId
        },
        { classes: 1 }
      )
      let classs=institute.classes.find(m=>m._id==classid)

      return res.status(200).send(classs);      
    }
  } catch (error) {
    return res.status(500).send({ message: 'server error', error })
  }
}
deleteClass= async (req, res) => {
  try {
    var branchId = req.headers.branchid
    var classid = req.params.id

    if (branchId) {
      var institute = await Institute.updateOne(
        {
          "classes._id": classid
        },
        { $pull:{ classes:{"_id":classid}}}
      )
     
      return res.status(200).send(true);      
    }
  } catch (error) {
    return res.status(500).send({ message: 'server error', error })
  }
}

module.exports = {
  saveBranch,
  deleteBranch,
  getBranches,
  getBranch,
  saveClass,
  getClasses,
  getClass,
  deleteClass
}
