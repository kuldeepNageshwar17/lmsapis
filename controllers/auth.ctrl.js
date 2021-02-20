const User = require('../models/user-model')
const Branch = require('../models/branch-model')
const Institute = require('../models/institute-model')
const Student = require('../models/student-model')
const jwt = require('jsonwebtoken')
const { ROLES } = require('./../models/constants')
const mongoose = require('mongoose')
const  {sendEmail}  = require('../services/email')
var path = require('path')
const { v4: uuidv4 } = require('uuid')
const { Console } = require('console')
const { type } = require('os')


createUser = async (req, res) => {
  try {
    const { name , email , mobile , password , role } = req.body
    console.log("req.body" , req.body)
    // return  res.status(200).send({message : 'Please Check Your Email And Verify First'})
    var phoneNumber = parseInt(req.body.mobile)

    if(!name || !email || !mobile || !password){return res.status(400).send("Please send the name , email , mobile number ,  password")}
    const ExistUser = await User.aggregate([
      {$match : {$or : [ {email : req.body.email} , {mobile : phoneNumber } ] }},
      {$project : {email : 1 , mobile : 1}}
    ])
    if(ExistUser && ExistUser.length){
      if(ExistUser[0].email == req.body.email){
        return res.status(400).send("Email Address Already Exist Please Give Different Email Address")
      }
      if(ExistUser[0].mobile == phoneNumber || req.body.mobile){
        return res.status(400).send("Mobile Number Already Exist Please Give Different Mobile Number")
      }
    }
    console.log("in here")
    const user = new User(req.body)
    if(role){
      user.roles = [role]
    }

    if(req.body.institute){
      const institute = new Institute({
        name: req.body.institute,
        code: req.body.institute
      })
      const branch = new Branch({ name: req.body.institute })
      institute.roles = ROLES
  
      let roles = institute.roles
        .filter(m => m.name === 'Institute-Admin' || m.name === 'Branch-Admin')
        .map(m => m.id)
      user.roles = roles
  
      institute.defaultBranch = branch._id
      institute.branches = []
      institute.branches.push(branch._id)
      branch.users = []
      branch.users.push(user._id)
      branch.institute = institute._id
      branch.address = {
        address: '',
        city: '',
        state: ''
      }
  
      institute.users = []
      institute.users.push(user._id)
      user.branch = branch._id
      await branch.save()
      await institute.save()
    }
    const token = await user.generateAuthToken()

    await user.save()
    // sendEmail(req.body.email , "Verify Email" , 'http://192.168.1.3:8000/auth/login/' + token)
    res.status(200).send({message : 'Please Check Your Email And Verify First'})
  } catch (error) {
    res.status(500).send(error)
  }
}

verifyUser = async(req , res) => {
    try {
      const token  = req.params.token
      const data = jwt.verify(token, process.env.JWT_KEY)
      const user = await User.findOne({ _id: data._id, 'tokens.token': token })
      if(!user){return res.status(400).send('User Not Found ')}
      user.isActive = true
      const activeUser = await user.save()
      return res.status(200).send({ activeUser })
    } catch (error) {
      return res.status(500).send(error)
    }
}

userLogin = async (req, res) => {
  //Login a registered user
  try {
    
    const { email, password } = req.body
    
    if (!email || !password) {
      return res
        .status(400)
        .send({ error: 'Please send the email and password' })
    }
    const user = await User.findByCredentials(email, password)


    if (!user) {
      // await Institute.find({branches:user.branch},{"roles._id":{$in:user.roles}});
      const student = await Student.findByCredentials(email, password)
      if (!student) {
        return res
          .status(401)
          .send({ error: 'Login failed! Check authentication credentials' })
      }
      const authToken = await student.generateAuthToken()
      return res.status(200).send({ student, authToken })
    }
   
    if(!user.isActive){ return res.status(400).send("Please Verify your email")}
    const authToken = await user.generateAuthToken()
    if(user && user.branch ){
      roles = await Institute.aggregate([
        {
          $match: { branches: mongoose.Types.ObjectId(user.branch._id) }
        },
        {
          $project: { roles: 1 }
        },
        {
          $unwind: '$roles'
        },
        {
          $replaceRoot: { newRoot: '$roles' }
        },
        {
          $match: { id: { $in: user.roles } }
        },
        {
          $project: { id: 1, type: 1, name: 1 }
        }
      ])
     return res.status(200).send({ user, authToken, roles })
    }
    return res.send({ user, authToken  })
  } catch (error) {
    console.log(error)
    return res.status(500).send('login error')
  }
}
getMe = async (req, res) => {
  try {
    
    const token = req.params.authToken ||  req.header('Authorization').replace('Bearer ', '') 
    // if(!token){
    //   token =  req.params.authToken
    // }
    const data = jwt.verify(token, process.env.JWT_KEY)
    const user = await User.findOne({ _id: data._id, 'tokens.token': token }).populate('branch', 'name')
    if (!user) {
      const student = await Student.findOne({ _id: data._id, 'tokens.token': token }).populate('branch', 'name')
       if (!student) {
              return res.status(401).send({ error: 'need to sign in' })
       }else{
              return res.status(200).send({
                name: student.name,
                email: student.email,
                _id: student._id,
                username: student.name,
                mobile: student.mobile,
                branch: student.branch,
                profileImage: student.profileImage,
                fees : student.fees,
                category : student.category
              })
      }
    }else{
      if(user && user.branch){
        var roledetails = await Institute.aggregate([
          { $match: { branches: mongoose.Types.ObjectId(user.branch._id) } },
          { $project: { roles: 1 } },
          { $unwind: '$roles' },
          { $replaceRoot: { newRoot: '$roles' } },
          { $match: { id: { $in: user.roles } } },
          { $project: { _id: 0, id: 1, type: 1, name: 1 } }
        ])
      

      var RoleIds = roledetails.map(m => m.id)
      //return res.status(200).send(RoleIds)

      var rolePermissions = await Institute.aggregate([
        {
          $match: {
            branches: mongoose.Types.ObjectId(user.branch._id)
          }
        },
        { $unwind: '$roles' },
        {
          $replaceRoot: { newRoot: '$roles' }
        },
        { $match: { id: { $in: RoleIds } } },
        { $unwind: '$permissions' },
        {
          $replaceRoot: { newRoot: '$permissions' }
        },
        {
          $group: { _id: { module: '$module', permission: '$permission' } }
        },
        {
          $replaceRoot: { newRoot: '$_id' }
        }
        // {
        //     $group: {
        //       _id: '$module',
        //       count: { $sum: '$permission' }
        //     }
        // }
      ])
      //  return res.status(200).send(rolePermissions)

      return res.status(200).send({
        name: user.name,
        permission: rolePermissions,
        email: user.email,
        _id: user._id,
        username: user.username,
        mobile: user.mobile,
        branch: user.branch,
        roles: roledetails
      })
    }else{
      
      return res.status(200).send({
        name: user.name,
        email: user.email,
        _id: user._id,
        username: user.username,
        mobile: user.mobile,
        roles: user.roles
      })
    }
  }
  } catch (error) {
    return res.status(500).send(error)
  }
}

logout = async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    if (!token) {
      return res.status(401).send({ error: 'Please send the login token' })
    }
    const data = jwt.verify(token, process.env.JWT_KEY)
    var user = await User.findOne({ _id: data._id, 'tokens.token': token })
    if (user) {
      user.tokens = user.tokens.filter(t => {
        t != token
      })
      await user.save()
      return res.status(200).send()
    }
    return res.status(200).send()
  } catch (error) {
    // req.user.tokens = req.user.tokens.filter((token) => {
    //     return token.token != req.token

    // await req.user.save()
    // res.send()
    return res.status(500).send(error)
  }
}

logoutAll = async (req, res) => {
  try {
    req.user.tokens.splice(0, req.user.tokens.length)
    await req.user.save()
    return res.status(200).send()
  } catch (error) {
    return res.status(500).send(error)
  }
}

// userList = async (resq, res) => {
//   try {
//     res.status(200).send('userlist')
//   } catch (error) {
//     res.status(500).send(error)
//   }
// }
StudentLogin = async (req, res) => {
  //Login a registered user
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).send({ error: 'Please send email and password' })
    }
    const student = await Student.findByCredentials(email, password)
    if (!student) {
      return res
        .status(401)
        .send({ error: 'Login failed! Check authentication credentials' })
    }
    const authToken = await student.generateAuthToken()
   return res.status(200).send({ student, authToken })
  } catch (error) {
    console.log(error.name)
    return res.status(500).send('login error')
  }
}

getMeStudent = async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    if (!token) {
      return res.status(401).send({ error: 'Please send the login token' })
    }
    const data = jwt.verify(token, process.env.JWT_KEY)
    Student.findOne({ _id: data._id, 'tokens.token': token })
      .populate('branch', 'name')
      .exec((err, student) => {
        if (err) {
          return res.status(500).send(err)
        }
        if (!student) {
          return res.status(401).send({ error: 'need to sign in' })
        }
        return res.status(200).send({
          name: student.name,
          email: student.email,
          _id: student._id,
          username: student.name,
          mobile: student.mobile,
          branch: student.branch,
          profileImage: student.profileImage,
          fees : student.fees
        })
      })
  } catch (error) {
    return res.status(500).send(error)
  }
}

Studentlogout = async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    if (!token) {
      return res.status(401).send({ error: 'Please send the login token' })
    }
    const data = jwt.verify(token, process.env.JWT_KEY)

    var student = await Student.findOne({
      _id: data._id,
      'tokens.token': token
    })

    if (student) {
      student.tokens = student.tokens.filter(t => {
        t != token
      })
      await student.save()
      return res.status(200).send()
    }

    return res.status(200).send()
  } catch (error) {
    // req.user.tokens = req.user.tokens.filter((token) => {
    //     return token.token != req.token

    // await req.user.save()
    // res.send()
    return res.status(500).send(error)
  }
}

studentLogoutAll = async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    if (!token) {
      return res.status(401).send({ error: 'Please send the login token' })
    }
    const data = jwt.verify(token, process.env.JWT_KEY)

    var student = await Studnet.findOne({
      _id: data._id,
      'tokens.token': token
    })

    student.tokens.splice(0, stundent.tokens.length)
    await student.save()
    return res.status(200).send()
  } catch (error) {
    return res.status(500).send(error)
  }
}

getMyProfileDetails =async (req , res) => {
  try {

    console.log("in here auth ")
    const token = req.header('Authorization').replace('Bearer ', '')
    if (!token) {
      return res.status(401).send({ error: 'Please send the login token' })
    }
    const data = jwt.verify(token, process.env.JWT_KEY)

    const user = await User.aggregate([
      {$match : { _id: mongoose.Types.ObjectId(data._id), 'tokens.token': token}},
    ])
    if(!user || user.length == 0 ){
      const student = await Student.aggregate([
        {$match : { _id : mongoose.Types.ObjectId(data._id), 'tokens.token': token}}
      ])
      return res.status(200).send(student)
    }else{
      return res.status(200).send(user)
    }
  } catch (error) {
    return res.status(500).send(error)
  }
}


uploadProfilePic = async (req, res) => {
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
      file.mv('./public/uploads/Profiles/' + filename)
     return res.send({
        status: true,
        message: 'File is uploaded',
        name: filename,
        mimetype: file.mimetype
      })
    }
  } catch (error) {res.status(500).send()}
}

updateProfileDetails = async(req , res) => {
  try {
//     console.log('data req' , req.user._id)
// console.log("data update" ,new Date( req.body.experience.firstExperienceD1).toLocaleDateString())
    var user = await User.findOne({_id : req.user._id})
    if(user){
      var userdata = await User.updateOne(
        {_id : req.user._id},
        {
          $set :{
            name : req.body.name ?req.body.name : "",
            profession : req.body.profession ?req.body.profession : "",
            profilePic: req.body.profilePic ? req.body.profilePic : "",
            'qualifications.bachelorQualificationsTitle' : req.body.qualifications.bachelorQualificationsTitle ? req.body.qualifications.bachelorQualificationsTitle :"",
            'qualifications.bachelorQualificationsDescription' : req.body.qualifications.bachelorQualificationsDescription ?req.body.qualifications.bachelorQualificationsDescription : "",
            'qualifications.masterQualificationsTitle' : req.body.qualifications.masterQualificationsTitle ? req.body.qualifications.masterQualificationsTitle: "",
            'qualifications.masterQualificationsDescription'  : req.body.qualifications.masterQualificationsDescription ? req.body.qualifications.masterQualificationsDescription : "",
            'experience.firstExperienceTitle' : req.body.experience.firstExperienceTitle  ? req.body.experience.firstExperienceTitle :"",
            'experience.firstExperienceD1' : req.body.experience.firstExperienceD1 ? new Date(req.body.experience.firstExperienceD1).toLocaleString()  : "",
            'experience.firstExperienceD2' : req.body.experience.firstExperienceD2 ? new Date(req.body.experience.firstExperienceD2).toLocaleString()   :"",
            'experience.secondExperienceTitle' : req.body.experience.secondExperienceTitle ? req.body.experience.secondExperienceTitle : "",
            'experience.secondExperienceD1' : req.body.experience.secondExperienceD1 ? new Date(req.body.experience.secondExperienceD1).toLocaleString()   :"",
            'experience.secondExperienceD2' : req.body.experience.secondExperienceD2 ?  new Date(req.body.experience.secondExperienceD2).toLocaleString()  : "",
            'experience.checked1' : req.body.experience.checked1 ? req.body.experience.checked1 : false,
            'experience.checked2' : req.body.experience.checked2 ? req.body.experience.checked2 : false,
          }
        },
      
      )
     return res.status(200).send(userdata)
    }else{
      var studentData = await Student.updateOne(
        {_id : req.user._id},
        {
          $set :{
            name : req.body.name ?req.body.name : "",
            profileImage: req.body.profileImage ? req.body.profileImage : "",
          }
        },
      )
      return res.status(200).send(studentData)
    }
    
  } catch (error) {
    return res.status(500).send(error)
  }
}
module.exports = {
  createUser,
  // createsystemUser,
  verifyUser,
  userLogin,
  logout,
  logoutAll,
  // userList,
  getMe,
  StudentLogin,
  getMeStudent,
  Studentlogout,
  studentLogoutAll,

  getMyProfileDetails,
  uploadProfilePic,
  updateProfileDetails
}
