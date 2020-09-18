const CourseCategory = require('../models/course-category-model')
const Course = require('../models/course-model')
var path = require('path')

const { COURSE_CONTENT_TYPES } = require('./../models/constants')
const { response } = require('express')
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
createCourseCategory = async (req, res) => {
  try {
    var category = new CourseCategory(req.body)
    if (req.body._id) {
      category = await CourseCategory.findByIdAndUpdate(
        { _id: category._id },
        { name: category.name, description: category.description },
        { new: true }
      )
      return res.status(200).send(category)
    } else await category.save()
    return res.status(200).send(category)
  } catch (error) {
    return res.status(500).send(error)
  }
}
deleteCourseCategory = async (req, res) => {
  CourseCategory.findByIdAndRemove(req.params.id)
    .then(categ => {
      if (!categ) {
        return res.status(404).send({
          message: 'category not found with id ' + req.params.id
        })
      }
      res.send({ message: 'category deleted successfully!' })
    })
    .catch(err => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: 'Category not found with id ' + req.params.id
        })
      }
      return res.status(500).send({
        message: 'Could not delete category with id ' + req.params.id
      })
    })
}
getCategory = async (req, res) => {
  CourseCategory.findById(req.params.id)
    .then(categ => {
      if (!categ) {
        return res.status(404).send({
          message: 'category not found with id ' + req.params.id
        })
      }
      res.status(200).send(categ)
    })
    .catch(err => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: 'Note not found with id ' + req.params.id
        })
      }
      return res.status(500).send({
        message: 'Could not Get Course note with id ' + req.params.id
      })
    })
}
getAllcategories = async (req, res) => {
  CourseCategory.find()
    .then(categories => {
      return res.status(200).send(categories)
    })
    .catch(err => {
      return res.status(500).send(error)
    })
}
saveCourse = async (req, res) => {
  try {
    var course = new Course(req.body)
    if (req.body._id) {
      course = await Course.findByIdAndUpdate(
        { _id: course._id },
        {
          title: course.title,
          Description: course.Description,
          categories: course.categories,
          posterImageUrl: course.posterImageUrl,
          overview: course.overview,
          timeInHours: course.timeInHours,
          timeInMinutes: course.timeInMinutes
        },
        { new: true }
      )
      return res.status(200).send(course)
    } else await course.save()
    return res.status(200).send(course)
  } catch (error) {
    return res.status(500).send(error)
  }
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
    sections:  { $elemMatch:{ deleted:false } }  , 
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
getAllCourse = async (req, res) => {
  Course.find({}, { sections: 0, deletd: 0 })
    .then(entity => {
      res.status(200).send(entity)
    })
    .catch(err => {
      return res.status(500).send({
        message: 'Could not get course '
      })
    })
}
saveCourseSection = async (req, res) => {
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
    } else {
      var course = await Course.findById(req.body.courseId)

      if (course) {
        course.sections.push({
          name: params.name,
          timeInHours: params.timeInHours,
          timeInMinutes: params.timeInMinutes,
          order: params.order
        })
        await course
          .save()
          .then(result => res.status(200).send(result))
          .catch(err => res.status(500).send(err))
      }
    }
  } else return res.status(400).send('courseId field is required , bad request')
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
        var filename = file.name.substr(0,file.name.lastIndexOf('.')).substr(0, 20) + path.extname(file.name)
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
  var id = req. body.id
  
      await Course.findOneAndUpdate({},
        {
          $pull:{'sections.$[].contents': { "_id" : id}}          
        }
        
      ).then(result => {
          return res.status(200).send(result)
        })
        .catch(err => {
          return res.status(500).send('document  not found')
        })
       
}

module.exports = {
  getCourseContentTypes,
  createCourseCategory,
  deleteCourseCategory,
  getAllcategories,
  getCategory,
  saveCourse,
  deleteCourse,
  getAllCourse,
  getCourse,
  saveCourseSection,
  deleteCourseSection,
  saveSectionContent,
  saveSectionContentFile,
  deleteCourseSectionContent
}
