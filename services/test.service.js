const Test = require('../models/test-model')
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

// const saveCalculateResult = async req => {
//   try {
//     var anshwerSheet = new ExamResult(req.body)
//     anshwerSheet.batchId = req.user.currentBatch
//     anshwerSheet.studentId = req.user._id
//     var obMarks = 0
//     var Exam = await Examination.findOne(anshwerSheet.examId)
//     var questionList = Exam.questions.toObject()
//     if (questionList) {
//       anshwerSheet.totalMarks = Exam.totalMarks
//       anshwerSheet.anshwerSheet.forEach(async (item, index) => {
//         var q = questionList.find(ele => {
//           // console.log(ele)
//           var s = String(ele._id) === String(item.qid)
//           return s
//         })
//         if (q) {
//           // console.log(q.options);
//           var trueOptionArray = q.options
//             .filter(m => m.isRight === 'true')
//             .map(m => String(m._id))
//           if (JSON.stringify(item.options) == JSON.stringify(trueOptionArray)) {
//             item.isTrue = true
//             item.marks = q.marks
//             obMarks += q.marks
//           } else {
//             item.isTrue = false
//             item.marks = 0
//           }
//         }
//       })
//       anshwerSheet.obtainedMarks = obMarks
//       if (obMarks > Exam.passingMarks) {
//         anshwerSheet.result = true
//       } else {
//         anshwerSheet.result = true
//       }
//     }
//     console.log(anshwerSheet)

//     anshwerSheet.save((err, result) => {
//       if (!err) {
//         console.log(err)
//       }
//     })
//     return {
//       totalMarks: anshwerSheet.totalMarks,
//       obtainedMarks: anshwerSheet.obtainedMarks,
//       result: anshwerSheet.result
//     }
//   } catch (error) {
//     console.log(error)
//   }
// }
module.exports = {
//   saveCalculateResult,
  ChangeCompleteStatusTest
}
