const mongoose = require('mongoose')
const Course = require('../models/course-model')
const User = require('../models/user-model')
require('dotenv').config()





paymentForPurchaseCourse = async (req, res) => {
  try {
    //first done payment and place all things in payment model and ref it in user model
    const {courseId , userId} = req.body
    var user  = await User.updateOne({_id : userId},{$push :{myCourses : courseId}})
    return res.status(200).send(user)
  } catch (error) {
    return res.status(400).send(error)
  }
}



module.exports = {
    paymentForPurchaseCourse
}
