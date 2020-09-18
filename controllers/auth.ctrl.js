const User = require('../models/user-model')
const Branch = require('../models/branch-model')
const Institute = require('../models/institute-model')
const jwt = require('jsonwebtoken')
const { ROLES } = require('./../models/constants')
createUser = async (req, res) => {
  try {
    const user = new User(req.body)
    const institute = new Institute({name:req.body.institute,code:req.body.institute})
    const branch =  new Branch({name:req.body.institute})
    institute.roles = ROLES
    // await institute.save()
    // var branch= await Branch.find({});
    // user.branches=[branch[0]._id];
    let roles = institute.roles
      .filter(m => m.name === 'Institute-Admin' || m.name === 'Branch-Admin')
      .map(m => m.id)
    user.roles = roles
   
    institute.defaultBranch=branch._id;  
    institute.branches=[]  
    institute.branches.push(branch._id);
    branch.users=[];    
    branch.users.push(user._id);    
    institute.users=[];
    institute.users.push(user._id);
    user.branch=branch._id;
    await user.save()
    await branch.save()
    await institute.save()
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (error) {
    res.status(400).send(error)
  }
}
// createsystemUser = async (req, res) => {
//   try {
//     const user = new User(req.body)
//     await user.save()
//     const token = await user.generateAuthToken()
//     res.status(201).send({ user, token })
//   } catch (error) {
//     res.status(400).send(error)
//   }
// }

userLogin = async (req, res) => {
  //Login a registered user
  try {
    const { email, password } = req.body
    const user = await User.findByCredentials(email, password)
    if (!user) {
      return res
        .status(401)
        .send({ error: 'Login failed! Check authentication credentials' })
    }
    const authToken = await user.generateAuthToken()
    res.send({ user, authToken })
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
      .populate('branch')
      .exec((err, user) => {
        if (err) {
          return res.status(500).send(err)
        }
        if (!user) {
          return res.status(401).send({ error: 'need to sign in' })
        }
        return res.status(200).send({
          name: user.name,
          email: user.email,
          _id: user._id,
          username: user.username,
          mobile: user.mobile,
          branch: user.branch
        })
      })
  }catch (error) {
    return res.status(500).send(error)
  }
}

logout = async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const data = jwt.verify(token, process.env.JWT_KEY)

    var user = await User.findOne({ _id: data._id, 'tokens.token': token })

    if (user) {
      user.tokens = user.tokens.filter(t => {
        t != token
      })
      await user.save()
      return res.send()
    }

    return res.status(500).send(error)
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
    res.send()
  } catch (error) {
    res.status(500).send(error)
  }
}

userList = async (resq, res) => {
  try {
    res.status(200).send('userlist')
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
  userList,
  getMe
}
