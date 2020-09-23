const Branch = require('../models/branch-model')
const Institute = require('../models/institute-model')
const User = require('../models/user-model')
const Student = require('../models/student-model')
const mongoose = require('mongoose')
const { ROLE_LABLE } = require('../models/constants')
var path = require('path')
const { response } = require('express')

addStudent = async (req, res) => {
  try {
    let student = new Student(req.body)
    let id = req.body._id

    if (!id) {
      let branchId = req.headers.branchid
      student.branch = branchId
      await student.save()
    } else {
      await Student.updateOne(
        { _id: id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password
          }
        }
      )
    }
    return res.status(200).send(student)
  } catch (error) {
    return res.status(500).send(error)
  }
}
getStudents = async (req, res) => {
  let branchId = req.headers.branchid
  try {
    var students = await Student.find({ branch: branchId })
    return res.status(200).send(students)
  } catch (error) {
    return res.status(500).send(error)
  }
}
getStudent = async (req, res) => {
  let id = req.params.id
  try {
    var student = await Student.findOne({ _id: id })
    return res.status(200).send(student)
  } catch (error) {
    return res.status(500).send(error)
  }
}

getBatchesDdr = async (req, res) => {
  let branchId = req.headers.branchid
  try {
    var { batches } = await Branch.findOne({ _id: branchId })
    return res.status(200).send(batches)
  } catch (error) {
    return res.status(500).send(error)
  }
}
module.exports = {
  addStudent,
  getStudents,
  getStudent,
  getBatchesDdr
}
