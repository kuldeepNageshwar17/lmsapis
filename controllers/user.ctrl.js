
const mongoose = require('mongoose')
const User = require('../models/user-model')
var path = require('path')


updateRecentUserData = async (req, res) => {
    try {
        console.log(req.body ,req.user._id)
      const {
        id,
        date
      } = req.body
      const user = await User.updateOne({
        _id: req.user._id
      }, {
        $pull: {
          recentHistory: {
            courseId: id
          }
        }
      }, )
      const userUpdate = await User.updateOne({
        _id: req.user._id
      }, {
        $push: {
          recentHistory: {
            courseId: id,
            dateTime: date
          }
        }
      }, )
  
      await user.save()
      await userUpdate.save()
  
      res.status(200).send()
    } catch (error) {
      console.log("error here" , error)
      res.status(500).send()
    }
}
UserProgress = async (req, res) => {
    try {
      const {
        courseId,
        sectionId,
        contentId
      } = req.body
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
        }
      ])
      if (!userData.length) {
        const user = await User.updateOne({
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
        res.status(200).send(user)
      } else {
        var data1 = userData[0].courseProgress.Progress
        const data = data1.filter((m) => m.contentId == contentId)
        if (data.length) {
          if(req.body.time){
            const user = await User.updateOne({
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
          const user = await User.updateOne({
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
          const user = await User.updateOne({
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
        res.status(200).send({
          userData,
          data
        })
      }
  
  
  
    } catch (error) {
      res.status(500).send(error)
    }
  }
  getUserProgress = async (req , res) => {
    try {
        console.log(courseId , req.user._id)
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
    
    res.status(200).send(userData)
  
    } catch (error) {
      res.status(500).send('Error : ' , error)
    }
  }
module.exports = {
    updateRecentUserData,
    UserProgress,
    getUserProgress
}



