const Branch = require('../models/branch-model')
const Institute = require('../models/institute-model')
const User = require('../models/user-model')
const Student = require('../models/student-model')
const mongoose = require('mongoose')
const { ROLE_LABLE } = require('../models/constants')
var path = require('path')
const { response } = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

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
            currentBatch:req.body.currentBatch
          }
        }
      )
    }
    return res.status(200).send(student)
  } catch (error) {
    return res.status(500).send(error)
  }
}

resetPassword = async (req, res) => {
  try {
    let { password, confirmPassword } = req.body
    let id = req.params.id

    if (password === confirmPassword) {
      var passhash = await bcrypt.hash(password, 8)
      await Student.updateOne(
        { _id: id },
        {
          $set: {
            password: passhash
          }
        }
      )
      return res.status(200).send('password Changes Successfully')
    }
    return res.status(400).send('Passsword Did not match ')
  } catch (error) {
    return res.status(500).send(error)
  }
}
UploadProfileImage = async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      })
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let file = req.files.file
      var id = req.params.id

      var filename =
        file.name.substr(0, file.name.lastIndexOf('.')).substr(0, 10) +
        path.extname(file.name)
      file.mv('./public/uploads/Profiles/' + id + filename)

      await Student.updateOne(
        { _id: id },
        {
          $set: {
            profileImage: id + filename
          }
        }
      )
      return res.status(200).send({
        status: true,
        message: 'File is uploaded',
        name: id + filename,
        mimetype: file.mimetype
      })
    }
  } catch (err) {
    res.status(500).send(err)
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
    const { batches } = await Branch.findOne(
      { 'batches._id': student.currentBatch },
      { 'batches.$': 1 }
    )
    return res.status(200).send({ student, batches })
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
getMyProfile = async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const data = jwt.verify(token, process.env.JWT_KEY)
    Student.findOne({ _id: data._id, 'tokens.token': token })
      .populate('branch', 'name')
      .exec((err, student) => {
        if (err) {
          return res.status(500).send(err)
        }
        if (!student) {
          return res.status(401).send({ error: 'need to sign in' })
        }
        return res.status(200).send({
          name: student.name,
          email: student.email,
          _id: student._id,
          username: student.name,
          mobile: student.mobile,
          branch: student.branch,
          profileImage: student.profileImage
        })
      })
  } catch (error) {
    return res.status(500).send(error)
  }
}
uploadMyProfile = async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      })
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let file = req.files.file
      const token = req.header('Authorization').replace('Bearer ', '')
      const data = jwt.verify(token, process.env.JWT_KEY)
      var filename =
        data._id +
        file.name.substr(0, file.name.lastIndexOf('.')).substr(0, 10) +
        path.extname(file.name)
      file.mv('./public/uploads/Profiles/' + filename)

      await Student.updateOne(
        { _id: data._id },
        {
          $set: {
            profileImage: filename
          }
        }
      )
      return res.status(200).send({
        status: true,
        message: 'File is uploaded',
        name: filename,
        mimetype: file.mimetype
      })
    }
  } catch (err) {
    res.status(500).send(err)
  }
}
changeMyPassword = async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const data = jwt.verify(token, process.env.JWT_KEY)
    let { oldPassword, password, confirmPassword } = req.body
    let id = data._id

    var student = await Student.findById(id)
    const isPasswordMatch = await bcrypt.compare(oldPassword, student.password)

    if (isPasswordMatch && password === confirmPassword) {
      var passhash = await bcrypt.hash(password, 8)
      await Student.updateOne(
        { _id: id },
        {
          $set: {
            password: passhash
          }
        }
      )
      return res.status(200).send('password Changes Successfully')
    }
    return res.status(400).send('Passsword Did not match ')
  } catch (error) {
    return res.status(500).send(error)
  }
}

updateRecentStudentData = async (req , res) => {
  try {
    const {id , date } = req.body
    const student  = await Student.updateOne(
      { _id: req.user._id },
      { $pull:{  recentHistory : { courseId : id }} } ,
    )
    const studentUpdate  = await Student.updateOne(
      { _id: req.user._id },
      { $push: { recentHistory : {courseId : id , dateTime : date} } } ,
    )
    
      await student.save()
      await studentUpdate.save()
    
    res.status(200).send()
  } catch (error) {
    res.status(500).send()
  }
}

StudentProgress = async (req ,res) => {
  try {
    const {id , date } = req.body
    const student  = await Student.updateOne(
      { _id: req.user._id },
      { $push:{  
        courseProgress : 
          { courseId : courseId  ,
            Progress : [{
              contentId : contentId,
              sectionsId : sectionsId,
            }]
          }
               }
      },
    )
    
  } catch (error) {
    
  }
}



module.exports = {
  addStudent,
  getStudents,
  getStudent,
  getBatchesDdr,
  resetPassword,
  UploadProfileImage,
  getMyProfile,
  uploadMyProfile,
  changeMyPassword,
  updateRecentStudentData,
  StudentProgress
}
