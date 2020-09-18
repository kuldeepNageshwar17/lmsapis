const Branch = require('../models/branch-model')
const User = require('../models/user-model')

var path = require('path')
const { response } = require('express')

saveBranch = async (req, res) => {
  try {
    var branch = new Branch(req.body)
    branch.branchOwners = []

    if (req.body._id) {
      branch = await Branch.findByIdAndUpdate(
        { _id: branch._id },
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
      branch.branchOwners.push(req.user._id)
      await branch.save()
      var user = await User.findById(req.user._id)
      user.branches.push(branch._id)
      await user.save()
    }
    return res.status(200).send(branch)
  } catch (error) {
    return res.status(500).send(error)
  }
}
deleteBranch = async (req, res) => {
  try {
    console.log(req.body.id)
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
  var user = await User.findById(req.user._id).populate('branches')
  //  var branches=
  return res.status(200).send(user.branches)
}
getBranch = async (req, res) => {
  try {
    console.log(req.params.id)
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
    console.log('userId', req.user._id)
    if (branchId) {
      if (req.body.id) {
        var result = await Branch.findOneAndUpdate(
          { _id: branchId, branchOwners: req.user._id },
          {
            $set: {
              'classes.$[class].name': req.body.name,
              'classes.$[class].description': req.body.description
            }
          },
          {
            new: true,
            arrayFilters: [{ 'class._id': req.body.id }]
          }
        )
        return res.status(200).send(result)
      } else {
        var result = await Branch.findOneAndUpdate(
          { _id: branchId, branchOwners: req.user._id },
          {
            $push: {
              classes: {
                name: req.body.name,
                description: req.body.description
              }
            }
          },
          { new: true }
        )

        return res.status(200).send(result)
      }
    } else {
      return res.status(401).send('branch id  not find')
    }
  } catch (error) {
    return res.status(500).send({ message: 'server error', error })
  }
}

getClasses = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    if (branchId) {
      var { classes } = await Branch.findById(branchId)
      return res.status(200).send(classes)
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
      Branch.findOne(
        { _id: branchId },
        { classes: { $elemMatch: { _id: classid } } }
      ).exec((err, response) => {
        if (err) {
          console.log(err)
          return res.status(500).send({ message: 'server error', error })
        }
        return res.status(200).send(response.classes[0])
      })
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
  getClass
}
