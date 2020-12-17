const Test = require('../models/test-model')
const TestResult = require('../models/testResult-model')
const mongoose = require('mongoose')

const ChangeCompleteStatusTest = async id => {
  try {
    var test = await Test.findOne({ _id: id })
    test.isComplete = false
    if (test.questions) {
      var TotalQuestionMarks = test.questions.reduce((sum, item) => {
        if (!isNaN(item.marks)) sum += item.marks
        return sum
      }, 0)
      if (!isNaN(test.totalMarks) && TotalQuestionMarks == test.totalMarks) {
        test.isComplete = true
      }
    }
    await test.save((err, result) => {
      debugger
      return
    })
  } catch (error) {
    console.log(error)
  }
}

const saveCalculateResult = async (req , category) => {
  try {

    if(req.body.leftTime){
      var time = req.body.leftTime
      var Left  = time.hours * 3600 + time.minutes * 60 + time.seconds
      var TimeLeft = Left / 60
    }
    var anshwerSheet = new TestResult(req.body)
     anshwerSheet.TimeLeft = TimeLeft.toFixed(2)
     anshwerSheet.category = category
    if(req.body.sectionId){
      anshwerSheet.sectionId= req.body.sectionId
    }
    if(req.body.courseId){
      anshwerSheet.courseId = req.body.courseId
    }
    
    anshwerSheet.batchId = req.user.currentBatch
    anshwerSheet.studentId = req.user._id
    var obMarks = 0
    var test = await Test.findOne(anshwerSheet.testId)
    var questionList = test.questions.toObject()
    if (questionList) {
       var noOfTotalQuestion = questionList.length
      anshwerSheet.totalMarks = test.totalMarks
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
      if (obMarks >= test.passingMarks) {
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
  ChangeCompleteStatusTest
}
