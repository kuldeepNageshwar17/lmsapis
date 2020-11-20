const mongoose = require('mongoose')
const Branch = require('../models/branch-model')
const User = require('../models/user-model')
const Institute = require('../models/institute-model')

saveBranch = async (req, res) => {
  try {
    var branch = new Branch(req.body)

    if (req.body._id) {
      branch = await Branch.findByIdAndUpdate(
        { _id: req.body._id },
        {
          $set: {
            name: branch.name,
            code: branch.code,
            address: branch.address
          }
        },
        { new: true }
      )
      return res.status(200).send(branch)
    } else {
      var parentBranch = await Branch.findById(req.headers.branchid)
      if (!parentBranch) {
        return res.status(400).send(error)
      }
      branch.institute = parentBranch.institute
      await Institute.updateOne(
        { _id: parentBranch.institute },
        { $push: { branches: branch._id } }
      )

      await branch.save()
      // var user = await User.findById(req.user._id)
      // user.branches.push(branch._id)
      // await user.save()
    }
    return res.status(200).send(branch)
  } catch (error) {
    return res.status(500).send(error)
  }
}
deleteBranch = async (req, res) => {
  try {
    const {id} = req.body
    if(!id){return res.status(400).send({error : "Please send the branchId"})}
     await Branch.findByIdAndRemove({ _id : id})
     await User.updateMany({branch : req.body.id},{$unset: { branch: ""}})
     return res.status(200).send()
  } catch (error) {
    return res.status(500).send(error)
  }
}
getBranches = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    if(!branchId){return res.status(400).send({error : "Please send the branchId"})}

  var { branches } = await Institute.findOne({
    branches: branchId
  }).populate('branches')
  // var branches= institute.branches
  return res.status(200).send(branches)
  } catch (error) {
    res.status(500).send("Something wrong")
  }
  
}
getBranch = async (req, res) => {
  try {
    Branch.findOne({ _id: req.params.id }).exec((err, response) => {
      if (err) {
        return res.status(400).send({ message: 'Branch with branchId not found', error : err})
      }

      return res.status(200).send(response)
    })

    //  var branches=
  } catch (error) {
    return res.status(500).send({ message: 'internal server error' })
  }
}
saveClass = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    if(!branchId){return res.status(400).send({message : "Please send the branchId"})}
    var institute = await Institute.findOne({
      branches: branchId
    })

    if (institute) {
      if (req.body.id) {
        let c = institute.classes.find(x => x._id == req.body.id)
        c.name = req.body.name
        c.description = req.body.description,
        c.fees=req.body.fees
        
      } else {
        //var result = await Branch.findOneAndUpdate(

        institute.classes.push({
          name: req.body.name,
          description: req.body.description,
          fees:req.body.fees,
        })
        // { _id: branchId, branchOwners: req.user._id },
        // {
        //   $push: {
        //     classes: {
        //       name: req.body.name,
        //       description: req.body.description
        //     }
        //   }
        //},{ new: true }
        //)
      }
      institute.save()
      return res.status(200).send()
    } else {
      return res.status(401).send('institute id  not find')
    }
  } catch (error) {
    return res.status(500).send({ message: 'server error', error })
  }
}

getClasses = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    if(!branchId){return res.status(400).send({message : "Please send the branchId"})}
    if (branchId) {
      var institute = await Institute.aggregate([
        {$match : {branches : mongoose.Types.ObjectId(branchId)}},
        {$project : { classes: 1 } },
      ])
      var branch = await Branch.aggregate([
        {$match  : {_id : mongoose.Types.ObjectId(branchId)}},
        {$project : {classFees : 1}},
        {$unwind : "$classFees"}
      ])
      var result;
     var instituteNew =  institute[0].classes.map(singleClass => {
         result =   branch.find(m => {        
          return m.classFees.class.toString() == singleClass._id.toString() 
         })
         singleClass.ClassFees = result.classFees.fees
         return singleClass
      })
      return res.status(200).send(instituteNew)
    }else{
      return res.status(400).send({ message: 'bad request' })
    }
  } catch (error) {
    return res.status(500).send({ message: 'server error', error })
  }
}
getClass = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    if(!branchId){return res.status(400).send({message : "Please send the branchId"})}
    var classid = req.params.id
    if(!classid){return res.status(400).send({message : "Please send the classId"})}

    if (branchId) {
      var institute = await Institute.findOne(
        {
          branches: branchId
        },
        { classes: 1 }
      )
      let classs=institute.classes.find(m=>m._id==classid)

      return res.status(200).send(classs);      
    }
  } catch (error) {
    return res.status(500).send({ message: 'server error', error })
  }
}
deleteClass= async (req, res) => {
  try {
    var branchId = req.headers.branchid
    if(!branchId){return res.status(400).send({message : "Please send the branchId"})}

    var classid = req.params.id
    if(!classid){return res.status(400).send({message : "Please send the classId"})}

    if (branchId) {
      var institute = await Institute.updateOne(
        {
          "classes._id": classid
        },
        { $pull:{ classes:{"_id":classid}}}
      )
     
      return res.status(200).send(true);      
    }
  } catch (error) {
    return res.status(500).send({ message: 'server error', error })
  }
}

setClassFees = async (req , res) => {
  try {
     var branchId = req.headers.branchid
    var classId =  req.body.id
    var classFees = req.body.classFees
     var classExist = await Branch.aggregate([
      {$match : {_id : mongoose.Types.ObjectId(branchId)}},
      {$project : {classFees : 1}},
      {$unwind : "$classFees"},
      {$match : {'classFees.class' : mongoose.Types.ObjectId(classId)}}
     ])
     if(classExist && classExist.length ){
      var branch = await Branch.updateOne(
          { _id: branchId },
          {
            $set: {
              'classFees.$[outer].fees': classFees
            }
          },
          {
            arrayFilters: [
              { 'outer.class': classId }
            ]
          },
        )
        return res.status(200).send(branch)
     }else{
       var branch = await Branch.updateOne(
      { _id: branchId },
      {
        $push: {
          classFees: {
            class: classId,
            fees :  classFees,
            
          }
        }
      }
    )
    return res.status(200).send(branch)
     }
  } catch (error) {
    res.status(400).send(error)
  }
}

module.exports = {
  saveBranch,
  deleteBranch,
  getBranches,
  getBranch,
  saveClass,
  getClasses,
  getClass,
  deleteClass,
  setClassFees
}
