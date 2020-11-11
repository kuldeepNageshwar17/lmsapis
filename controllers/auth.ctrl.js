const User = require('../models/user-model')
const Branch = require('../models/branch-model')
const Institute = require('../models/institute-model')
const Student = require('../models/student-model')
const jwt = require('jsonwebtoken')
const { ROLES } = require('./../models/constants')
const mongoose = require('mongoose')
createUser = async (req, res) => {
  try {
    const user = new User(req.body)
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
    await user.save()
    await branch.save()
    await institute.save()
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (error) {
    res.status(400).send(error)
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
      return res
        .status(401)
        .send({ error: 'Login failed! Check authentication credentials' })
    }
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
    const authToken = await user.generateAuthToken()
    res.send({ user, authToken, roles })
  } catch (error) {
    console.log(error.name)
    res.status(400).send('login error')
  }
}
getMe = async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const data = jwt.verify(token, process.env.JWT_KEY)
    User.findOne({ _id: data._id, 'tokens.token': token })
      .populate('branch', 'name')
      .exec(async (err, user) => {
        if (err) {
          return res.status(500).send(err)
        }
        if (!user) {
          return res.status(401).send({ error: 'need to sign in' })
        }
        var roledetails = await Institute.aggregate([
          { $match: { branches: mongoose.Types.ObjectId(user.branch._id) } },
          { $project: { roles: 1 } },
          { $unwind: '$roles' },
          { $replaceRoot: { newRoot: '$roles' } },
          { $match: { id: { $in: user.roles } } },
          { $project: { _id: 0, id: 1, type: 1, name: 1 } }
        ])
        // return res.status(200).send(roledetails)

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
      })
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
    res.status(200).send()
  } catch (error) {
    res.status(500).send(error)
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
    res.status(200).send({ student, authToken })
  } catch (error) {
    console.log(error.name)
    res.status(400).send('login error')
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
          profileImage: student.profileImage
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
    res.status(500).send(error)
  }
}

module.exports = {
  createUser,
  // createsystemUser,
  userLogin,
  logout,
  logoutAll,
  // userList,
  getMe,
  StudentLogin,
  getMeStudent,
  Studentlogout,
  studentLogoutAll
}
