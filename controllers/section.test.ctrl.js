const mongoose = require('mongoose')
const Test  = require('../models/test-model')
const Course = require('../models/course-model') 
const Branch = require('../models/branch-model')
const Institute = require('../models/institute-model')
const  { ChangeCompleteStatusTest } = require('../services/test.service')

//it create or updated the test under course/section/
saveTest = async (req, res) => {
      try {
        const { _id , name , description , timeInHours , timeInMinutes , passingMarks , totalMarks } = req.body
        const { sectionId }= req.params
        if (_id) {
          await Test.findByIdAndUpdate(_id, {
            name: name,
            description: description,
            timeInMinutes:timeInMinutes,
            timeInHours:timeInHours,
            passingMarks:passingMarks,
            totalMarks:totalMarks,
          })
         await ChangeCompleteStatusTest(_id);
          return res.status(200).send('true')
        } else {
          var test = new Test(req.body)
          var test = await test.save()
          await ChangeCompleteStatusTest(test._id);
          await Course.updateOne(
              {'sections._id'  : sectionId} , 
              {$push : {'sections.$.test' : test._id}}
          )
          
    
          return res.status(200).send(test)
        }
      } catch (error) {
        return res.status(500).send(error)
      }
}

//get all test by sectionId
getAllTestsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params
    if(sectionId){
      const testArray = await Course.aggregate([
        {$unwind : '$sections'},
        {$match : {'sections._id' : mongoose.Types.ObjectId(sectionId)}},
        
        {$project  : {'sections.test' : 1 }},
        { $replaceRoot: { newRoot: "$sections" } },
        {$lookup:
          {
            from: 'tests',
            localField: 'test',
            foreignField: '_id',
            as: 'test'
          }}
      ])
      if(testArray.length){
        return res.status(200).send(testArray[0].test)
      }
      else{
        return res.status(404).send(testArray)
      }
    }else{
      res.status(200).send("please send the sectionId")

    }
    
  } catch (error) {
    return res.status(404).send({"Error" : error})
  }
}
GetTestById = async (req, res) => {
  try {
    const { id } = req.params
    var test = await Test.findOne(
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
    return res.status(200).send(test)
  } catch (error) {
    res.status(500).send({'Error:' : error})
  }
}

//delete test by testId
deleteTestById = async (req, res) => {
  try {
    const { testId , sectionId } = req.params
    if(testId){
      await Course.updateOne(
        {'sections._id'  : sectionId} , 
        {$pull : {'sections.$.test' : testId}}
      )
      // await Course.updateOne(
      //   { 'sections.test': testId },
      //   { $pull: { 'sections.$.test': testId } }
      // )
      return res.status(200).send(true)
    }
    else{
      return res.status(406).send("Please send testId")
    }
  } catch (error) {
    return res.status(404).send({"Error" : error})
  }
}


//add Question into Test by testid
addQuestion = async (req, res) => {
  try {
    //questionId = _id  testid = id
    const { _id } = req.body
    const { id } = req.params
    if (_id) {
      await Test.updateOne(
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
      await Test.updateOne(
        { _id: id },
        {
          $set: { 'questions.$[i].options': req.body.options }
        },
        { arrayFilters: [{ 'i._id': _id }] }
      )
       ChangeCompleteStatusTest(id);
      return res.status(200).send('true')
    } else {
      await Test.updateOne(
        { _id: id },
        { $push: { questions: req.body } }
      )
      ChangeCompleteStatusTest(id);
      return res.status(200).send(true)
    }
  } catch (error) {
    return res.status(500).send(error)
  }
}
//GetQuestion for Test by test id
getQuestionListTest = async (req, res) => {
  try {
    const { id } = req.params
    var { questions } = await Test.findOne(
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

//get question by question id
getTestQuestionById = async (req, res) => {
  try {
    const { QId } = req.params
    if (QId) {
      var test = await Test.aggregate([
        { $unwind: '$questions' },
        { $match: { 'questions._id': mongoose.Types.ObjectId(QId) } }
      ])
      if (test.length) return res.status(200).send(test[0].questions)
      else {
        return res.status(400).send('not found')
      }
    }
  } catch (error) {
    return res.status(500).send(error)
  }
}

//delete a single question by questionId
deleteQuestionById = async (req, res) => {
  try {
    const { id } = req.params
    if (id) {
      await Test.updateOne(
        { _id: id },
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

// giving test 


getStudentTests = async (req, res) => {
  try {
  //   var currentBatch = "5f89884a3cc2ae10e8df36c0"
  //   // req.user.currentBatch
  //   var branch = await Branch.findOne(
  //     { 'batches._id': mongoose.Types.ObjectId(currentBatch) },
  //     { 'batches.$': 1 }
  //   )
  //   const Classid = branch.batches[0].class
  //   var  classes  = await Institute.findOne(
  //     { branches: branch._id, 'classes._id': Classid },
  //     { 'classes.courses': 1 }
  //   )
  //  var courses = classes.classes[0].courses
  //  const coursesData =await Course.find({_id :  courses } ) 
    // var classes = await Institute.aggregate([
    //   {$match : { branches: branch._id, 'classes._id': Classid } },
    //   // {$unwind : "$classes"},
    //   // {$project : {classes : 1}},
      
    //   // {$project : { 'classes.courses': 1 }},
    //   // { $replaceRoot: { newRoot: "$classes" } }
    // ])
    // console.log(coursesData)
    // var tests = await Test.find(
    //   { _id: { $in: classes[0].examinations } },
    //   { name: 1, description: 1, class: 1 }
    // )

    return res.status(200).send(coursesData)

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
getStudentLastExamsResults=async(req, res)=>{
  try {
    var result = await ExamResult.find({"studentId":req.user._id},{result:1,totalMarks:1,obtainedMarks:1}).populate("examId name")
 return res.status(200).send(result)
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}


module.exports = {
  saveTest,
  getAllTestsBySection,
  GetTestById,
  deleteTestById,
  addQuestion,
  getQuestionListTest,
  getTestQuestionById,
  deleteQuestionById,
  getStudentTests
}
