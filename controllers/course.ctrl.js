const mongoose = require('mongoose')
const Course = require('../models/course-model')
const Institute = require('../models/institute-model')
const CourseCategory = require('../models/course-category-model')
const User = require('../models/user-model')
var path = require('path')
const { v4: uuidv4 } = require('uuid')
const { COURSE_CONTENT_TYPES } = require('./../models/constants')
const { response } = require('express')
const { getClasses } = require('./branch.ctrl')
const Branch = require('../models/branch-model')
const Test  = require('../models/test-model')
var ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
require('dotenv').config()


const  { saveCalculateResult } = require('../services/test.service')
const TestResult = require('../models/testResult-model')
const Student  = require('../models/student-model')
const { getVideoDurationInSeconds } = require('get-video-duration')
const VideoLength = require('video-length');
const {secondToMinute } = require('../utility/secondToMinute')
var path = require('path');
const { Console } = require('console')
var appDir = path.dirname(require.main.filename);

const convertVideo = (path  , newName ) => {
  try {
      
      const convertedFilePath =newName;
      return new Promise((resolve, reject) => {
          ffmpeg(path)
              .setFfmpegPath('utility/ffmpeg/bin/ffmpeg.exe')
              .setFfprobePath('utility/ffmpeg/bin/ffprobe.exe')
              .toFormat("mp3")
              .on("start", commandLine => {
                  console.log(`Spawned Ffmpeg with command: ${commandLine}`);
              })
              .on("error", (err, stdout, stderr) => {
                  console.log(err, stdout, stderr);
                  reject(err);
              })
              .on("end", (stdout, stderr) => {
                  console.log(stdout, stderr);
                  resolve({
                      convertedFilePath
                  });
              })
              .saveToFile(`${convertedFilePath}`);
      });

  } catch (error) {
      console.log("error : "  , error)
      return res.status(500).send(error)
  }
};




getCourseContentTypes = async (req, res) => {
  try {
    let values = Object.keys(COURSE_CONTENT_TYPES)
    var ddr = values.map(item => {
      return { text: COURSE_CONTENT_TYPES[item], value: item }
    })
    return res.status(200).send(ddr)
  } catch (error) {
    return res.status(500).send(error)
  }
}
saveCourse = async (req, res) => {
  try {
    if(req.params.id == undefined){
      return res.status(400).send({message : "send the classId" })
    }
    var course = new Course(req.body)
    if(!req.body.title){
      return res.status(400).send('Please send the title')
    }
    
    course.class = req.params.id
    course.createdBy = req.user._id
    if (req.body._id) {
      course = await Course.findByIdAndUpdate(
        { _id: req.body._id },
        {
          title: course.title,
          Description: course.Description,
          categories: course.categories,
          posterImageUrl: course.posterImageUrl,
          overview: course.overview,
          courseLanguage :course.courseLanguage
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
     return res.send({
        status: true,
        message: 'File is uploaded',
        name: filename,
        mimetype: file.mimetype
      })
    }
  } catch (error) {res.status(500).send()}
}
deleteCourse = async (req, res) => {
  if(!req.params.id){return res.status(400).send({message : "Please send the id"})}
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
// getCourse = async (req, res) => {
//   try {
//     console.log("in here")
//     if(!req.params.id){return res.status(400).send({message : "Please send the id"})}
//     // var course = await Course.aggregate([
//     //   {$match : {_id : mongoose.Types.ObjectId(req.params.id)}},
//     //   {$project : {title : 1 , sections : 1}}
//     // ])
//     var course = await Institute.aggregate([
//       {$match : {branches : mongoose.Types.ObjectId(req.user.branch)}},
//       {$project : {classes : 1}},
//       {$unwind : "$classes"},
//       {$replaceRoot : {newRoot : "$classes"}},
//       {$match : {courses : mongoose.Types.ObjectId(req.params.id)}},
//       {$project : {name : 1 , courses :1}},
//       {$lookup : {
//         from: 'courses',
//         localField: 'courses',
//         foreignField: '_id',
//         as: 'courses'
//       }},
//       {$unwind : "$courses"},
//       {$match : {"courses._id" : mongoose.Types.ObjectId(req.params.id)}},
//       {$replaceRoot : {newRoot : "$courses"}},
//     //   {$project : {
//     //     _id : 1 ,title : 1 ,sections : 1
//     // }},
//     {$unwind : "$sections"},
//     {$match : {"sections.deleted" : false}},
//     {$project : {
//       _id : 1 ,title : 1 ,"sections.name" : 1 , "sections.contents" : 1
//     }},
//     {$unwind : "$sections.contents"},
//     {$match : {"sections.contents.deleted" : false}}
     
//     ])


        
                      
 
//     // .findOne({
//     //   _id: req.params.id,
//     //   $or: [
//     //     { sections: { $elemMatch: { deleted: !true } } },
//     //     { sections: { $size: 0 } }
//     //   ]
//     // })

//   //   if (!course) {
//   //     return res.status(404).send({
//   //       message: 'Course not found with id ' + req.params.id
//   //     })
//   //   }
//   //   course.sections = course.sections.filter(m => m.deleted != true)
//   //   course.class
//   //  let {classes}= await Institute.findOne(
//   //     {'classes._id': course.class },
//   //     {"classes.$":1}
//   //   ) 
//     // return res.status(200).send({course,class:classes[0]})
//     return res.status(200).send(course)
//   } catch (error) {
//     return res.status(500).send();
//   }
// }
getCourse = async (req, res) => {
  try {
    console.log("in here")
    if(!req.params.id){return res.status(400).send({message : "Please send the id"})}
    var courses = await Course.aggregate([
      {$match : {_id : mongoose.Types.ObjectId(req.params.id)} }
      ,{$project : {class : 1 , title : 1 , "sections._id" :1 , "sections.name" :1 , "sections.contents.deleted":1,
       "sections.contents._id":1,"sections.contents.title":1,"sections.contents.videoUrl":1,
       "sections.contents.videoLength":1,"sections.contents.videoDescription":1,"sections.contents.imageUrl":1,
       "sections.contents.imageDescription":1,"sections.contents.pdfUrl":1,"sections.contents.pdfDescription":1,
       "sections.contents.textDescription":1,"sections.contents.audioUrl":1,
       "sections.contents.audioDescription":1,
     
    }}
    ])
    course= courses[0]
    // .findOne({
    //   _id: req.params.id,
    //   $or: [
    //     { sections: { $elemMatch: { deleted: !true } } },
    //     { sections: { $size: 0 } }
    //   ]
    // })

    if (!course) {
      return res.status(404).send({
        message: 'Course not found with id ' + req.params.id
      })
    }
    course.sections = course.sections.filter(m => m.deleted != true)
    // course.class
  //  let {classes}= await Institute.findOne(
  //     {'classes._id': course.class },
  //     {"classes.$.name":1}
  //   ) 
  var classes = await Institute.aggregate([
    {$match : {'classes._id' : mongoose.Types.ObjectId(course.class)}},
    {$project : {classes : 1}},
    {$unwind : "$classes"},
    {$replaceRoot : {newRoot : "$classes"}},
    {$match : {_id : mongoose.Types.ObjectId(course.class)}},
    {$project : {name : 1}}
  ])
  // return res.status(200).send(course)
    return res.status(200).send({course , class:classes[0]})
  } catch (error) {
    return res.status(500).send();
  }
}

//deprecated `1`
// getClassCourses = async (req, res) => {
  
//   try {
//     classId = req.params.iid
//     if(!classId){return res.status(400).send({message : "Please send the classId"})}
//     var { classes } = await Institute.findOne(
//       {
//         classes: { $elemMatch: { _id: mongoose.Types.ObjectId(classId) } }
//       },
//       {
//         'classes.$': 1
//       }
//     )
//     if (classes.length) {
//       let courses = await Course.find({ _id: { $in: classes[0].courses } })
//       classes[0].courses = courses
//       return res.status(200).send(classes[0])
//     } else {
//       return res.status(400).send('Courses Not Found')
//     }
//   } catch (error) {
//     return res.status(500).send({
//       message: 'Could not get course '
//     })
//   }
// }

//new `1`

getClassCourses = async (req, res) => {  
  try {
    classId = req.params.iid
    if(!classId){return res.status(400).send({message : "Please send the classId"})}
    var  classes  = await Institute.aggregate([
       {$match : {"classes._id" : mongoose.Types.ObjectId(classId)}},
       {$project : {classes : 1 ,_id : 0}},
       {$unwind : "$classes"},
       {$match : {"classes._id" : mongoose.Types.ObjectId(classId)}},
       {$replaceRoot : {newRoot : "$classes"}},
       {$project : {courses : 1 ,name : 1}},
       {$lookup : {
        from: 'courses',
        localField: 'courses',
        foreignField: '_id',
        as: 'courses'
      }},
      {$unwind : "$courses"},
      {$match : {"courses.deleted" : false}},
      {$project : {"courses.title": 1,"courses._id" : 1 ,
      "courses.Description": 1,
      "courses.overview": 1,
      "courses.posterImageUrl":1 , _id : 1 , name : 1}}
    ])
    
    
    // .findOne(
    //   {
    //     classes: { $elemMatch: { _id: mongoose.Types.ObjectId(classId) } }
    //   },
    //   {
    //     'classes.$': 1
    //   }
    // )
    return res.status(200).send(classes)
    // if (classes.length) {
    //   let courses = await Course.find({ _id: { $in: classes[0].courses } })
    //   classes[0].courses = courses
    //   return res.status(200).send(classes[0])
    // } else {
    //   return res.status(400).send('Courses Not Found')
    // }
  } catch (error) {
    return res.status(500).send({
      message: 'Could not get course '
    })
  }
}
saveCourseSection = async (req, res) => {
 
  if (req.body.courseId && !req.body._id) {
    var course = await Course.findById(req.body.courseId)

    if (course) {
      course.sections.push({
        name: req.body.name,
        timeInHours: req.body.timeInHours,
        timeInMinutes: req.body.timeInMinutes,
        order: req.body.order
      })
      await course.save()
      return res.status(200).send(course)
    }
  }
  if (req.body._id) {
    await Course.updateOne(
      {
        'sections._id': req.body._id
      },
      {
        $set: {
          'sections.$.name': req.body.name,
          'sections.$.timeInHours': req.body.timeInHours,
          'sections.$.timeInMinutes': req.body.timeInMinutes,
          'sections.$.order': req.body.order,
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
  console.log('in here are')
  if (id) {
    let  sections  = await Course.aggregate([
      {$match : {"sections._id" : mongoose.Types.ObjectId(id)}},
      {$project : {sections : 1 , _id : 0}},
      {$unwind : "$sections"},
      {$match : {"sections._id" : mongoose.Types.ObjectId(id)}},
      {$replaceRoot : {newRoot : "$sections"}},
      {$project : {_id: 1, name: 1,timeInHours: 1,timeInMinutes: 1, order: 1,}}
    ])
    
    // .findOne(
    //   {
    //     sections: { $elemMatch: { _id: id } }
    //   },
    //   {
    //     'sections.$': 1
    //   }
    // )
    // if (sections.length) {
    //   return res.status(200).send(sections[0])
    // }
    return res.status(200).send(sections)
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
      var audioUrlNew;
      if(req.body.videoUrl.length > 0){
        // var link = `${appDir}\\public\\uploads\\CourseContent\\5f90078a13df2e0b38e24faf\\7b10e01a-8763-48b2-9f34-2b2486ce72994. Real-World SPAs &.mp4`
        var link  = `${appDir}/public/uploads/CourseContent/${req.body.videoUrl}`
        const fileName = link.replace(/\.[^/.]+$/, "");
        var audioUrl1 = req.body.videoUrl.replace(/\.[^/.]+$/, "");
        var date = new Date()
        var fileNewName =  `${fileName}_${+date}.${"mp3"}`
        audioUrlNew = `${audioUrl1}_${+date}.${"mp3"}`
        convertVideo(link ,fileNewName ).then((Res) => {
        }).catch((Error) => {
          console.log(Error)
        })
      }
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
                videoLength : req.body.videoLength,
                videoDescription : req.body.videoDescription,
                imageUrl : req.body.imageUrl , 
                imageDescription : req.body.imageDescription,
                pdfUrl : req.body.pdfUrl,
                pdfDescription : req.body.pdfDescription,
                textDescription : req.body.textDescription,
                audioUrl : req.body.isChecked == true ? audioUrlNew :  req.body.audioUrl ,
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
                return res.status(400).send(result)
            
                
              } else {
                return res.status(200).send('ok')
              }
            } else {
              return  res.status(400).send(err)             
              
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
                videoLength : req.body.videoLength,
                videoDescription : req.body.videoDescription,
                imageUrl : req.body.imageUrl , 
                imageDescription : req.body.imageDescription,
                pdfUrl : req.body.pdfUrl,
                pdfDescription : req.body.pdfDescription,
                textDescription : req.body.textDescription,
                audioUrl : req.body.isChecked == true ? audioUrlNew :  req.body.audioUrl,
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
  return res.status(500).send(error)
  console.log(error)
}
 
}

getSectionContent = async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).send(error)
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
  try {
   
    if (req.params.id) {
      const course = await Course.findOne(
        { 'sections._id': req.params.id },
        { _id: 1 }
      )
      var courseid = course._id
      if (req.files && req.files.file) {
        var file = req.files.file
        var filename =
        uuidv4() +  file.name.substr(0, file.name.lastIndexOf('.')).substr(0, 20) + 
          path.extname(file.name)
        file.mv('./public/uploads/CourseContent/' + courseid + '/' + filename)
       var filepath = courseid + '/' + filename

       if(file.mimetype.includes("video")  ){
        getVideoDurationInSeconds(`public/uploads/CourseContent/${filepath}`).then((seconds) => {

          var duration = secondToMinute(seconds) 
          return res.status(200).send({filepath ,duration })
         
        })
      }
      else{
        return res.status(200).send({filepath})

      }
      }else{
       return res.status(400).send("Please send a file")
      }
      
      
      
  
    } else {
      return res.status(400).send('Section Id field is required , bad request')
    }
    
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
  
}
convertAudioFromVideo = async(req , res) => {
try {

  if (req.files && req.files.file) {
    var file = req.files.file
    const inputVideo = file
    
      ffmpeg(inputVideo)
          .output('./output.mp3')
          .on('end', function() {
          return res.status(200).send("Complete ")
          }).on('error', function(err){
              console.log('error: ',err );
              return res.status(200).send(err)
          }).run();
  }
  
} catch (error) {
  return res.status(500).send(error)
}
  
}

getAllCoursesOfAllClasses = async (req , res) => {
  try {
        const currentBranchId = req.user.branch
        const data = await Institute.aggregate([
          {$match : {'branches' : mongoose.Types.ObjectId(currentBranchId)}},
          
          {$project : {classes : 1 ,name : 1 , branches : 1}},
          {$lookup : 
            {
                      from: 'branches',
                      localField: 'branches',
                      foreignField: '_id',
                      as: 'branches'
             }
          },
          {$unwind : "$classes"},
          {$lookup : 
            {
                      from: 'courses',
                      localField: 'classes.courses',
                      foreignField: '_id',
                      as: 'courses'
             }
          },
             {$unwind : "$courses"},
             
            {$project : {'classes._id' : 1 , 'classes.name' : 1 ,'courses._id' : 1 , 'courses.title' : 1 ,
            'courses.Description' :1 ,'courses.posterImageUrl' :1 ,'courses.overview' :1 ,'courses.timeInHours' :1 ,
            'courses.timeInMinutes' :1 , 'courses.rating' :1 , 'courses.numberOfRatings' :1 , 'courses.numberOfStudent' :1 ,
            'courses.createdBy' :1 ,
            // 'courses.sections._id' : 1,
            'courses.deleted' : 1,
             count: { $size:"$courses.sections" } , name : 1 , 
            //  branches: {
            //   $filter: {
            //      input: "$branches",
            //      as: "branches",
            //      cond: { $eq: [ "$$branches._id", currentBranchId ] }
            //   }
            // }
           }},
          //  {$unwind : "$branches"},
          {$match : {"courses.deleted": {$ne: true}}}

        ])
            return res.status(200).send(data)
  } catch (error) {
    return res.status(500).send(error)
  }
}
getAllTestListToAdmin = async (req ,res) => {
  try {
    
    const currentBranchId = req.user.branch
    const data = await Institute.aggregate([
      {$match : {'branches' : mongoose.Types.ObjectId(currentBranchId)}},
      {$project : {classes : 1}},
      {$unwind : "$classes"},
      {$lookup : 
        {
                  from: 'courses',
                  localField: 'classes.courses',
                  foreignField: '_id',
                  as: 'courses'
         }
      },
         {$unwind : "$courses"},
         {$lookup : 
          {
                    from: 'tests',
                    localField: 'courses.test',
                    foreignField: '_id',
                    as: 'test'
           }},
          {$unwind : "$test"},
         {$project : {"classes.name" : 1 , 'classes._id' : 1 , 'courses._id' : 1  , 'courses.title' : 1 , 'test._id' : 1 ,'test.name' : 1 , 
           'test.description' : 1,
           'test.class': 1,
           'test.totalMarks' :1,
           'test.passingMarks' :1,
           'test.timeInHours' :1,
           'test.timeInMinutes' :1 ,
           'test.testLevel' : 1,
           "test.isComplete" : 1
          }}          
                
    ])
    return res.status(200).send(data)
  } catch (error) {
    return res.status(500).send(error)
  }
}

getAllClassNameForCourseAdd = async (req , res) => {
  try {
    const currentBranchId = req.user.branch
    const data = await Institute.aggregate([
      {$match : {'branches' : mongoose.Types.ObjectId(currentBranchId)}},
      {$project : {"classes._id" : 1 , "classes.name" : 1}},
    ])
    return res.status(200).send(data)
  } catch (error) {
    return res.status(500).send()
  }
}
getAllClassCoursesNameForTestadd = async (req , res) => {

  try {
    const currentBranchId = req.user.branch
        const data = await Institute.aggregate([
          {$match : {'branches' : mongoose.Types.ObjectId(currentBranchId)}},
          
          {$project : {"classes.courses" : 1 }},
          {$unwind : "$classes"},
          {$unwind : "$classes.courses"},
          // {$lookup : 
          //   {
          //             from: 'branches',
          //             localField: 'branches',
          //             foreignField: '_id',
          //             as: 'branches'
          //    }
          // },
          // {$unwind : "$classes"},
          {$lookup : 
            {
                      from: 'courses',
                      localField: 'classes.courses',
                      foreignField: '_id',
                      as: 'classes.courses'
             }},
             {$match : {"classes.courses.deleted": {$ne: true}}},
          // },
          // {$unwind : "$courses"},
          {$project : {'classes.courses._id' : 1 , 'classes.courses.title' : 1  }},
          {$replaceRoot : {newRoot : "$classes"}},
          {$unwind : "$courses"},
        ])
        return res.status(200).send(data)
  } catch (error) {
    return res.status(500).send()
  }
}

saveAnnouncement = async(req , res) => {
  try {
    const {courseId} = req.params
    if(!courseId) { return res.status(400).send("Please send the courseId")}
    const courseDetails = await Course.updateOne(
      { _id: courseId },
      { $push: {announcement : {title : req.body.title , Description : req.body.Description , createdAt : Date.now()} }}
    )
    return res.status(200).send(courseDetails)
  } catch (error) {
    return res.status(500).send(error)
  }
}
getAnnouncement = async(req , res) => {
  try {
    const {courseId} = req.params
    if(!courseId) { return res.status(400).send("Please send the courseId")}
    const data = await Course.aggregate([
      {$match : {_id : mongoose.Types.ObjectId(courseId)}},
      {$project : {announcement : 1}},
      {$unwind : "$announcement"},
      {$sort : {"announcement.createDate" :  -1}}
    ])
    return res.status(200).send(data)
  } catch (error) {
    return res.status(500).send()
  }
}
saveFaq = async (req , res) => {
  try {
    const {courseId} = req.params
    if(!courseId) { return res.status(400).send("Please send the courseId")}
    if(!req.body.question || !req.body.answer) {return res.status(400).send("Please send the question and answer both")}
    const courseDetails = await Course.updateOne(
      { _id: courseId },
      { $push: {faq : { question : req.body.question , answer :req.body.answer ,createdBy : req.user._id ,  answerBy :   req.user._id , createdAt :  Date.now() }}}
    )
    return res.status(200).send(courseDetails)
  } catch (error) {
    return res.status(500).send({error : error})
  }
}
getFaq = async (req, res) => {
  try {
    const {courseId} = req.params
    if(!courseId) { return res.status(400).send("Please send the courseId")}
    const data = await Course.aggregate([
      {$match : {_id : mongoose.Types.ObjectId(courseId)}},
      
      {$unwind : "$faq"},
      {$lookup :{
        from: 'users',
        localField: 'faq.createdBy',
        foreignField: '_id',
        as: 'faq.createdBy'
      }},
      {$project : {"faq.question" : 1 ,"faq.answer" : 1 ,"faq.createdAt" : 1, 'faq.createdBy.name' :1,'faq.createdBy._id' :1}},
      {$sort : {"faq.createdAt" :  -1}}
    ])
    return res.status(200).send(data)
    
  } catch (error) {
    return res.status(500).send({error : error})
  }
}
getCourseContentByCourseId = async(req , res) => {
  try {
    const {courseId} =  req.params
    if(!courseId){return res.status(400).send("Please send the courseId")}
    const course  = await Course.aggregate([
      {$match:{_id:mongoose.Types.ObjectId(courseId)}},
      {$project:{"sections._id" : 1 , "sections.name" : 1 , 
      "sections.timeInHours": 1,"sections.timeInMinutes" : 1, "sections.test" : 1 ,
      "sections.contents" : 1}},
      
    ])
    const courseDetails = await Course.aggregate([
      {$match : {_id : mongoose.Types.ObjectId(courseId)}},
      {$unwind : "$sections"},
      {$match : {"sections.deleted" :  !true }},
      {$lookup : 
        {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy'

      }},
      {$project :{class : 1, numberOfRatings : 1 , numberOfStudent : 1 , title : 1,Description: 1 , overview : 1 
        , posterImageUrl : 1 , modifiedDate : 1 , "createdBy.name" : 1 ,"createdBy._id" : 1 ,
        "sections.contents" : 
         {
          $filter: {
             input: "$sections.contents",
             as: "contents",
             cond: { $eq: [ "$$contents.deleted", !true ] }
          }
       }, "sections._id" : 1,"sections.name" : 1 , "sections.timeInHours" : 1 ,"sections.timeInMinutes" : 1
        ,  noOfSectionstests : { $size:"$sections.test" }
        ,noOftests : { $size:"$test" } , announcement : 1
      }}

    ])
    return res.status(200).send(course[0])
    
  } catch (error) {
    return res.status(500).send(error)
  }
}
getCourseDiscussion = async (req , res) => {
  try {
  
    const { courseId  ,contentId  , sectionId  } = req.params
    const course = await Course.aggregate([
          {$match : {_id : mongoose.Types.ObjectId(courseId)}},
          {$unwind : "$sections"},
          {$unwind : "$sections.contents"},

          {$match : {'sections.contents._id' : mongoose.Types.ObjectId(contentId)}},
          {$project : {'sections.contents.discussion' : 1 , 'sections._id' : 1 , 'sections.contents._id' : 1}},
          // {$replaceRoot : {newRoot : "$sections.contents"}},
          {$unwind : "$sections.contents.discussion"},
          {$sort : {"sections.contents.discussion.question.createdDate" : -1}}

        ])
        return res.status(200).send(course)
    
  } catch (error) {
    return res.status(500).send(error)
  }
}

////////////////////////////////////////////////////
/////////// Student Apis
////////////////////////////////////////////////////
/////
//Api to Get student Class Course
////
GetClassCoursesForStudent = async (req, res) => {
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
      // let courses = await Course.find(
      //   { _id: { $in: classes[0].courses } },
      //   { sections: 0 }
      // )
      var courses = await Course.aggregate([
        {$match : {_id : {$in : classes[0].courses}} },
        {$project : {sections : 0, reviews : 0}},
        {$match : {deleted : false}},
        // {$unwind : "$ratings"},
        {$project : {Description: 1,timeInHours: 1,
          timeInMinutes: 1,
             class: 1,createdBy:1,deleted: 1, overview: 1, 
         posterImageUrl: 1,title: 1  , averageRating : { $avg : "$ratings.rating" } 
        }}
      ])
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
    
    return res.status(200).send(data)
  } catch (error) {
    return res.status(500).send(false)
  }
}
getSectionsByCourseId = async (req , res) => {
  try {
    const { courseId } = req.params

    const course  = await Course.findOne({_id : courseId} , {
      
      "sections._id" : 1 , "sections.name" : 1 , "sections.timeInHours": 1,
      "sections.timeInMinutes" : 1, "sections.test" : 1 ,"sections.contents" : 1
    },
    {

    } )
    return res.status(200).send(course)
  } catch (error) {
    return res.status(500).send(false)
  }
}

getSectionsProgressByCourseId = async (req , res) => {
  try {
    const userId= req.user._id;
    const { courseId } = req.params
    const progress =await Student.aggregate(
      [
        {$match:{_id:mongoose.Types.ObjectId(userId)}},   
      {$project:{'courseProgress' : 1}},
      {$unwind:'$courseProgress'},     
      {$match:{'courseProgress.courseId':mongoose.Types.ObjectId(courseId)}},
     {$replaceRoot:{newRoot:'$courseProgress'}},
      {$unwind:'$Progress'}  ,
      {$replaceRoot:{newRoot:'$Progress'}},

    ])

    const course  = await Course.aggregate([
      {$match:{_id:mongoose.Types.ObjectId(courseId)}},
      {$project:{"sections._id" : 1 , "sections.name" : 1 , 
      "sections.timeInHours": 1,"sections.timeInMinutes" : 1, "sections.test" : 1 ,
      "sections.contents" : 1}},
      
    ])

    if(course) {
      
      course[0].sections.map(section => {
        
          section.contents.map(content => {

           var result =   progress.find(m => {        
           return m.contentId.toString() == content._id.toString() 
          })
          if(result){
            content.seen = result.seen?result.seen:false;
            content.VideoLastPosition = result.VideoLastPosition ? result.VideoLastPosition : 0
          }
          })

      })
      if(course.length){
        return res.status(200).send(course[0])
      }
    }
    
    
   return res.status(404).send()
  } catch (error) {
    return res.status(500).send(error)
  }
}
// its for student its return test which complete 
getCourseTests = async (req, res) => {
  try {
    const { courseId } = req.params
    if(!courseId){
      return res.status(400).send('Please send the courseId')
    }
    const testArray = await Course.aggregate([
      {$match : {'_id' : mongoose.Types.ObjectId(courseId)}},
      {$lookup:
        {
          from: 'tests',
          localField: 'test',
          foreignField: '_id',
          as: 'tests'
        }
      },
      {$project : {   tests : 1   , title : 1}},
      {$project : {
        tests: {
           $filter: {
              input: "$tests",
              as: "tests",
              cond: { $eq: [ "$$tests.isComplete", true ] }
           }
        }
     }},
      {$project : {title : 1 , "tests._id" : 1 , "tests.isComplete" : 1, "tests.name": 1, "tests.description": 1, "tests.totalMarks": 1,"tests.timeInHours": 1,"tests.timeInMinutes": 1,"tests.passingMarks": 1}}
    ])
    if(!testArray){
      return res.status(400).send('Send the correct testId')
    }   
    return res.status(200).send(testArray)
  } catch (error) {
    return res.status(500).send();
  }
}
getCourseTestById = async (req , res) => {
  try {
    const { testId } = req.params
    if(!testId){
      return res.status(400).send("Please send the testId")
    }
    const test = await Test.aggregate([
      {$match : {_id : mongoose.Types.ObjectId(testId)}},
      {$project : {"questions" : 0 ,createdAt : 0 , updatedAt : 0 , __v : 0}}
    ])
    if(test){
      return res.status(200).send(test)
    }
    return res.status(400).send("No test found with this id ")
    
    
  } catch (error) {
    return res.status(500).send()
  }
}
getTestQuestionsById = async (req , res) => {
  try {
    const { testId } = req.params
    if(!testId){
      return res.status(400).send("Please send the testId")
    }
    const test = await Test.aggregate([
      {$match : {_id : mongoose.Types.ObjectId(testId)}},
      
      {$project : {questions : 1  , timeInHours  :1 ,
        timeInMinutes : 1}},
      {$project : {"questions.options.isRight" : 0}}
    ])
    if(test){
      return res.status(200).send(test)
    }
    return res.status(400).send("No test found with this id ")
    
    
  } catch (error) {
    return res.status(500).send()
  }
}
saveCourseTestResult = async (req, res) => {
  try {
    var result = await saveCalculateResult(req , "CourseTest")
    if (result) return res.status(200).send(result)
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}
getStudentLastTestsResults=async(req, res)=>{
  try {
    if(req.params.courseId){
    var result = await TestResult.find({ $and: [ {"studentId":req.user._id} , {category : "CourseTest"} , {courseId : req.params.courseId}]},{result:1,totalMarks:1,obtainedMarks:1 ,noOfRight :1,noOfWrong : 1,attempted :1,noOfTotalQuestion : 1 }).populate("testId" ,  "name").sort("-createdAt")
    return res.status(200).send(result)
    }
    var result = await TestResult.find({ $and: [ {"studentId":req.user._id} , {category : "CourseTest"}]},{result:1,totalMarks:1,obtainedMarks:1 ,noOfRight :1,noOfWrong : 1,attempted :1,noOfTotalQuestion : 1 }).populate("testId" ,  "name").sort("-createdAt")
 return res.status(200).send(result)
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}
getStudentSingleTestResult = async(req , res) => {
  try {
    
    const resultId = req.params.resultId
    var result = await TestResult.findOne({_id : resultId},{result:1,totalMarks:1,obtainedMarks:1 ,noOfRight :1,noOfWrong : 1,attempted :1,noOfTotalQuestion : 1 , }).populate("testId" ,  "name")
    return res.status(200).send(result)
  } catch (error) {
    return res.status(500).send(error)
  }
}

courseReviewData = async(req , res) => {
  try {
    var currentBatch = req.user.currentBatch
    
    var { batches } = await Branch.findOne(
      { 'batches._id': mongoose.Types.ObjectId(currentBatch) },
      { 'batches.$': 1 }
    )
    const Classid = batches[0].class
    const classData = await Institute.aggregate([
      {$project : {
        class: {
           $filter: {
              input: "$classes",
              as: "classes",
              cond: { $eq: [ "$$classes._id", Classid ] }
           }
        }
      }
      },
      {$unwind : '$class'},
      {$unwind : '$class.courses'},
      {$project : {'class.courses' : 1 }},
      {$lookup : 
      {
                  from: 'courses',
                  localField: 'class.courses',
                  foreignField: '_id',
                  as: 'class.courses'
      }},
      {$unwind :'$class.courses' },
     { $replaceRoot:{newRoot:"$class.courses"}},
     {$project : {'test' : 1}},
     
     {
          $lookup : 
            {
              from: 'tests',
              localField: 'test',
              foreignField: '_id',
              as: 'test'
            }
          
     },
     {$unwind : '$test'},
     {$match : {'test.isComplete' : true}},
     {$project : {
        'test.name' : 1 , 
        'test._id' : 1,
        'test.description' : 1,
        'test.class': 1,
        'test.totalMarks' :1,
        'test.passingMarks' :1,
        'test.timeInHours' :1,
        'test.timeInMinutes' :1 ,
        'test.testLevel' : 1
      }}

    
    //   {
    //     $lookup : 
    //       {
    //         from: 'courses',
    //         localField: 'class.courses',
    //         foreignField: '_id',
    //         as: 'courses'
    //       }
        
    //   },
    //   {$project : {'courses.test' : 1 , 'courses.title' : 1 , 'courses._id' : 1}},
      
    //   {
    //     $lookup : 
    //       {
    //         from: 'tests',
    //         localField: 'courses.test',
    //         foreignField: '_id',
    //         as: 'tests'
    //       }
        
    //   },
    //   {$project : {
    //     tests: {
    //        $filter: {
    //           input: "$tests",
    //           as: "tests",
    //           cond: { $eq: [ "$$tests.isComplete", true ] },

    //       }
    //     },
    //     courses : 1
    //   }
    // },
    // {$project : {
    //   courses : 1,
    //   'tests.name' : 1 , 
    //   'tests.description' : 1,
    //   'tests.class': 1,
    //   'tests.totalMarks' :1,
    //   'tests.passingMarks' :1,
    //   'tests.timeInHours' :1,
    //   'tests.timeInMinutes' :1
    // }}
    ])
    return res.status(200).send(classData)
  } catch (error) {
    return res.status(500).send(error)
  }
}

getRecentCourses = async(req , res) => {
  try {
    
    var student  = await Student.aggregate([
      {$match : {_id : req.user._id} } , 
      {$project : {recentHistory : 1 , _id :0}},
      {$unwind : "$recentHistory"},
      {$replaceRoot:{newRoot:"$recentHistory"}},
      {$sort : {"dateTime" : -1}},
      {$lookup :
        {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'courses'
 
      }},
      {$project : {'_id' : 1  , "courseId" : 1 ,"dateTime" : 1 , "courses._id" : 1 , "courses.title" : 1 ,"courses.Description" : 1 , "courses.posterImageUrl" : 1}}
      
      , {$unwind : "$courses"}

    ])
    
    
    // var student  = await Student.findOne({recentHistory : 1}).populate("recentHistory.courseId" , "title Description posterImageUrl" )
    //   // .sort({'recentHistory.dateTime' : -1})
    // var student1  = student.recentHistory.sort((a , b) => {b.dateTime  - a.dateTime})
    
      
    return res.status(200).send(student)
  } catch (error) {
    return res.status(500).send()
  }
}

courseDetailByCourseId = async(req , res) => {
  try {
    const { courseId } = req.params
    if(!courseId){return res.status(400).send({message : "Please send the courseId"})}
    const courseDetails = await Course.aggregate([
      {$match : {_id : mongoose.Types.ObjectId(courseId)}},
      {$unwind : "$sections"},
      {$match : {"sections.deleted" :  !true }},
      {$lookup : 
        {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy'

      }},
      {$project :{class : 1, numberOfRatings : 1 , numberOfStudent : 1 , title : 1,Description: 1 , overview : 1 
        , posterImageUrl : 1 , modifiedDate : 1 , "createdBy.name" : 1 ,"createdBy._id" : 1 ,
        "sections.contents" : 
         {
          $filter: {
             input: "$sections.contents",
             as: "contents",
             cond: { $eq: [ "$$contents.deleted", !true ] }
          }
       }, "sections._id" : 1,"sections.name" : 1 , "sections.timeInHours" : 1 ,"sections.timeInMinutes" : 1
        ,  noOfSectionstests : { $size:"$sections.test" }
        ,noOftests : { $size:"$test" } ,
      }}

    ])
    if(courseDetails.length == 0){
      const courseDetails = await Course.aggregate([
        {$match : {_id : mongoose.Types.ObjectId(courseId)}},
        {$project :{class : 1, numberOfRatings : 1 , numberOfStudent : 1 , title : 1,Description: 1 , overview : 1 
          , posterImageUrl : 1 , modifiedDate : 1 ,
          noOftests : { $size:"$test" } 
        }}
      ])
      return res.status(200).send(courseDetails)
    }
    return res.status(200).send(courseDetails)
  } catch (error) {
    return res.status(500).send()
  }
}
CourseDetailById = async (req , res) =>{
    try {
      const CourseId = req.params.id
      if(!CourseId) {return res.status(400).send("Please send the courseId")}
      var courseDetail = await Course.aggregate([
        {$match : {$and : [{ _id :  mongoose.Types.ObjectId(CourseId)},{deleted : false} ]}},
        {$lookup : 
          {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdBy'
           }
        },
        {$lookup : 
          {
            from: 'coursecategories',
            localField: 'categories',
            foreignField: '_id',
            as: 'categories'
           }
        },

         {$project : {title : 1, 'categories.name' : 1, Description : 1 , overview: 1 ,posterImageUrl : 1 , price : 1 ,'createdBy.name' : 1 , averageRating : { $avg : "$ratings.rating" },}}
      ])
      return res.status(200).send(courseDetail)
    } catch (error) {
      return res.status(500).send(error)
    }
}
saveReview = async (req , res) => {
  try {
    const {courseId} = req.params
    if(!courseId) { return res.status(400).send("Please send the courseId")}

    const courseDetails = await Course.updateOne(
      { _id: courseId },
      { $push: {reviews : {review : req.body.review , reviewBy : req.user._id , createdAt : Date.now()} }}
    )
    return res.status(200).send(courseDetails)
  } catch (error) {
    return res.status(500).send({error : error})
  }
}
getReviews = async (req , res) => {
  try {
    const {courseId} = req.params
    if(!courseId) { return res.status(400).send("Please send the courseId")}
    const courseReviews = await Course.aggregate([
      {$match : {_id : mongoose.Types.ObjectId(courseId)}},
      {$project : {reviews : 1  }},
      {$unwind : "$reviews"},
      {$lookup : 
        {
          from: 'students',
          localField: 'reviews.reviewBy',
          foreignField: '_id',
          as: 'reviews.reviewBy'

      }},
      {$project : {"reviews._id" : 1   , "reviews.review" : 1 , "reviews.createdAt" : 1 , "reviews.reviewBy.name" : 1}},
      {$sort : {"reviews.createdAt" :  -1}}
    ])
    return res.status(200).send(courseReviews)
  } catch (error) {
    return res.status(500).send(error)
  }
}
giveRating = async(req , res) => {
  try {
    const {courseId} = req.params
    if(!courseId) { return res.status(400).send("Please send the courseId")}
    const rating  = req.body.rating
    if(!rating ){ return res.status(400).send("Please send the rating")}
    if(rating < 1 || rating > 5){return res.status(400).send("Please send the correct rating between 1-5")}
    const courseDetails = await Course.updateOne(
      { _id: courseId },
      { $push: {ratings : {rating : req.body.rating , ratingBy : req.user._id , createdAt : Date.now()} }}
    )
    return res.status(200).send(courseDetails)
  } catch (error) {
    return res.status(500).send(error)
  }
}
getRatings = async (req , res) => {
  try {
    const {courseId} = req.params
    if(!courseId) { return res.status(400).send("Please send the courseId")}
    const courseRating = await Course.aggregate([
      {$match : {_id : mongoose.Types.ObjectId(courseId)}},
      {$project : {ratings : 1  }},
      {$unwind : "$ratings"},
      {$lookup : 
        {
          from: 'students',
          localField: 'ratings.ratingBy',
          foreignField: '_id',
          as: 'ratings.ratingBy'

      }},
      {$project : {"ratings._id" : 1   , "ratings.rating" : 1 , "ratings.createdAt" : 1 , "ratings.ratingBy.name" : 1}},
      {$sort : {"ratings.createdAt" :  -1}}
    ])
    return res.status(200).send(courseRating)
    
  } catch (error) {
    return res.status(500).send(error)
  }
}
getAverageRatings = async (req , res) => {
  try {

    const {courseId} = req.params
    if(!courseId) { return res.status(400).send("Please send the courseId")}
    const averageRating = await Course.aggregate([
      {$match : {_id : mongoose.Types.ObjectId(courseId)}},
      
      {$unwind : "$ratings"},
      {$project : {"ratings.rating" : 1  , "ratings._id" : 1 }},
      { $group : { _id : "$_id", averageRating : { $avg : "$ratings.rating" } } }
    ])
    return res.status(200).send(averageRating)
  } catch (error) {
    return res.status(500).send(error)
  }
}
noOfStudentInCourse = async( req , res) => {
  try {
    const {courseId} = req.params
    const classId = await Course.findOne({_id : courseId} , {class : 1})
    const data = await Branch.aggregate([
      
      {$unwind : "$batches"},
      {$match : {"batches.class" : mongoose.Types.ObjectId(classId.class)}},
      {$replaceRoot : {newRoot : "$batches"}},
      {$project : {_id : 1}},

    ])
    var dataArry =  data.map((ele) => ele._id )
    var student = await Student.find({currentBatch : {$in : dataArry }} , {currentBatch : 1})
    var noOfStudent   = student.length
    return res.status(200).send({noOfStudent})
  } catch (error) {
    return res.status(500).send()
  }
}
createDiscussioninCourse = async (req , res) => {
  try {
    const { courseId ,sectionId ,contentId  } = req.params
    
    const userId = req.user._id
    if(!courseId || !sectionId || !contentId) {return res.status(400).send("Please send the courseId , sectionId , contentsId")}
    const { questionText  , videoTime }  = req.body
 
   const duration  = secondToMinute(videoTime)

      var addQuestion = await Course.updateOne(
        { _id :courseId } , 
        { 
          $push: 
          {
              'sections.$[outer].contents.$[inner].discussion' : {
                question: {
                  questionText : questionText ,
                  videoTime : duration ,
                  exactTime :  videoTime , 
                  QuestionBy :   userId,
                  createdDate :  Date.now()
                }
              }
          } 
        },
          {
            arrayFilters: [
              { 'outer._id': sectionId },
              { 'inner._id': contentId }
            ]
          }
  
        )
        
        return res.status(200).send(addQuestion)

    
  } catch (error) {
    return res.status(500).send(error)
  }
}
addDiscussionAnswer = async (req , res) => {
  try {
    const { courseId ,sectionId ,contentId ,discussionId   } = req.params
 
    const userId = req.user._id
    if(!courseId || !sectionId || !contentId) {return res.status(400).send("Please send the courseId , sectionId , contentsId")}
    const { answerText  }  = req.body
    if(!answerText){return res.status(400).send("Please send the answer")}
    if(!discussionId){return res.status(400).send("Please send the discussionId")}
      var addAnswer = await Course.updateOne(
        { _id :courseId } , 
        { 
          $set: 
          {
              'sections.$[outer].contents.$[inner].discussion.$[discussionId].answer' : {
                  answerText : answerText ,
                  AnsweredBy :   userId,
                  createdDate :  Date.now()
              }
          }
          
        },
          {
            arrayFilters: [
              { 'outer._id': sectionId },
              { 'inner._id': contentId },
              {'discussionId._id' : discussionId}
            ]
          },
  
        )
        return res.status(200).send(addAnswer)

    
  } catch (error) {
    return res.status(500).send(error)
  }
}
getDiscussion = async (req , res) => {
  try {
    const { courseId  ,contentId    } = req.params
    const course = await Course.aggregate([
          {$match : {_id : mongoose.Types.ObjectId(courseId)}},
          {$unwind : "$sections"},
          {$unwind : "$sections.contents"},

          {$match : {'sections.contents._id' : mongoose.Types.ObjectId(contentId)}},
          {$project : {'sections.contents.discussion' : 1}},
          {$replaceRoot : {newRoot : "$sections.contents"}},
          {$unwind : "$discussion"},
          {$sort : {"discussion.question.createdDate" : -1}}

        ])
        return res.status(200).send(course)
    
  } catch (error) {
    return res.status(500).send(error)
  }
}
regexMatchName = async (req ,res) => {
  try {
    if(!req.body.search){return res.status(400).send("Please send the text")}

    function escapeRegex(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
    const regex = new RegExp(escapeRegex(req.body.search), "gi");
    const institute = await Institute.aggregate([
      {$match : {deleted : false}},
      {$match : {$or : [
        {name : {$regex : regex }},{"classes.name" : {$regex : regex }},{"classes.description" : {$regex : regex }},
      ]}},
      {$project : {name : 1 }},
        { $limit : req.body.limit  ? req.body.limit : 1},
        { $skip : req.body.skip ? req.body.skip : 0 }
    ])
    const course = await Course.aggregate([
      {$match : {deleted : false}},
      { $match: { $or : [
        {title : {$regex : regex }} ,{Description : { $regex: regex }},
        {posterImageUrl : { $regex: regex }},{overview : { $regex: regex }},
        {"sections.name" : { $regex: regex }},
        {"sections.contents.title" : { $regex: regex }},{"sections.contents.videoUrl" : { $regex: regex }},
        {"sections.contents.videoLength" : { $regex: regex }},{"sections.contents.videoDescription" : { $regex: regex }},
        {"sections.contents.imageUrl" : { $regex: regex }},{"sections.contents.imageDescription" : { $regex: regex }},
        {"sections.contents.pdfUrl" : { $regex: regex }},{"sections.contents.pdfDescription" : { $regex: regex }},
        {"sections.contents.textDescription" : { $regex: regex }},{"sections.contents.audioUrl" : { $regex: regex }},
        {"sections.contents.audioDescription" : { $regex: regex }}
      ]  
      }},
      {$project  : {title : 1 , Description : 1 ,posterImageUrl : 1 }},
      { $limit : req.body.limit  ? req.body.limit : 1},
      { $skip : req.body.skip ? req.body.skip : 0 }
    ])
    const teacher = await User.aggregate([
      { $match: { $or : [{name : {$regex : regex }} ]}},
      {$project : {name : 1 , profilePic : 1}},
      { $limit : req.body.limit  ? req.body.limit : 1},
      { $skip : req.body.skip ? req.body.skip : 0 }
    ])
    return res.status(200).send({institute , course ,teacher})
    
  } catch (error) {
    return res.status(500).send(error)
  }
}
getMoreInstitute = async (req , res) => {
  try {
    if(!req.body.search){return res.status(400).send("Please send the text")}

    function escapeRegex(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
    const regex = new RegExp(escapeRegex(req.body.search), "gi");
    const institute = await Institute.aggregate([
      {$match : {deleted : false}},
      {$match : {$or : [
        {name : {$regex : regex }},{"classes.name" : {$regex : regex }},{"classes.description" : {$regex : regex }},
      ]}},
      {$project : {name : 1 , noOfBranches : { $size:"$branches" }  ,
        noOfClasses : { $size:"$classes" }  ,noOfCourses :{ $size:"$classes.courses" }  }},
        { $limit : req.body.limit  ? req.body.limit : 5},
        { $skip : req.body.skip ? req.body.skip : 0 }
    ])
    return res.status(200).send(institute)
  } catch (error) {
    return res.status(500).send(error)
  }
}
getMoreCourses = async(req , res) => {
  try {
    if(req.body.search){
      function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      }
      const regex = new RegExp(escapeRegex(req.body.search), "gi");
      const course = await Course.aggregate([
        {$match : {deleted : false}},
        { $match: { $or : [
          {title : {$regex : regex }} ,{Description : { $regex: regex }},
          {posterImageUrl : { $regex: regex }},{overview : { $regex: regex }},
          {"sections.name" : { $regex: regex }},
          {"sections.contents.title" : { $regex: regex }},{"sections.contents.videoUrl" : { $regex: regex }},
          {"sections.contents.videoLength" : { $regex: regex }},{"sections.contents.videoDescription" : { $regex: regex }},
          {"sections.contents.imageUrl" : { $regex: regex }},{"sections.contents.imageDescription" : { $regex: regex }},
          {"sections.contents.pdfUrl" : { $regex: regex }},{"sections.contents.pdfDescription" : { $regex: regex }},
          {"sections.contents.textDescription" : { $regex: regex }},{"sections.contents.audioUrl" : { $regex: regex }},
          {"sections.contents.audioDescription" : { $regex: regex }}
        ]  
        }},
        {$project  : {title : 1 , Description : 1 ,posterImageUrl : 1 , overview : 1 ,createDate : 1 ,modifiedDate :1, averageRating : { $avg : "$ratings.rating" },
          noOfSections: { $size:"$sections" } , noOfTests :  { $size:"$test" } ,price : 1 , 
            totalTime : {$sum : [{ $multiply: [ "$timeInHours", 60 ] } , "$timeInMinutes" ]} , 
        }},
        {$sort : {createDate : 1 , totalTime : req.body.totalTime ? req.body.totalTime : 1 }},
        { $limit : req.body.limit  ? req.body.limit : 10},
        { $skip : req.body.skip ? req.body.skip : 0 }
      ])
      var minTime = 0 
      var maxTime = 100 
      var minPrice ;
      var maxPrice ;
      var array = []
      var arrayPrice = []
      course.map((single)=> {
        array.push(single.totalTime)
        arrayPrice.push(single.price)
        array.sort()
        arrayPrice.sort()
      })
      minPrice = arrayPrice[0]
      maxPrice = arrayPrice[arrayPrice.length - 1]
      minTime = array[0]
      maxTime = array[array.length - 1]
      return res.status(200).send( {course , maxTime ,minTime ,minPrice , maxPrice })
    }else{
      const course = await Course.aggregate([
        {$match : {deleted : false}},
        {$project  : {title : 1 , Description : 1 ,posterImageUrl : 1 , overview : 1 ,createDate : 1 ,modifiedDate :1, averageRating : { $avg : "$ratings.rating" },
          noOfSections: { $size:"$sections" } , noOfTests :  { $size:"$test" } ,price : 1 , 
            totalTime : {$sum : [{ $multiply: [ "$timeInHours", 60 ] } , "$timeInMinutes" ]} , 
        }},
        {$sort : {createDate : 1 , totalTime : req.body.totalTime ? req.body.totalTime : 1 }},
        { $limit : req.body.limit  ? req.body.limit : 10},
        { $skip : req.body.skip ? req.body.skip : 0 }
      ])
      var minTime = 0 
      var maxTime = 100 
      var minPrice ;
      var maxPrice ;
      var array = []
      var arrayPrice = []
      course.map((single)=> {
        array.push(single.totalTime)
        arrayPrice.push(single.price)
        array.sort()
        arrayPrice.sort()
      })
      minPrice = arrayPrice[0]
      maxPrice = arrayPrice[arrayPrice.length - 1]
     if(!maxPrice){
      maxPrice = arrayPrice[arrayPrice.length - 2]
     }
      minTime = array[0]
      maxTime = array[array.length - 1]
      return res.status(200).send( {course , maxTime ,minTime ,minPrice , maxPrice })
    }
    
    
  } catch (error) {
    return res.status(500).send(error)
  }
}
getAllCourses = async (req , res) => {
  try {
    const courses = await Course.aggregate([
      {$match : {$and : [{deleted : false},{ 'class':{'$exists':false}}]}},
      {$lookup:{
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy'
      }},
      {$project : {title : 1 , Description :1 ,posterImageUrl : 1 , "createdBy.name" : 1 , price : 1 }}
    ])
    return res.status(200).send(courses)
  } catch (error) {
    return res.status(500).send(error)
  }
}
getMoreTeachers = async (req , res) => {
  try {
    if(!req.body.search){return res.status(400).send("Please send the text")}

    function escapeRegex(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
    const regex = new RegExp(escapeRegex(req.body.search), "gi");
    const teacher = await User.aggregate([
      { $match: { $or : [{name : {$regex : regex }} ]}},
      {$project : {name : 1 , profilePic : 1}},
      { $limit : req.body.limit  ? req.body.limit : 5},
      { $skip : req.body.skip ? req.body.skip : 0 }
    ])
    return res.status(200).send(teacher)
  } catch (error) {
    return res.status(500).send(error)
  }
}
regexMatch = async (req ,res) => {
  try {
    if(!req.body.search){return res.status(400).send("Please send the text")}
    function escapeRegex(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
    const regex = new RegExp(escapeRegex(req.body.search), "gi");
    const institute = await Institute.aggregate([
      {$match : {deleted : false}},
      {$match : {$or : [
        {name : {$regex : regex }},{"classes.name" : {$regex : regex }},{"classes.description" : {$regex : regex }},
      ]}},
      {$project : {name : 1 , noOfBranches : { $size:"$branches" }  ,
        noOfClasses : { $size:"$classes" }  ,noOfCourses :{ $size:"$classes.courses" }  }},
        { $limit : req.body.limit  ? req.body.limit : 3},
        { $skip : req.body.skip ? req.body.skip : 0 }
    ])
    const course = await Course.aggregate([
      {$match : {deleted : false}},
      { $match: { $or : [
        {title : {$regex : regex }} ,{Description : { $regex: regex }},
        {posterImageUrl : { $regex: regex }},{overview : { $regex: regex }},
        {"sections.name" : { $regex: regex }},
        {"sections.contents.title" : { $regex: regex }},{"sections.contents.videoUrl" : { $regex: regex }},
        {"sections.contents.videoLength" : { $regex: regex }},{"sections.contents.videoDescription" : { $regex: regex }},
        {"sections.contents.imageUrl" : { $regex: regex }},{"sections.contents.imageDescription" : { $regex: regex }},
        {"sections.contents.pdfUrl" : { $regex: regex }},{"sections.contents.pdfDescription" : { $regex: regex }},
        {"sections.contents.textDescription" : { $regex: regex }},{"sections.contents.audioUrl" : { $regex: regex }},
        {"sections.contents.audioDescription" : { $regex: regex }}
      ]  
      }},
      {$project  : {title : 1 , Description : 1 ,posterImageUrl : 1 , overview : 1 , 
        noOfSections: { $size:"$sections" } , noOfTests :  { $size:"$test" } 
      }},
      { $limit : req.body.limit  ? req.body.limit : 3},
      { $skip : req.body.skip ? req.body.skip : 0 }
    ])
    return res.status(200).send({institute , course})
    
  } catch (error) {
    return res.status(500).send(error)
  }
}


//30/01/21

UsercourseList = async (req , res) => {
  try {

    const userId = req.user._id
    if(req.params.id){
      const course = await Course.aggregate([
        {$match : {_id : mongoose.Types.ObjectId(req.params.id)}},
        {$project : {title : 1 ,Description : 1 ,courseLanguage : 1 , price : 1 , posterImageUrl : 1 , overview : 1}}
      ])
      
      
      // .findOne({
      //   _id: req.params.id,
      // $or: [
      //   { sections: { $elemMatch: { deleted: !true } } },
      //   { sections: { $size: 0 } }
      // ]
      // })
      return res.status(200).send(course[0])
    }
    const courseList = await Course.aggregate([
      {$match : {$and: [{createdBy : mongoose.Types.ObjectId(userId)} , {deleted : false} ]}},
      {$project : {title : 1 ,Description : 1 , price : 1 , posterImageUrl : 1}}
    ])
    return res.status(200).send(courseList)
  } catch (error) {
    return res.status(500).send(error)
  }
}
UseruploadCourseProfile = async (req, res) => {
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
      return res.send({
        status: true,
        message: 'File is uploaded',
        name: filename,
        mimetype: file.mimetype
      })
    }
  } catch (error) {return res.status(500).send(error)}
}
UsersaveCourse = async (req, res) => {
  try {
    
    var course = new Course(req.body)
    if(!req.body.title){
      return res.status(400).send('Please send the title')
    }
    
    course.createdBy = req.user._id
    if (req.body._id) {
      course = await Course.findByIdAndUpdate(
        { _id: req.body._id },
        {
          title: course.title,
          Description: course.Description,
          categories: course.categories,
          posterImageUrl: course.posterImageUrl,
          overview: course.overview,
          price : course.price,
          courseLanguage : course.courseLanguage,
          categories : course.categories
        }
      )
      return res.status(200).send(course)
    } else {
       await course.save()
    }
    return res.status(200).send(course)
  } catch (error) {
    return res.status(500).send(error)
  }
}

UserdeleteCourse = async (req, res) => {
  if(!req.params.id){return res.status(400).send({message : "Please send the id"})}
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

saveUserCourseSection = async (req, res) => {
  try {
    if (req.body.courseId && !req.body._id) {
      var course = await Course.findById(req.body.courseId)
      if (course) {
        course.sections.push({
          name: req.body.name,
          timeInHours: req.body.timeInHours,
          timeInMinutes: req.body.timeInMinutes,
          order: req.body.order
        })
        await course.save()
        return res.status(200).send(course)
      }
    }
    if (req.body._id) {
      await Course.updateOne(
        {
          'sections._id': req.body._id
        },
        {
          $set: {
            'sections.$.name': req.body.name,
            'sections.$.timeInHours': req.body.timeInHours,
            'sections.$.timeInMinutes': req.body.timeInMinutes,
            'sections.$.order': req.body.order,
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
  } catch (error) {
    return res.status(500).send(error)
  }
  
}

getUserCourse = async (req, res) => {
  try {
    if(!req.params.id){return res.status(400).send({message : "Please send the id"})}
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
    
    return res.status(200).send(course)
  } catch (error) {
    return res.status(500).send(error);
  }
}
deleteUserCourseSection = async (req, res) => {
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


UserMyPurchaseCourses = async(req , res) => {
  try {
    const courses = await User.aggregate([
      {$match : {_id : mongoose.Types.ObjectId(req.user._id)}},
      {$project : {myCourses : 1 ,_id :0}},
      {$lookup:{
        from: 'courses',
        localField: 'myCourses',
        foreignField: '_id',
        as: 'myCourses'
      }},
      {$project : { "myCourses.Description": 1,
      // "myCourses.test": 1,
            "myCourses.categories": 1 , "myCourses.class": 1,"myCourses._id" : 1,
            "myCourses.createdBy":1,"myCourses.deleted": 1, "myCourses.overview": 1, 
         "myCourses.modifiedDate" : 1 , "myCourses.posterImageUrl": 1,
        //  "myCourses.ratings": 1,
         "myCourses.title": 1  ,
          "myCourses.averageRating" : { $avg : "$myCourses.ratings.rating" } 
      }}
    ])
    return res.status(200).send(courses)
  } catch (error) {
    return res.status(500).send(error)
  }
}
getUserRecentCourse = async (req ,res) => {
  try {
    var userRecent = await User.aggregate([
      {$match : {_id : req.user._id} } , 
      {$project : {recentHistory : 1 , _id :0}},
      {$unwind : "$recentHistory"},
      {$replaceRoot:{newRoot:"$recentHistory"}},
      {$sort : {"dateTime" : -1}},
      {$lookup :
        {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'courses'
 
      }},
      {$project : {'_id' : 1  , "courseId" : 1 ,"dateTime" : 1 , "courses._id" : 1 , "courses.title" : 1 ,"courses.Description" : 1 , "courses.posterImageUrl" : 1}}
      
      , {$unwind : "$courses"}

    ])
    return res.status(200).send(userRecent)
  } catch (error) {
    return res.status(200).send(error)
  }
}
getUserMyTest = async ( req , res) => {
  try {
    const courses = await User.aggregate([
      {$match : {_id : mongoose.Types.ObjectId(req.user._id)}},
      {$project : {myCourses : 1 ,_id :0}},
      
      {$lookup:{
        from: 'courses',
        localField: 'myCourses',
        foreignField: '_id',
        as: 'myCourses'
      }},
      {$unwind : "$myCourses"},
      {$replaceRoot : {newRoot : "$myCourses"}},
      {$project : {test: 1  }},
      {$lookup:{
        from: 'tests',
        localField: 'test',
        foreignField: '_id',
        as: 'test'
      }},
      {$unwind : "$test"},
      {$project : {
        _id : 1 ,
          'test.name' : 1 , 
          'test._id' : 1,
          'test.description' : 1,
          'test.class': 1,
          'test.totalMarks' :1,
          'test.passingMarks' :1,
          'test.timeInHours' :1,
          'test.timeInMinutes' :1 ,
          'test.testLevel' : 1
        }},
        // {$replaceRoot : {newRoot : "$test"}},
    ])
    return res.status(200).send(courses)
  } catch (error) {
    return res.status(500).send(error)
  }
}

getUserReviews = async (req , res) => {
  try {
    const {courseId} = req.params
    if(!courseId) { return res.status(400).send("Please send the courseId")}
    const courseReviews = await Course.aggregate([
      {$match : {_id : mongoose.Types.ObjectId(courseId)}},
      {$project : {reviews : 1  }},
      {$unwind : "$reviews"},
      {$lookup : 
        {
          from: 'users',
          localField: 'reviews.reviewBy',
          foreignField: '_id',
          as: 'reviews.reviewBy'

      }},
      {$project : {"reviews._id" : 1   , "reviews.review" : 1 , "reviews.createdAt" : 1 , "reviews.reviewBy.name" : 1}},
      {$sort : {"reviews.createdAt" :  -1}}
    ])
   return res.status(200).send(courseReviews)
  } catch (error) {
    return res.status(500).send(error)
  }
}

getUserSectionsProgressByCourseId = async (req , res) => {
  try {
    const userId= req.user._id;
    const { courseId } = req.params
    const progress =await User.aggregate(
      [
        {$match:{_id:mongoose.Types.ObjectId(userId)}},   
      {$project:{'courseProgress' : 1}},
      {$unwind:'$courseProgress'},     
      {$match:{'courseProgress.courseId':mongoose.Types.ObjectId(courseId)}},
     {$replaceRoot:{newRoot:'$courseProgress'}},
      {$unwind:'$Progress'}  ,
      {$replaceRoot:{newRoot:'$Progress'}},

    ])

    const course  = await Course.aggregate([
      {$match:{_id:mongoose.Types.ObjectId(courseId)}},
      
      {$project:{"sections._id" : 1 , "sections.name" : 1 , 
      "sections.timeInHours": 1,"sections.timeInMinutes" : 1, "sections.test" : 1 ,
      "sections.contents" : 1
      
      }
  },
      
    ])

    if(course) {
      
      course[0].sections.map(section => {
        
          section.contents.map(content => {

           var result =   progress.find(m => {        
           return m.contentId.toString() == content._id.toString() 
          })
          if(result){
            content.seen = result.seen?result.seen:false;
            content.VideoLastPosition = result.VideoLastPosition ? result.VideoLastPosition : 0
          }
          })

      })
      if(course.length){
        return res.status(200).send(course[0])
      }
    }
    // return res.status(200).send( course[0])
    
  //  return res.status(404).send()
  } catch (error) {
   return res.status(500).send(error)
  }
}


//course Category


//createCourseCategory
createCourseCategory = async (req , res) => {
  try {
    if(!req.body.name || !req.body.description){return res.status(400).send('Please Send the name and description')}
    var courseCategory = new CourseCategory(req.body)
    await courseCategory.save()
    return res.status(200).send(courseCategory)
  } catch (error) {
    return res.status(500).send(error)
  }
}
getAllCourseCategory = async(req , res) => {
  try {
    const categories = await CourseCategory.aggregate([
      {$project : {name : 1 }}
    ])
    return res.status(200).send(categories)
  } catch (error) {
    return res.status(500).send(error)
  }
}
editCourseCategory = async(req , res) => {
  try {
    if(!req.params.id){return res.status(400).send('Please send the id')}
    var categories = await CourseCategory.updateOne(
      { _id: req.params.id },
      {
        $set: {
            name: req.body.name,
            description: req.body.description,
        }
      }
    )
    return res.status(200).send(categories)
  } catch (error) {
    return res.status(500).send(error)
  }
}

deleteCourseCategory = async (req , res) => {
  try {
    CourseCategory.findByIdAndRemove(req.params.id)
    .then(entity => {
      if (!entity) {
        return res.status(404).send({
          message: 'Course not found with id ' + req.params.id
        })
      }
      res.status(200).send({ message: 'courseCategory deleted successfully!' })
    })
    .catch(err => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: 'courseCategory not found with id ' + req.params.id
        })
      }
      return res.status(500).send({
        message: 'Could not delete courseCategory with id ' + req.params.id
      })
    })
  } catch (error) {
    return res.status(500).send(error)
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
  getAllTestListToAdmin,
  getAllCoursesOfAllClasses,
  getAllClassNameForCourseAdd,
  getAllClassCoursesNameForTestadd,
  saveAnnouncement , 
  getAnnouncement,
  saveFaq,
  getFaq,
  getCourseContentByCourseId,
  addDiscussionAnswer , 
  getCourseDiscussion , 
  convertAudioFromVideo,
  
  //////////////Student Apis Fns
  GetClassCoursesForStudent,
  getCourseById,
  getSectionsByCourseId,
  getCourseTests,
  getCourseTestById,
  getTestQuestionsById,
  saveCourseTestResult,
  getStudentLastTestsResults,
  courseReviewData,
  getStudentSingleTestResult,
  getRecentCourses,
  getSectionsProgressByCourseId,
  courseDetailByCourseId,
  saveReview,
  getReviews,
  giveRating,
  getRatings,
  getAverageRatings,
  noOfStudentInCourse,
  createDiscussioninCourse,
  getDiscussion,


  regexMatchName , 
  regexMatch,
  getMoreCourses,
  getAllCourses,
  CourseDetailById,



  //UserCourse

  UsercourseList,
  UseruploadCourseProfile,
  UsersaveCourse,
  UserdeleteCourse,
  saveUserCourseSection,
  getUserCourse,
  deleteUserCourseSection,
  UserMyPurchaseCourses,
  getUserRecentCourse,
  getUserMyTest,
  getUserReviews,
  getUserSectionsProgressByCourseId,




  //courseCategory
  createCourseCategory,
  getAllCourseCategory,
  editCourseCategory,
  deleteCourseCategory
}
