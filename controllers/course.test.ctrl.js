const mongoose = require('mongoose')
const Test  = require('../models/test-model')
const Course = require('../models/course-model') 
const  { ChangeCompleteStatusTest } = require('../services/test.service')

//it create or updated the test under course/
saveTest = async (req, res) => {
      try {
        const { _id , name , description , timeInHours , timeInMinutes , passingMarks , totalMarks } = req.body
        const { courseId }= req.params
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
              {'_id'  : courseId} , 
              {$push : {'test' : test._id}}
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
    const { courseId } = req.params
    if(courseId){
      const testArray = await Course.aggregate([
        {$match : {'_id' : mongoose.Types.ObjectId(courseId)}},
        
        {$project  : {'test' : 1 }},
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

//get a test by testId
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
    const { testId , courseId } = req.params
    if(testId){
      await Course.updateOne(
        {'_id'  : courseId} , 
        {$pull : {'test' : testId}}
      )
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
getCourseTestQuestionList = async (req, res) => {
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




module.exports = {
  saveTest,
  getAllTestsBySection,
  GetTestById,
  deleteTestById,
  addQuestion,
  getCourseTestQuestionList,
  getTestQuestionById,
  deleteQuestionById
}
