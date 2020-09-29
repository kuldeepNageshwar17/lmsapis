const Institute = require('../models/institute-model')
const Examination = require('../models/examination-model')
const mongoose = require('mongoose')
const { ROLE_LABLE } = require('../models/constants')

var path = require('path')
const { response } = require('express')

// get calassslist Of Exams
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
//GetQuestion for Exam by exam id
getQuestionListExam = async (req, res) => {
  try {
    const { id } = req.params
    var { questions } = await Examination.findOne(
      { _id: id },
      {
        questions: 1
      }
    )
    return res.status(200).send(questions)
  } catch (error) {
    console.log(error)
  }
}
//Use to get  single exam by id   for user

GetExamDetail = async (req, res) => {
  try {
    const { id } = req.params
    var exam = await Examination.findOne(
      { _id: id },
      {
        name: 1,
        description: 1,
        class: 1
      }
    )
    return res.status(200).send(exam)
  } catch (error) {
    console.log(error)
  }
}
//save and Edit Exams
saveExamDetails = async (req, res) => {
  try {
    const { _id } = req.body
    var branchId = req.headers.branchid

    if (_id) {
      await Examination.findByIdAndUpdate(_id, {
        name: req.body.name,
        description: req.body.description
      })

      return res.status(200).send('true')
    } else {
      var exam = new Examination(req.body)
      var exam = await exam.save()
      await Institute.updateOne(
        { branches: branchId, 'classes._id': req.body.class },
        { $push: { 'classes.$.examinations': exam._id } }
        // {arrayFilters:[{"classes._id":req.body.class}]}
      )

      return res.status(200).send(exam)
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}
//Get all Exams of institute
GetExams = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    var { classes } = await Institute.findOne(
      { branches: branchId },
      { 'classes._id': 1 }
    )
    var exams = await Examination.find(
      { class: { $in: classes } },
      { name: 1, description: 1, class: 1 }
    )
    return res.status(200).send(exams)
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}
// Delete exams by id
deleteExam = async (req, res) => {
  try {
    const { id } = req.params
    var branchId = req.headers.branchid
    // var exam= await Examination.deleteOne({ _id: id});
    await Institute.updateOne(
      { 'classes.examinations': id },
      { $pull: { 'classes.$.examinations': id } }
    )
    return res.status(200).send(true)
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}
//add Questioninto Exams by examid
addQuestion = async (req, res) => {
  try {
    const { _id } = req.body
    const { id } = req.params
    var branchId = req.headers.branchid

    if (_id) {
     
      await Examination.updateOne(
        { _id: id },
        {
          $set: {
            'questions.$[i].question': req.body.question,
          },
          $unset:{
            'questions.$[i].options':""
          }
               },
        { arrayFilters: [{ 'i._id': _id }] }
      )
      await Examination.updateOne(
        { _id: id },
        {
          $set:{ 'questions.$[i].options':req.body.options}
                       },
        { arrayFilters: [{ 'i._id': _id }] }
      )
      return res.status(200).send('true')
    } else {
      // var exam = await exam.save()
      await Examination.updateOne(
        { _id: id },
        { $push: { questions: req.body } }
      )
      return res.status(200).send(true)
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}
deleteQuestion = async (req, res) => {
  try {
    const { _id } = req.body
    const { id } = req.params
    var branchId = req.headers.branchid
    if (id) {
      await Examination.updateOne(
        {},
        { $pull: { 'questions.$': req.body } },
        { arrayFilters: { _id: _id } }
      )
      return res.status(200).send('true')
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}
//get question by question id
getQuestion = async (req, res) => {
  try {
    const { id } = req.params
    var branchId = req.headers.branchid
    if (id) {
      var exam = await Examination.aggregate([
        { $unwind: '$questions' },
        { $match: { 'questions._id': mongoose.Types.ObjectId(id) } }
      ])
      if (exam.length) return res.status(200).send(exam[0].questions)
      else {
        return res.status(400).send('not found')
      }
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}
module.exports = {
  GetClassesDdr,
  getQuestionListExam,
  GetExamDetail,
  saveExamDetails,
  GetExams,
  deleteExam,
  addQuestion,
  deleteQuestion,
  getQuestion
}
