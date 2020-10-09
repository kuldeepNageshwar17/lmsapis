const jwt = require('jsonwebtoken')
const Student = require('../models/student-model')
// const Branch = require('../models/branch-model')

require('../models/branch-model')
const studentAuth = function () {
  return (req, res, next) => {
    if (req.header('Authorization')) {
      const token = req.header('Authorization').replace('Bearer ', '')
      const data = jwt.verify(token, process.env.JWT_KEY)
      var isAuthorize = false
      try {
        Student.findOne({ _id: data._id, 'tokens.token': token })
          .populate('branch')
          .exec((err, student) => {
            if (student) {
              req.user = student
              next()
            }
            if (err) {
              return res.status(401).send({ error: 'need to sign in again ' })
            }
          })
      } catch (error) {
        return res.status(500).send({ error: 'something wrong' })
      }
    } else {
      return res
        .status(401)
        .send({ error: 'Not authorized to access this resource' })
    }
  }
}
module.exports = studentAuth
