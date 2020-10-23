const Year = require('../models/year-model')
const Branch = require('../models/branch-model')
const Institute = require('../models/institute-model')
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

var path = require('path')
const { response } = require('express')
const { createBrotliCompress } = require('zlib')

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
      await Branch.updateOne(
        { _id: branchId },
        {
          $set: {
            'batches.$[batch].name': req.body.name,
            'batches.$[batch].description': req.body.description,
            'batches.$[batch].class': req.body.class
          }
        },
        {
          new: true,
          arrayFilters: [{ 'batch._id': req.body._id }]
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
            batches: {
              name: req.body.name,
              description: req.body.description,
              class: req.body.class
            }
          }
        }
      ).exec((err, response) => {
        if (!err) {
          return res.status(200).send(response)
        }
        return res.status(500).send(err)
      })
    }
  } catch (error) {
    return res.status(500).send(error)
  }
}
getBatches = async (req, res) => {
  var branchId = req.headers.branchid
  try {
    var branch = await Branch.findOne(
      { _id: branchId },
      { batches: 1, institute: 1 }
    )
    let { classes } = await Institute.findOne({ branches: branchId })
    let classlist = classes.toObject()
    // console.log(classlist)
    let { batches } = branch
    result = batches.toObject().map(m => {
      return {
        ...m,
        c: classlist.find(
          cl => JSON.stringify(cl._id) === JSON.stringify(m.class)
        )
      }
    })
    return res.status(200).send(result)
  } catch (error) {
    return res.status(500).send(error)
  }
}
getBatch = async (req, res) => {
  var branchId = req.headers.branchid
  var id = req.params.id
  try {
    var { batches } = await Branch.findOne(
      { _id: branchId, 'batches._id': id },
      { 'batches.$': 1, institute: 1 }
    )

    return res.status(200).send(batches)
  } catch (error) {
    return res.status(500).send(error)
  }
}
GetClassesDdr = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    var classes = await Institute.findOne(
      { branches: branchId },
      { 'classes.name': 1, 'classes._id': 1 }
    )
    return res.status(200).send(classes)
  } catch (error) {
    console.log(error)
  }
}

createRole = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    let id = uuidv4()
    var institute = await Institute.updateOne(
      { branches: branchId },
      { $push: {"roles": { id, name: req.body.name, type: req.body.type, isDefault: false } }},
      { upsert: false }    )
    return res.status(200).send(institute)
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
  GetClassesDdr,
  createRole
}
