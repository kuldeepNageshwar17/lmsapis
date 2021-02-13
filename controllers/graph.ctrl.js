const mongoose = require('mongoose')
const TestResult = require('../models/testResult-model')
const {formatDate} = require('../services/dateFormat')
const Branch  = require('../models/branch-model')

// get calassslist Of Exams
GetCourseTestResult = async (req, res) => {
    try {
        if(!req.params.courseId){return res.status(400).send("Send the courseId")}
        var result = await TestResult.find({ $and: [ {"studentId":req.user._id} , {category : "CourseTest"} ,
         {courseId : req.params.courseId}  , {testId : req.params.testId}]},
         {obtainedMarks:1 ,createdAt : 1 , _id : 0 }).populate("testId" , "name").sort("-createdAt")
         var data = []
        var label = []
        var testName = result[0].testId.name
       result.map((single) => {
             var obtainedMarks = single.obtainedMarks
             data.push(obtainedMarks)
            var createdAt = formatDate(single.createdAt)
            label.push(createdAt)
          })
        return res.status(200).send({testName ,data , label })
    } catch (error) {
        return res.status(500).send(error)
    }
  }

  getStudentCourseTestResultForPieChart = async (req , res) => {
    try {
        var result = await TestResult.find({ $and: [ {"studentId":req.user._id} , {category : "CourseTest"} ,
        {courseId : req.params.courseId}  , {testId : req.params.testId}]},
        {result:1  }).populate("testId" , "name").sort("-createdAt")
    
      if(result && result.length){
       
     var data = []
     var i =0
     var j =0;
     var label = ["PassIn" , "FailIn"]
     var testName = result[0].testId.name
      result.map((single) =>{
        if(single.result == true){
            i = i + 1
        }else{
            j = j + 1
        }
        
      })

        return res.status(200).send({testName ,data : [i , j] , label })
      }
      return res.status(200).send(result)
    } catch (error) {
      return res.status(500).send(error)
      
    }
  }
  getNumbersInTestBatchWise = async (req , res) => {
    try {
     var testId =  req.params.testId
      var currentBatch = req.user.currentBatch
      const Results = await TestResult.aggregate([
        {$match : {batchId : mongoose.Types.ObjectId(currentBatch) }},
        {$match : {testId : mongoose.Types.ObjectId(testId) }},
        {$group : {_id :  "$obtainedMarks" , count : {$sum : 1}  }},
      ])
      var data = []
      // data.push(["Marks" , "No Of Student"])
      Results.map((single) =>{
        data.push({x : single._id , y : single.count})
      })
      res.status(200).send(data)
    } catch (error) {
      return res.status(500).send(error)
    }
  }
  getTestByTimeLeft = async (req , res) => {
    try {
      const testId = req.params.testId
     const testResults =  await TestResult.aggregate([
        {$match :{ $and: [ {"studentId":mongoose.Types.ObjectId( req.user._id ) }
         ,{ testId :  mongoose.Types.ObjectId(testId)}]} },
         {$project : {TimeLeft : 1 ,createdAt : 1 , _id : 0 }}
      ])
      var data = []
      var label = []
      var color = [] ;
      testResults.map((single) => {
           var TimeLeft = single.TimeLeft
           data.push(TimeLeft)
          var createdAt = formatDate(single.createdAt)
          label.push(createdAt)
          color.push("Blue")
        })
      return res.status(200).send({data , label , color})
    } catch (error) {
      return res.status(500).send(error)
    }
  }

module.exports = {
    GetCourseTestResult,
    getStudentCourseTestResultForPieChart,
    getNumbersInTestBatchWise,
    getTestByTimeLeft
}