// const CourseCategory = require('../models/course-category-model')
const Course = require('../models/course-model')
const Institute = require('../models/institute-model')
var path = require('path')
const { v4: uuidv4 } = require('uuid')
const { COURSE_CONTENT_TYPES } = require('./../models/constants')
const { response } = require('express')
const { getClasses } = require('./branch.ctrl')
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

// createCourseCategory = async (req, res) => {
//   try {
//     var category = new CourseCategory(req.body)
//     if (req.body._id) {
//       category = await CourseCategory.findByIdAndUpdate(
//         { _id: category._id },
//         { name: category.name, description: category.description },
//         { new: true }
//       )
//       return res.status(200).send(category)
//     } else await category.save()
//     return res.status(200).send(category)
//   } catch (error) {
//     return res.status(500).send(error)
//   }
// }
// deleteCourseCategory = async (req, res) => {
//   CourseCategory.findByIdAndRemove(req.params.id)
//     .then(categ => {
//       if (!categ) {
//         return res.status(404).send({
//           message: 'category not found with id ' + req.params.id
//         })
//       }
//       res.send({ message: 'category deleted successfully!' })
//     })
//     .catch(err => {
//       if (err.kind === 'ObjectId' || err.name === 'NotFound') {
//         return res.status(404).send({
//           message: 'Category not found with id ' + req.params.id
//         })
//       }
//       return res.status(500).send({
//         message: 'Could not delete category with id ' + req.params.id
//       })
//     })
// }
// getCategory = async (req, res) => {
//   CourseCategory.findById(req.params.id)
//     .then(categ => {
//       if (!categ) {
//         return res.status(404).send({
//           message: 'category not found with id ' + req.params.id
//         })
//       }
//       res.status(200).send(categ)
//     })
//     .catch(err => {
//       if (err.kind === 'ObjectId' || err.name === 'NotFound') {
//         return res.status(404).send({
//           message: 'Note not found with id ' + req.params.id
//         })
//       }
//       return res.status(500).send({
//         message: 'Could not Get Course note with id ' + req.params.id
//       })
//     })
// }
// getAllcategories = async (req, res) => {
//   CourseCategory.find()
//     .then(categories => {
//       return res.status(200).send(categories)
//     })
//     .catch(err => {
//       return res.status(500).send(error)
//     })
// }
saveCourse = async (req, res) => {
  try {
    var course = new Course(req.body)
    course.class = req.params.id
    if (req.body._id) {
      // intitute = await Course.findByIdAndUpdate(
      //   { _id: req.body._id },
      //   {
      //     title: course.title,
      //     Description: course.Description,
      //     categories: course.categories,
      //     posterImageUrl: course.posterImageUrl,
      //     overview: course.overview
      //   },
      //   { new: true }
      // )
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
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let file = req.files.file
      // var courseId = req.body.courseId
      // if (req.body.courseId) {
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
      res.send({ message: 'course deleted successfully!' })
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
  Course.findOne({
    _id: req.params.id,
    $or: [
      { sections: { $elemMatch: { deleted: !true } } },
      { sections: { $size: 0 } }
    ]
    // "sections.$.contents":{ $elemMatch:{ "$.deleted":false }}
  })
    .then(entity => {
      if (!entity) {
        return res.status(404).send({
          message: 'Course not found with id ' + req.params.id
        })
      }
      entity.sections = entity.sections.filter(m => m.deleted != true)
      res.status(200).send(entity)
    })
    .catch(err => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: 'Course not found with id ' + req.params.id
        })
      }
      return res.status(500).send({
        message: 'unable to fetch course' + req.params.id
      })
    })
}
getClassCourses = async (req, res) => {
  classId = req.params.iid
  // var branchId = req.headers.branchid
  try {
    var { classes } = await Institute.findOne({
      classes: { $elemMatch: { _id: classId } }
    }).populate('classes.courses')
    if (classes.length) {
      // classes.
      return res.status(200).send(classes[0].courses)
    } else {
      return res.status(400).send('Courses Not Found')
    }
  } catch (error) {
    return res.status(500).send({
      message: 'Could not get course '
    })
  }

  // Course.find({}, { sections: 0, deletd: 0 })
  //   .then(entity => {
  //     res.status(200).send(entity)
  //   })
  //   .catch(err => {
  //     return res.status(500).send({
  //       message: 'Could not get course '
  //     })
  //   })
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
  var params = req.body
  if (params.courseId) {
    if (params._id) {
      await Course.updateOne(
        {
          _id: params.courseId,
          'sections._id': params._id
        },
        {
          $set: {
            'sections.$.deleted': true
          }
        }
      )
        .then(result => {
          return res.status(200).send(result)
        })
        .catch(err => {
          return res.status(500).send('document  not found')
        })
    } else return res.status(400).send('_id field is required , bad request')
  } else return res.status(400).send('courseId field is required , bad request')
}
saveSectionContent = async (req, res) => {
  var params = req.body
  if (params.courseId) {
    if (params.sectionId) {
      if (params._id) {
        Course.updateOne(
          {
            _id: req.body.courseId
          },
          {
            $set: {
              'sections.$[outer].contents.$[inner]': {
                title: req.body.title,
                type: req.body.type,
                contentUrl: req.body.contentUrl,
                modifiedDate: new Date()
              }
            }
          },
          {
            arrayFilters: [
              { 'outer._id': req.body.sectionId },
              { 'inner._id': req.body._id }
            ]
          },
          (err, result) => {
            if (!err) {
              if (result.nModified === 0) {
                res.status(400).send(result)
                console.log(result)
                return
              } else {
                res.status(200).send('ok')
              }
            } else {
              res.status(400).send(err)
              console.log(err)
              return
            }
          }
        )
      } else {
        Course.updateOne(
          {
            _id: req.body.courseId
          },
          {
            $push: {
              'sections.$[outer].contents': {
                title: req.body.title,
                type: req.body.type,
                contentUrl: req.body.contentUrl
              }
            }
          },
          {
            arrayFilters: [{ 'outer._id': req.body.sectionId }]
          },
          (err, result) => {
            if (!err) {
              if (result.nModified === 0) {
                res.status(400).send(result)
                console.log(result)
                return
              } else {
                res.status(200).send(result)
              }
            } else {
              res.status(400).send(err)
              console.log(err)
              return
            }
          }
        )
      }
    } else
      return res.status(400).send('Section Id field is required , bad request')
  } else
    return res.status(400).send('course Id field is required , bad request')
}
saveSectionContentFile = async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      })
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let file = req.files.file
      var courseId = req.body.courseId
      if (req.body.courseId) {
        var course = await Course.findById(req.body.courseId)
        if (!course) {
          res.send({
            status: false,
            message: 'No Course Found'
          })
        }
        var filename =
          file.name.substr(0, file.name.lastIndexOf('.')).substr(0, 20) +
          path.extname(file.name)
        file.mv(
          './public/uploads/CourseContent/_' + course._id + '/' + filename
        )
        res.send({
          status: true,
          message: 'File is uploaded',
          name: filename,
          mimetype: file.mimetype
        })
      } else {
        res.status(500).send({
          status: false,
          message: 'No Course Found'
        })
      }
    }
  } catch (err) {
    res.status(500).send(err)
  }
}
deleteCourseSectionContent = async (req, res) => {
  var id = req.body.id

  await Course.findOneAndUpdate(
    {},
    {
      $pull: { 'sections.$[].contents': { _id: id } }
    }
  )
    .then(result => {
      return res.status(200).send(result)
    })
    .catch(err => {
      return res.status(500).send('document  not found')
    })
}

module.exports = {
  getCourseContentTypes,
  // createCourseCategory,
  // deleteCourseCategory,
  // getAllcategories,
  // getCategory,
  saveCourse,
  deleteCourse,
  // getAllCourse,
  getClassCourses,
  getCourse,
  saveCourseSection,
  getSectionDetails,
  deleteCourseSection,
  saveSectionContent,
  saveSectionContentFile,
  deleteCourseSectionContent,
  uploadCourseProfile
}
