const mongoose = require('mongoose')
const Course = require('../models/course-model')
const Institute = require('../models/institute-model')
var path = require('path')
const { v4: uuidv4 } = require('uuid')
const { COURSE_CONTENT_TYPES } = require('./../models/constants')
const { response } = require('express')
const { getClasses } = require('./branch.ctrl')
const Branch = require('../models/branch-model')
var Ffmpeg = require('fluent-ffmpeg');

getCourseContentTypes = async (req, res) => {
  try {
    let values = Object.keys(COURSE_CONTENT_TYPES)
    var ddr = values.map(item => {
      return { text: COURSE_CONTENT_TYPES[item], value: item }
    })
    res.status(200).send(ddr)
  } catch (error) {
    res.status(400).send(error)
  }
}
saveCourse = async (req, res) => {
  try {
    var course = new Course(req.body)
    course.class = req.params.id
    if (req.body._id) {
      course = await Course.findByIdAndUpdate(
        { _id: req.body._id },
        {
          title: course.title,
          Description: course.Description,
          categories: course.categories,
          posterImageUrl: course.posterImageUrl,
          overview: course.overview
        }
      )
      return res.status(200).send(course)
    } else {
      const c = await course.save()
      await Institute.updateOne(
        { 'classes._id': req.params.id },
        { $push: { 'classes.$.courses': c._id } }
      )
    }
    return res.status(200).send(course)
  } catch (error) {
    return res.status(500).send(error)
  }
}
uploadCourseProfile = async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      })
    } else {
      let file = req.files.file

      var filename =
        uuidv4() +
        file.name.substr(0, file.name.lastIndexOf('.')).substr(0, 20) +
        path.extname(file.name)
      file.mv('./public/uploads/CourseProfile/' + filename)
      res.send({
        status: true,
        message: 'File is uploaded',
        name: filename,
        mimetype: file.mimetype
      })
    }
  } catch (error) {}
}
deleteCourse = async (req, res) => {
  Course.findByIdAndRemove(req.params.id)
    .then(entity => {
      if (!entity) {
        return res.status(404).send({
          message: 'Course not found with id ' + req.params.id
        })
      }
      res.status(200).send({ message: 'course deleted successfully!' })
    })
    .catch(err => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: 'Course not found with id ' + req.params.id
        })
      }
      return res.status(500).send({
        message: 'Could not delete Course with id ' + req.params.id
      })
    })
}
getCourse = async (req, res) => {
  try {
    var course = await Course.findOne({
      _id: req.params.id,
      $or: [
        { sections: { $elemMatch: { deleted: !true } } },
        { sections: { $size: 0 } }
      ]
    })

    if (!course) {
      return res.status(404).send({
        message: 'Course not found with id ' + req.params.id
      })
    }
    course.sections = course.sections.filter(m => m.deleted != true)
    course.class
   let {classes}= await Institute.findOne(
      {'classes._id': course.class },
      {"classes.$":1}
    ) 
    return res.status(200).send({course,class:classes[0]})
  } catch (error) {
    return res.status(500).send();
  }
}
getClassCourses = async (req, res) => {
  classId = req.params.iid
  try {
    var { classes } = await Institute.findOne(
      {
        classes: { $elemMatch: { _id: mongoose.Types.ObjectId(classId) } }
      },
      {
        'classes.$': 1
      }
    )
    if (classes.length) {
      let courses = await Course.find({ _id: { $in: classes[0].courses } })
      classes[0].courses = courses
      return res.status(200).send(classes[0])
    } else {
      return res.status(400).send('Courses Not Found')
    }
  } catch (error) {
    return res.status(500).send({
      message: 'Could not get course '
    })
  }
}
saveCourseSection = async (req, res) => {
  res
  var params = req.body
  if (params.courseId && !params._id) {
    var course = await Course.findById(req.body.courseId)

    if (course) {
      course.sections.push({
        name: params.name,
        timeInHours: params.timeInHours,
        timeInMinutes: params.timeInMinutes,
        order: params.order
      })
      await course.save()
      return res.status(200).send(course)
    }
  }
  if (params._id) {
    await Course.updateOne(
      {
        'sections._id': params._id
      },
      {
        $set: {
          'sections.$.name': params.name,
          'sections.$.timeInHours': params.timeInHours,
          'sections.$.timeInMinutes': params.timeInMinutes,
          'sections.$.order': params.order,
          'sections.$.modifiedDate': new Date()
        }
      }
    )
      .then(result => {
        return res.status(200).send(result)
      })
      .catch(err => {
        return res.status(500).send('document  not found')
      })
  } else return res.status(400).send('courseId field is required , bad request')
}
getSectionDetails = async (req, res) => {
  var id = req.params.id
  if (id) {
    let { sections } = await Course.findOne(
      {
        sections: { $elemMatch: { _id: id } }
      },
      {
        'sections.$': 1
      }
    )
    if (sections.length) {
      return res.status(200).send(sections[0])
    }
  }
  return res.status(400).send('section is not find')
}
deleteCourseSection = async (req, res) => {
  if (req.params.id) {
    Course.findOneAndUpdate(
      {
        'sections._id': req.params.id
      },
      {
        $pull: {
          sections: { _id: req.params.id }
        }
      }
    )
      .then(result => {
        return res.status(200).send(result)
      })
      .catch(err => {
        return res.status(500).send('document  not found')
      })
  } else return res.status(400).send('id field is required , bad request')
}
// saveSectionContent = async (req, res) => {
//   var filepath = req.body.contentUrl
//   if (req.params.id) {
//     const course = await Course.findOne(
//       { 'sections._id': req.params.id },
//       { _id: 1 }
//     )
//     var courseid = course._id

//     if (req.files) {
//       var file = req.files.file
//       var filename =
//         file.name.substr(0, file.name.lastIndexOf('.')).substr(0, 20) +
//         path.extname(file.name)
//       file.mv('./public/uploads/CourseContent/' + courseid + '/' + filename)
//       filepath = courseid + '/' + filename
//     }

//     if (req.body._id) {
//       Course.updateOne(
//         { 'sections._id': req.params.id },
//         {
//           $set: {
//             'sections.$[outer].contents.$[inner]': {
//               title: req.body.title,
//               type: req.body.type,
//               contentUrl: filepath,
//               description: req.body.description
//             }
//           }
//         },
//         {
//           arrayFilters: [
//             { 'outer._id': req.params.id },
//             { 'inner._id': req.body._id }
//           ]
//         },
//         (err, result) => {
//           if (!err) {
//             if (result.nModified === 0) {
//               res.status(400).send(result)
//               console.log(result)
//               return
//             } else {
//               res.status(200).send('ok')
//             }
//           } else {
//             res.status(400).send(err)
//             console.log(err)
//             return
//           }
//         }
//       )
//     } else {
//       Course.updateOne(
//         { 'sections._id': req.params.id },
//         {
//           $push: {
//             'sections.$[outer].contents': {
//               title: req.body.title,
//               type: req.body.type,
//               contentUrl: filepath,
//               description: req.body.description
//             }
//           }
//         },
//         {
//           arrayFilters: [{ 'outer._id': req.params.id }]
//         },
//         (err, result) => {
//           if (!err) {
//             return res.status(200).send(result)
//           } else {
//             return res.status(500).send(err)
//             console.log(err)
//           }
//         }
//       )
//     }
//   } else {
//     return res.status(400).send('Section Id field is required , bad request')
//   }
// }

saveSectionContent = async (req , res) => {
try {
  if (req.params.id) {
    const course = await Course.findOne(
      { 'sections._id': req.params.id },
      { _id: 1 }
    )
    var courseid = course._id
    if(courseid){
      // if(!req.body.audioFile || (req.body.audioFile && !req.body.audioFile.length)){
      //  const audio  =  await extractAudio({
      //     input: req.body.videoUrl,
      //     output: 'test.mp3'
      //   })
      //   audio.then((res)=>{
      //     console.log("audio file" ,  res)
      //   }).catch((error) => {
      //     console.log(error)
      //   })
        
      // }
      if (req.body._id) {
        Course.updateOne(
          { 'sections._id': req.params.id },
          {
            $set: {
              'sections.$[outer].contents.$[inner]': {
                
                title: req.body.title,
                videoUrl : req.body.videoUrl,
                videoDescription : req.body.videoDescription,
                imageUrl : req.body.imageUrl , 
                imageDescription : req.body.imageDescription,
                pdfUrl : req.body.pdfUrl,
                pdfDescription : req.body.pdfDescription,
                textDescription : req.body.textDescription,
                audioUrl : req.body.audioUrl,
                audioDescription : req.body.audioDescription
              }
            }
          },
          {
            arrayFilters: [
              { 'outer._id': req.params.id },
              { 'inner._id': req.body._id }
            ]
          },
          (err, result) => {
            if (!err) {
              if (result.nModified === 0) {
                res.status(400).send(result)
            
                return
              } else {
                res.status(200).send('ok')
              }
            } else {
              res.status(400).send(err)             
              return
            }
          }
        )
      } else {
        Course.updateOne(
          { 'sections._id': req.params.id },
          {
            $push: {
              'sections.$[outer].contents': {
                title: req.body.title,
                videoUrl : req.body.videoUrl,
                videoDescription : req.body.videoDescription,
                imageUrl : req.body.imageUrl , 
                imageDescription : req.body.imageDescription,
                pdfUrl : req.body.pdfUrl,
                pdfDescription : req.body.pdfDescription,
                textDescription : req.body.textDescription,
                audioUrl : req.body.audioUrl,
                audioDescription : req.body.audioDescription
              }
            }
          },
          {
            arrayFilters: [{ 'outer._id': req.params.id }]
          },
          (err, result) => {
            if (!err) {
              return res.status(200).send(result)
            } else {
              return res.status(500).send(err)
              console.log(err)
            }
          }
        )
      }

    }else{
      return res.status(400).send("Course not found with course id")
    }
     
  }
} catch (error) {
  console.log(error)
}
 
}

getSectionContent = async (req, res) => {
  var id = req.params.id
  var result = await Course.aggregate([
    // { $match:{"sections.contents._id":id}},
    { $unwind: '$sections' },
    { $unwind: '$sections.contents' },
    { $match: { 'sections.contents._id': mongoose.Types.ObjectId(id) } },
    { $project: { 'sections.contents': 1 } }
  ])
  if (result) {
    return res.status(200).send(result[0].sections.contents)
  }
}
deleteCourseSectionContent = async (req, res) => {
  var id = req.params.id

  await Course.findOneAndUpdate(
    { 'sections.contents._id': id },
    {
      $pull: { 'sections.$.contents': { _id: id } }
    },
    {}
  )
    .then(result => {
      return res.status(200).send(result)
    })
    .catch(err => {
      console.log(err)
      return res.status(500).send('document  not found ')
    })
}

getFilePath = async (req, res) => {
  if (req.params.id) {
    const course = await Course.findOne(
      { 'sections._id': req.params.id },
      { _id: 1 }
    )
    var courseid = course._id
    console.log(req.files)
    if (req.files && req.files.file) {
      var file = req.files.file
      var filename =
      uuidv4() +  file.name.substr(0, file.name.lastIndexOf('.')).substr(0, 20) + 
        path.extname(file.name)
      file.mv('./public/uploads/CourseContent/' + courseid + '/' + filename)
     var filepath = courseid + '/' + filename
    }else{
      res.status(400).send("Please send a file")
    }
    res.status(200).send(filepath)

  } else {
    return res.status(400).send('Section Id field is required , bad request')
  }
}
////////////////////////////////////////////////////
/////////// Student Apis
////////////////////////////////////////////////////
/////
//Api to Get student Class Course
////
GetClassCourses = async (req, res) => {
  try {
    var currentBatch = req.user.currentBatch
    var { batches } = await Branch.findOne(
      { 'batches._id': mongoose.Types.ObjectId(currentBatch) },
      { 'batches.$': 1 }
    )
    const Classid = batches[0].class

    var { classes } = await Institute.findOne(
      {
        classes: { $elemMatch: { _id: mongoose.Types.ObjectId(Classid) } }
      },
      {
        'classes.$': 1
      }
    )
    if (classes.length) {
      let courses = await Course.find(
        { _id: { $in: classes[0].courses } },
        { sections: 0 }
      )
      return res.status(200).send(courses)
    } else {
      return res.status(400).send('Courses Not Found')
    }
  } catch (error) {
    return res.status(500).send({
      message: 'Could not get course '
    })
  }
}

getCourseById = async (req , res) => {
  try {
      const {courseId} = req.params
     
    const course  = await Course.findOne({_id : courseId} , {
      title : 1 , Description : 1 ,posterImageUrl :1 , overview :1 ,timeInHours :1 , timeInMinutes : 1
      ,"sections._id" : 1 , rating : 1 , numberOfStudent : 1 , numberOfRatings : 1 , class : 1 , test : 1
    } )
    const sectionLength =  course.sections.length
    const testLength = course.test.length
    const data  = {course ,sectionLength , testLength }
    
    res.status(200).send(data)
  } catch (error) {
    res.status(500).send(false)
  }
}
getSectionsByCourseId = async (req , res) => {
  try {
    const { courseId } = req.params

    const course  = await Course.findOne({_id : courseId} , {
      
      "sections.name" : 1 , "sections.timeInHours": 1,
      "sections.timeInMinutes" : 1, "sections.test" : 1 ,"sections.contents" : 1
    } )
    res.status(200).send(course)
  } catch (error) {
    res.status(500).send(false)
  }
}

module.exports = {
  getCourseContentTypes,

  saveCourse,
  deleteCourse,
  getClassCourses,
  getCourse,
  saveCourseSection,
  getSectionDetails,
  deleteCourseSection,
  saveSectionContent,
  getSectionContent,
  deleteCourseSectionContent,
  uploadCourseProfile,
  getFilePath,

  //////////////Student Apis Fns
  GetClassCourses,
  getCourseById,
  getSectionsByCourseId
}
