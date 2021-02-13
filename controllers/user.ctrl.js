
const mongoose = require('mongoose')
const User = require('../models/user-model')
var path = require('path')


updateRecentUserData = async (req, res) => {
    try {
      const {
        id,
        date
      } = req.body
      var user = await User.updateOne({
        _id: req.user._id
      }, {
        $pull: {
          recentHistory: {
            courseId: id
          }
        }
      }, )
      var userUpdate = await User.updateOne({
        _id: req.user._id
      }, {
        $push: {
          recentHistory: {
            courseId: id,
            dateTime: date
          }
        }
      }, )
  
     
  
      return res.status(200).send()
    } catch (error) {
      console.log("error here" , error)
      return res.status(500).send()
    }
}
UserProgress = async (req, res) => {
    try {
      const {
        courseId,
        sectionId,
        contentId
      } = req.body
      var userData = await User.aggregate([{
          $match: {
            _id: mongoose.Types.ObjectId(req.user._id)
          }
        },
        {
          $project: {
            courseProgress: 1
          }
        },
        {
          $unwind: "$courseProgress"
        },
        {
          $match: {
            "courseProgress.courseId": mongoose.Types.ObjectId(courseId)
          }
        }
      ])
      if (!userData.length) {
        var user = await User.updateOne({
          _id: req.user._id
        }, {
          $push: {
            courseProgress: {
              courseId: courseId,
              Progress: [{
                contentId: contentId,
                sectionsId: sectionId,
                seen: true
              }]
            }
          }
        }, )
        return res.status(200).send(user)
      } else {
        var data1 = userData[0].courseProgress.Progress
        const data = data1.filter((m) => m.contentId == contentId)
        if (data.length) {
          if(req.body.time){
            var user = await User.updateOne({
              _id: req.user._id
            }, {
              $set: {
                'courseProgress.$[course].Progress.$[content].VideoLastPosition': req.body.time
              }
            }, {
              arrayFilters: [{
                'course.courseId': courseId
              }, {
                'content.contentId': contentId
              }]
            }, )
          }
          var user = await User.updateOne({
            _id: req.user._id
          }, {
            $set: {
              'courseProgress.$[course].Progress.$[content].seen': true
            }
          }, {
            arrayFilters: [{
              'course.courseId': courseId
            }, {
              'content.contentId': contentId
            }]
          }, )
        } else {
          var user = await User.updateOne({
            _id: req.user._id
          }, {
            $push: {
              'courseProgress.$[course].Progress': {
                contentId: contentId,
                sectionsId: sectionId,
                seen:true
              }
            }
          }, {
            arrayFilters: [{
              'course.courseId': courseId
            }]
          }, )
        }
        return res.status(200).send({
          userData,
          data
        })
      }
    } catch (error) {
      return res.status(500).send(error)
    }
  }
  getUserProgress = async (req , res) => {
    try {
      const {courseId} = req.params
      const userData = await User.aggregate([{
        $match: {
          _id: mongoose.Types.ObjectId(req.user._id)
        }
      },
      {
        $project: {
          courseProgress: 1
        }
      },
      {
        $unwind: "$courseProgress"
      },
      {
        $match: {
          "courseProgress.courseId": mongoose.Types.ObjectId(courseId)
        }
      },
      {$unwind : "$courseProgress.Progress"},
      {$replaceRoot:{newRoot:"courseProgress.Progress"}}
    ])
    
    return res.status(200).send(userData)
  
    } catch (error) {
      return res.status(500).send('Error : ' , error)
    }
  }
module.exports = {
    updateRecentUserData,
    UserProgress,
    getUserProgress
}



