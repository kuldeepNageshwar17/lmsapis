const Year = require('../models/year-model')
const Branch = require('../models/branch-model')
const mongoose = require('mongoose')

var path = require('path')
const { response } = require('express')

saveYear = async (req, res) => {
  try {
    var year = new Year(req.body)
    if (req.body._id) {
      year = await year.findByIdAndUpdate(
        { _id: year._id },
        {
          $set: {
            name: year.name
          }
        },
        { new: true }
      )
      return res.status(200).send(year)
    } else {
      await year.save()
    }
    return res.status(200).send(year)
  } catch (error) {
    return res.status(500).send(error)
  }
}

addYearToBranch = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    await Branch.updateOne(
      { _id: branchId },
      { $push: { years: req.body.year } },
      { new: true }
    ).exec((err, response) => {
      if (!err) {
        return res.status(200).send(response)
      }
      return res.status(500).send(error)
    })
  } catch (error) {
    return res.status(500).send(error)
  }
}
getYearOfBranch = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    years = await Branch.findById(branchId, { years: 1 })
    return res.status(200).send(years.years)
  } catch (error) {
    return res.status(500).send(error)
  }
}

CreteBatch = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    if (req.body._id) {
      branch = await Branch.updateOne(
        { _id: branchId },
        {
          $set: {
            'classes.$[class].batches.$[batch].name': req.body.name,
            'classes.$[class].batches.$[batch].description':
              req.body.description,
            'classes.$[class].batches.$[batch].year': req.body.year
          }
        },
        {
          new: true,
          arrayFilters: [
            { 'class._id': req.body.classId },
            { 'batch._id': req.body.id }
          ]
        }
      ).exec((err, response) => {
        if (!err) {
          return res.status(200).send(response)
        }
        return res.status(500).send(error)
      })
    } else {
      Branch.updateOne(
        { _id: branchId },
        {
          $push: {
            'classes.$[class].batches': {
              year: req.body.year,
              name: req.body.name,
              description: req.body.description
            }
          }
        },
        {
          new: true,
          arrayFilters: [{ 'class._id': req.body.classId }]
        }
      ).exec((err, response) => {
        if (!err) {
          return res.status(200).send(response)
        }
        return res.status(500).send(error)
      })
    }
  } catch (error) {
    return res.status(500).send(error)
  }
}
getBatches = async (req, res) => {
  var branchId = req.headers.branchid
  try {
    var classes = await Branch.findOne(
      { _id: branchId },
      { 'classes.batches': 1, 'classes.name': 1 }
    )
    return res.status(200).send(classes)
  } catch (error) {
    return res.status(500).send(error)
  }
}
getBatch = async (req, res) => {
  var branchId = req.headers.branchid
  var batchid = req.params.id
  try {
    var branchresult = await Branch.aggregate([
      { $unwind: '$classes' },
      { $unwind: '$classes.batches' },
      {
        $match: {
          _id: mongoose.Types.ObjectId(branchId),
          'classes.batches._id': mongoose.Types.ObjectId(batchid)
        }
      }
    ])
    if (branchresult) {
     let  result = branchresult[0].classes.batches;
     result.classId= branchresult[0].classes._id;
      return res.status(200).send(result);
    }
    return res.status(401).send("not found")
  } catch (error) {
    return res.status(500).send(error)
  }
}
GetBranchClassesDdr = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    var classes = await Branch.findOne(
      { _id: branchId },
      { 'classes.name': 1, 'classes._id': 1 }
    )
    return res.status(200).send(classes)
  } catch (error) {
    console.log(error)
  }
}
GetBranchYearDdr = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    var { years } = await Branch.findOne(
      { _id: branchId },
      { years: 1, _id: 0 }
    )
    return res.status(200).send(years)
  } catch (error) {
    console.log(error)
  }
}
module.exports = {
  saveYear,
  addYearToBranch,
  getYearOfBranch,
  CreteBatch,
  getBatch,
  getBatches,
  GetBranchClassesDdr,
  GetBranchYearDdr
}
