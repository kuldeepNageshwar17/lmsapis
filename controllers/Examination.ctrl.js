const Institute = require('../models/institute-model')
const Examination = require('../models/examination-model')
const ExamResult = require('../models/examResult-model')
const mongoose = require('mongoose')
const { ROLE_LABLE } = require('../models/constants')
const Branch = require('../models/branch-model')
const  {ChangeCompleteStatusExam,saveCalculateResult} = require('../services/examinations.service')
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
        class: 1,
        totalMarks:1,
        passingMarks:1,
        timeInHours:1,
        timeInMinutes:1
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
        description: req.body.description,
        timeInMinutes:req.body.timeInMinutes,
        timeInHours:req.body.timeInHours,
        passingMarks:req.body.passingMarks,
        totalMarks:req.body.totalMarks,
      })
     await ChangeCompleteStatusExam(_id);
      return res.status(200).send('true')
    } else {
      var exam = new Examination(req.body)
      var exam = await exam.save()
      ChangeCompleteStatusExam(exam._id);

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
    
    var institute = await Institute.findOne(
      { branches: branchId },
      { classes: 1, examinations: 1 ,}
    ).populate('classes.examinations', 'name description totalMarks passingMarks isComplete')
    if (institute) return res.status(200).send(institute)
    else return res.status(404)

    return res.status(404).send('not Found')
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
//add Question into Exams by examid
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
            "questions.$[i].marks": req.body.marks

          },
          $unset: {
            'questions.$[i].options': ''
          }
        },
        { arrayFilters: [{ 'i._id': _id }] }
      )
      await Examination.updateOne(
        { _id: id },
        {
          $set: { 'questions.$[i].options': req.body.options }
        },
        { arrayFilters: [{ 'i._id': _id }] }
      )
      ChangeCompleteStatusExam(id);
      return res.status(200).send('true')
    } else {
      // var exam = await exam.save()
      await Examination.updateOne(
        { _id: id },
        { $push: { questions: req.body } }
      )
      ChangeCompleteStatusExam(id);
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

////////////////////////////////////////////////////
/////////// Student Apis
////////////////////////////////////////////////////
/////
//Api to Get student Class Course
////

getStudentExams = async (req, res) => {
  try {
    var currentBatch = req.user.currentBatch
    var branch = await Branch.findOne(
      { 'batches._id': mongoose.Types.ObjectId(currentBatch) },
      { 'batches.$': 1 }
    )
    const Classid = branch.batches[0].class
    var { classes } = await Institute.findOne(
      { branches: branch._id, 'classes._id': Classid },
      { 'classes.$': 1 }
    )
    var exams = await Examination.find(
      { _id: { $in: classes[0].examinations } },
      { name: 1, description: 1, class: 1 }
    )
    return res.status(200).send(exams)
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}

getExamQuestions = async (req, res) => {
  try {
    var id = req.params.id

    var exams = await Examination.findOne(
      { _id: id },
      {
        name: 1,
        description: 1,
        'questions.question': 1,
        'questions.imagePath': 1,
        'questions._id': 1,

        'questions.options._id': 1,
        'questions.options.option': 1,
        'questions.options.imagePath': 1
      }
    )
    return res.status(200).send(exams)
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}

saveExamResult = async (req, res) => {
  try {
    var result = await saveCalculateResult(req)
    if (result) return res.status(200).send(result)
    else return res.status(500).send(error)
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}
calculateResult = id => {}
module.exports = {
  GetClassesDdr,
  getQuestionListExam,
  GetExamDetail,
  saveExamDetails,
  GetExams,
  deleteExam,
  addQuestion,
  deleteQuestion,
  getQuestion,
  /////////// Student Apis
  getStudentExams,
  getExamQuestions,
  saveExamResult
}
