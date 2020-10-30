const ExamResult = require('../models/examResult-model')
const Examination = require('../models/examination-model')
const mongoose = require('mongoose')

const ChangeCompleteStatusExam = async id => {
  try {
    var exam = await Examination.findOne({ _id: id })
    exam.isComplete = false
    if (exam.questions) {
      var TotalQuestionMarks = exam.questions.reduce((sum, item) => {
        if (!isNaN(item.marks)) sum += item.marks
        return sum
      }, 0)
      if (!isNaN(exam.totalMarks) && TotalQuestionMarks == exam.totalMarks) {
        exam.isComplete = true
      }
    }
    await exam.save((err, result) => {
      debugger
      return
    })
  } catch (error) {
    console.log(error)
  }
}

const saveCalculateResult = async req => {
  try {
    var anshwerSheet = new ExamResult(req.body)
    anshwerSheet.batchId = req.user.currentBatch
    anshwerSheet.studentId = req.user._id
    var obMarks = 0
    var Exam = await Examination.findOne(anshwerSheet.examId)
    var questionList = Exam.questions.toObject()
    if (questionList) {
      var noOfTotalQuestion = questionList.length
      anshwerSheet.totalMarks = Exam.totalMarks
      var noOfRight = 0;
      var noOfWrong = 0;
      anshwerSheet.anshwerSheet.forEach(async (item, index) => {
        var q = questionList.find(ele => {
          var s = String(ele._id) === String(item.qid)
          return s
        })
        if (q) {
          var trueOptionArray = q.options
            .filter(m => m.isRight === true)
            .map(m => String(m._id))
          if (JSON.stringify(item.options) == JSON.stringify(trueOptionArray)) {
            item.isTrue = true
            item.marks = q.marks
            obMarks += q.marks
          } else {
            item.isTrue = false
            item.marks = 0
          }

          if(item.isTrue === true){
            noOfRight = noOfRight + 1
          }
          if(item.isTrue === false){
            noOfWrong = noOfWrong + 1
          }

        }
      })
      anshwerSheet.obtainedMarks = obMarks
      if (obMarks >= Exam.passingMarks) {
        anshwerSheet.result = true
      } else {
        anshwerSheet.result = false
      }
      anshwerSheet.noOfTotalQuestion = noOfTotalQuestion
      anshwerSheet.noOfRight = noOfRight
      anshwerSheet.noOfWrong = noOfWrong
      anshwerSheet.attempted = noOfWrong + noOfRight
    }

    const result = await anshwerSheet.save()
    return {
      totalMarks: anshwerSheet.totalMarks,
      obtainedMarks: anshwerSheet.obtainedMarks,
      result: anshwerSheet.result,
      resultId : result._id,
      noOfTotalQuestion : noOfTotalQuestion ,
      attempted : noOfRight + noOfWrong ,
      noOfRight : noOfRight,
      noOfWrong : noOfWrong

    }
  } catch (error) {
    console.log(error)
  }
}
module.exports = {
  saveCalculateResult,
  ChangeCompleteStatusExam
}
