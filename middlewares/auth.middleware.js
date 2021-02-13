const jwt = require('jsonwebtoken')
const User = require('../models/user-model')
const Instititute = require('../models/institute-model')
require('../models/branch-model')
const Student = require('../models/student-model')
const { ROLE_LABLE } = require('../models/constants')
const auth = function (RoleType = [ROLE_LABLE.INSTITUTE_LABLE]) {
  return (req, res, next) => {   
    if (req.header('Authorization')) {
      const token = req.header('Authorization').replace('Bearer ', '')
      const data = jwt.verify(token, process.env.JWT_KEY)
      var isAuthorize = false
      try {
        User.findOne({ _id: data._id, 'tokens.token': token })
          .populate('branches')
          .exec((err, user) => {
            if (err) {
              return res.status(401).send({ error: 'need to sign in again ' })
            }
            if(!user || !user.branch){
              return res.status(401).send({ error: 'need to sign in again ' })
            }
            Instititute.findOne({ branches: user.branch }, { roles: 1 }).exec(
            async (err, institute) => {
                  if(!err && institute){
                    var Iroles =institute.toJSON().roles;
                    userRolesTypes = Iroles.filter(role => {
                      if (user.roles.includes(role.id)) return role ;
                    }).map(m=>m.type)
                    RoleType.every(type => {
                      if (userRolesTypes.includes(type)) {
                        req.user = user
                        req.token = token
                        isAuthorize = true
                      }
                      return true;
                    })
                    if (!isAuthorize) {
                      return res
                        .status(401)
                        .send({ error: 'need to sign in from authorized user' })
                    }
                    next()
                  }
               
              }
            )
          })
      } catch (error) {
        return res
          .status(500)
          .send({ error: 'Not authorized to access this resource' })
      }
    } else {
      return res
        .status(401)
        .send({ error: 'Not authorized to access this resource' })
    }
  }
}

const userAuth = () => {
    return async (req, res, next) => {   
      if (req.header('Authorization')) {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY)
        var isAuthorize = false
        try {
         var user = await User.findOne({ _id: data._id, 'tokens.token': token })
        
          if(user){
            req.user = user
            req.token = token
            isAuthorize = true
            next()
          }else{
           var student  = await Student.findOne({ _id: data._id, 'tokens.token': token }).populate('branch')
            if(student){
              req.user = student
              next()
              return;
            }
            return res
          .status(401)
          .send({ error: 'Not authorized to access this resource' })
          }          
        } catch (error) {
          return res
            .status(500)
            .send({ error: 'Not authorized to access this resource' })
           
        }
      } else {
        return res
          .status(401)
          .send({ error: 'Not authorized to access this resource' })
      }
    }
}


module.exports = auth,
module.exports = userAuth
  

