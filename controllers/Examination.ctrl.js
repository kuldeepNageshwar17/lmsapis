const Institute = require('../models/institute-model')
const Examination = require('../models/examination-model')
const ExamResult = require('../models/examResult-model')
const mongoose = require('mongoose')
const { ROLE_LABLE } = require('../models/constants')
const Branch = require('../models/branch-model')
const  {ChangeCompleteStatusExam,saveCalculateResult} = require('../services/examinations.service')
var path = require('path')
const { response } = require('express')
const { schedulingPolicy } = require('cluster')
const { start } = require('repl')

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
    const { id } = req.params
    if (id) {
      await Examination.updateOne(
        {_id : id },
        { $pull: { questions: req.body } }
      )
      return res.status(200).send(true)
    }else{
      return res.status(400).send(false)
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
examSchedule = async (req , res) => {
  try {
    
   var branchId = req.headers.branchid
   var examId = req.params.examId
  //  var d = new Date(date)
     
  
   var startDate =  new Date(req.body.startDate).toLocaleString()
  //  startDate = startDate.
   var endDate =  new Date(req.body.endDate).toLocaleString()
   if(!branchId){return res.status(400).send("Please send the branchId")}
   if(!examId){return res.status(400).send("Please send the examId")} 
   const institute = await Institute.aggregate([
     {$match : {branches : mongoose.Types.ObjectId(branchId)}},
     {$project : {classes  : 1}},
     {$unwind : "$classes"},
     {$unwind : "$classes.examinations"},
     {$match : {"classes.examinations" :  mongoose.Types.ObjectId(examId)}},
     {$lookup : 
      {
        from: 'examinations',
        localField: 'classes.examinations',
        foreignField: '_id',
        as: 'classes.examinations'

     }},
     {$unwind : "$classes.examinations"},
     {$match : {"classes.examinations.isComplete" : true }},
     {$project : {"classes._id" : 1 , "classes.name" : 1 , "classes.examinations._id" : 1 ,"classes.examinations.isComplete" : 1  }}
    
   ])
    if(institute.length > 0){
    const institutenew = await Institute.updateOne(
        { branches: branchId, 'classes._id': institute[0].classes._id },
        { $push: { 'classes.$.examSchedule':  {examId : institute[0].classes.examinations._id , startDate : startDate  , endDate : endDate  } } }
      )
      return res.status(200).send(institutenew)
    }else{
      return res.status(400).send("Complete the exam first")
    }
  } catch (error) {
    res.status(500).send(error)
  }
}
updateSchedule = async (req , res) => {
  try {
    var branchId = req.headers.branchid
    const { classID ,id  } = req.body
    var startDate =  new Date(req.body.startDate).toLocaleString(undefined, {timeZone: "Asia/Kolkata"});
    var endDate =  new Date(req.body.endDate).toLocaleString(undefined, {timeZone: "Asia/Kolkata"});
    if(!branchId){return res.status(400).send("Please send the branchId")}
    if(!classID && !id){return res.status(400).send("Please send the classId and id")}
  var data = await Institute.updateOne(
    { branches: branchId },
    {
      $set: {
        'classes.$[i].examSchedule.$[j].isActive': true,
        'classes.$[i].examSchedule.$[j].startDate': startDate,
        'classes.$[i].examSchedule.$[j].endDate': endDate,

      }
    }, {
      arrayFilters: [
              { 'i._id': classID },
              { 'j._id': id }
      ]
  })
   return res.status(200).send(data)
  
  } catch (error) {
    return res.status(500).send()
  }
}
updateActive = async (req , res) => {
  try {
    var branchId = req.headers.branchid
    const { classID ,id , isActive  } = req.body
    console.log(req.body)
    if(!branchId){return res.status(400).send("Please send the branchId")}
    if(!classID && !id){return res.status(400).send("Please send the classId and id")}
  var data = await Institute.updateOne(
    { branches: branchId },
    {
      $set: {
        'classes.$[i].examSchedule.$[j].isActive': isActive 
      }
    }, {
      arrayFilters: [
              { 'i._id': classID },
              { 'j._id': id }
      ]
  })
   return res.status(200).send(data)
  
  } catch (error) {
    return res.status(500).send()
  }
}


deleteScheduleExam = async (req , res) => {
  try {
    const branchId  = req.headers.branchid
    const {isActive , _id , examId ,startDate ,endDate , classID } = req.body
    const institutenew = await Institute.updateOne(
      { branches: branchId, 'classes._id': classID },
      { $pull: { 'classes.$.examSchedule':  
          {isActive ,
            _id ,
            examId ,
            startDate ,
            endDate ,
             } 
      } }
    )
    return res.status(200).send(institutenew)
    
  } catch (error) {
    return res.status(500).send()
  }
}


getExamSchedule = async(req , res) => {
  try {
    var branchId = req.headers.branchid
  const institute = await Institute.aggregate([
    {$match : {branches : mongoose.Types.ObjectId(branchId)}},
    {$project : {classes  : 1}},
    {$unwind : "$classes"},
    {$unwind : "$classes.examSchedule"},
    {$project : {'classes._id' : 1 ,'classes.name' : 1 , "classes.examSchedule" : 1}},
{
    
      $lookup : 
        {
          from: 'examinations',
          localField: 'classes.examSchedule.examId',
          foreignField: '_id',
          as: 'classes.examSchedule.examId'
        }
      
    }
 ,{$project : {'classes._id' : 1 ,'classes.name' : 1 , "classes.examSchedule.isActive" : 1 , "classes.examSchedule._id" : 1 ,
  "classes.examSchedule.startDate" : 1 , "classes.examSchedule.endDate" : 1 , "classes.examSchedule.examId.name" : 1   , "classes.examSchedule.examId._id" : 1 ,"classes.examSchedule.examId.description" : 1   }}
//  {$project : {'classes.name' : 1 , "classes.examSchedule" : 1 ,"classes.examSchedule.examId.name" : 1 }},
    // {$project : {}}
    // {$match : {"classes.examinations" :  mongoose.Types.ObjectId(examId)}},
    // {$lookup : 
    //  {
    //    from: 'examinations',
    //    localField: 'classes.examinations',
    //    foreignField: '_id',
    //    as: 'classes.examinations'

    // }},
    // {$unwind : "$classes.examinations"},
    // {$match : {"classes.examinations.isComplete" : true }},
    // {$project : {"classes._id" : 1 , "classes.name" : 1 , "classes.examinations._id" : 1 ,"classes.examinations.isComplete" : 1  }}
  ])
  res.status(200).send(institute)
  } catch (error) {
    res.status(500).send()
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
    var  classes  = await Institute.aggregate([
      {$match : {$and : [{ branches: branch._id} , { 'classes._id': Classid }]}},
      {$unwind : "$classes"},
      {$match : {"classes._id" : Classid}},
      {$project : {"classes.examSchedule" : 1}},
      {$unwind : "$classes.examSchedule"},
      {$lookup : 
        {
          from: 'examinations',
          localField: 'classes.examSchedule.examId',
          foreignField: '_id',
          as: 'classes.examSchedule.examId'
  
       }},
       {$replaceRoot : {newRoot : "$classes.examSchedule"}},
       {$match : {isActive : true}},
       {$project : {_id : 1 ,startDate : 1 , endDate : 1 ,isActive : 1, "examId._id" : 1 , "examId.name" : 1 , "examId.passingMarks" : 1 , "examId.description" : 1 , "examId.timeInHours" : 1  , "examId.timeInMinutes" : 1 , "examId.totalMarks" : 1}},
       {$sort : {startDate : 1}}
    ])
    
    return res.status(200).send(classes)
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
        'questions.options.imagePath': 1,
        timeInHours  :1 ,
        timeInMinutes : 1
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
getStudentLastExamsResults=async(req, res)=>{
  try {
    var result = await ExamResult.find({"studentId":req.user._id},{result:1,totalMarks:1,obtainedMarks:1 ,noOfRight :1,noOfWrong : 1,attempted :1,noOfTotalQuestion : 1 ,createdAt : 1}).populate("examId" ,  "name").sort({createdAt : -1})
    return res.status(200).send(result)
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
  getQuestion,
  examSchedule,
  getExamSchedule,
  updateSchedule,
  updateActive,
  deleteScheduleExam,
  /////////// Student Apis
  getStudentExams,
  getExamQuestions,
  saveExamResult,
  getStudentLastExamsResults
}
