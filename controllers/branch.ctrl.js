const mongoose = require('mongoose')
const Branch = require('../models/branch-model')
const User = require('../models/user-model')
const Student = require('../models/student-model')
const Institute = require('../models/institute-model')
const axios = require('axios');

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

  var  branches  = await Institute.aggregate([
    {$match : {branches: mongoose.Types.ObjectId(branchId)}},
    {$project : {branches : 1 , _id : 0}},
    {$lookup : 
      {
        from: 'branches',
        localField: 'branches',
        foreignField: '_id',
        as: 'branches'
       }
    },
    {$unwind : "$branches"},
    {
      $replaceRoot: { newRoot: '$branches' }
    },
    {$match : {"deleted": false}},
    {$project : {name : 1 ,address : 1}}

  ])
  
  
  // .findOne({
  //   branches: branchId
  // }).populate('branches')
  // var branches= institute.branches
  return res.status(200).send(branches)
  } catch (error) {
    return res.status(500).send("Something wrong")
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
      var instituteClasses = await Institute.aggregate([
        {$match : {branches : mongoose.Types.ObjectId(branchId)}},
        {$project : { classes: 1 } },
        {$unwind : "$classes"},
        { $replaceRoot: { newRoot: "$classes" } },
        {$project : {name : 1 , description: 1 ,fees :1}}
      ])
     
     
      return res.status(200).send(instituteClasses)
    }else{
      return res.status(400).send({ message: 'bad request' })
    }
  } catch (error) {
    return res.status(500).send({ message: 'server error', error })
  }
}
getBranchClasses = async (req, res) => {
  try {
    var branchId = req.headers.branchid
    if(!branchId){return res.status(400).send({message : "Please send the branchId"})}
    if (branchId) {
      var institute = await Institute.aggregate([
        {$match : {branches : mongoose.Types.ObjectId(branchId)}},
        {$project : { "classes._id": 1 ,"classes.name": 1  ,"classes.description": 1  , "classes.fees": 1  } },
      ])
      var branch = await Branch.aggregate([
        {$match  : {_id : mongoose.Types.ObjectId(branchId)}},
        {$project : {classesFees : 1}},
        {$unwind : "$classesFees"}
      ])
      var result;
     var instituteNew =  institute[0].classes.map(singleClass => {
         result =   branch.find(m => {        
          return m.classesFees.class.toString() == singleClass._id.toString() 
         })
         if(result){
          singleClass.fees = result.classesFees.fees
         }
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
      var institute = await Institute.aggregate([
        {$match : {branches : mongoose.Types.ObjectId(branchId)}},
        {$project : {classes : 1 , _id : 0}},
        {$unwind : "$classes"},
        {$match : {'classes._id' : mongoose.Types.ObjectId(classid)}},
        {$project : {"classes._id" : 1 , "classes.name": 1,"classes.description":1,"classes.fees": 1}},
        {$replaceRoot : { newRoot: '$classes' }}
      ])
      // .findOne(
      //   {
      //     branches: branchId
      //   },
      //   { classes: 1 }
      // )
      // let classs=institute.classes.find(m=>m._id==classid)

      return res.status(200).send(institute[0]);      
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

setFees = async (req , res) => {
  try {
    const {entityId ,entityName ,  description ,fees,  requestedFees , requestType } =  req.body
     var branchId = req.headers.branchid
     var requestedBy = req.user._id
      var addedChangeRequest = await Institute.updateOne(
        {branches : branchId}
        ,{
           $push: {
             changeRequest : {
               entityId: entityId,
               entityName : entityName ,
               description: description,
               fees : fees ,
               requestedFees: requestedFees,
               requestedBy: requestedBy,
               requestDate : new Date(),
               requestType : requestType
             }
           }
         },
       )
       return res.status(200).send(addedChangeRequest)
     }
   catch (error) {
    return res.status(400).send(error)
  }
}
getRequests = async (req , res) => {
  try {
    var branchId = req.headers.branchid
    const Notifications = await Institute.aggregate([
      {$match : { branches : mongoose.Types.ObjectId(branchId)}},
      {$unwind : "$changeRequest"},
      {$lookup : 
        {
                  from: 'users',
                  localField: 'changeRequest.requestedBy',
                  foreignField: '_id',
                  as: 'changeRequest.requestedBy'
         }
      },
      {$project : {"changeRequest.status" : 1 ,'changeRequest.requestedBy.name' : 1 ,  'changeRequest._id' : 1 , 'changeRequest.requestedFees' : 1
       , 'changeRequest.requestDate' : 1 , 'changeRequest.requestType' : 1 ,'changeRequest.description' : 1 ,
       'changeRequest.entityName': 1 , 'changeRequest.entityId': 1 , 'changeRequest.fees' : 1
      }}
      ,{$sort : {'changeRequest.requestDate' : -1}}
    ])
    return res.status(200).send(Notifications)
  } catch (error) {
    return res.status(500).send(error)
  }
}

handleRequest = async ( req , res) => {
  try {
    var actionBy = req.user._id
    var branchId = req.headers.branchid
    var {status , changeRequestId , entityId , requestedFees , requestType } = req.body
    if(!status || !changeRequestId || !entityId || !requestedFees || !requestType){
      return res.status(400).send("Please send the status , changeRequestId , entityId , requestedFees , requestType")
    }
    var updatedChangeRequest = await Institute.updateOne(
      {branches : branchId},
      {
        $set: {
          'changeRequest.$[i].actionBy': actionBy ,
          'changeRequest.$[i].actionDate' : new Date(),
          'changeRequest.$[i].status' : status
        }
      },
      {
        arrayFilters: [
          { 'i._id': changeRequestId }
        ]
      },
    )
    if(status == "Approved"){
      if(requestType == 'ClassFee'){
        var exist = await Branch.aggregate([
          {$match : {_id : mongoose.Types.ObjectId(branchId)}},
          {$project : { classesFees : 1}},
          {$unwind : "$classesFees"},
          {$match : {"classesFees.class" : mongoose.Types.ObjectId(entityId)}}
        ])
        if(exist && exist.length){
          var branch = await Branch.updateOne(
            { _id: branchId },
            {
              $set: {
                'classesFees.$[i].fees': requestedFees ,
              }
            },
            {
              arrayFilters: [
                { 'i._id': exist[0].classesFees._id }
              ]
            },
          )
          return res.status(200).send(branch)
        } else{

          var branch = await Branch.updateOne(
            { _id: branchId },
            {
              $push: {
                classesFees: {
                  class: entityId,
                  fees :  requestedFees,
                }
              }
            }
          )
          return res.status(200).send(branch)
        }
      }else if(requestType == 'StudentFee'){
        var student = await Student.updateOne(
          { _id: entityId },
          {
            $set: {
              fees: requestedFees,
              updateDate : new Date()
              
            }
          }
        )
        return res.status(200).send(student)
      }
      return res.status(400).send({message : "Please send the correct requestType"})
    }
    return res.status(200).send(updatedChangeRequest)
  } catch (error) {
    return res.status(500).send(error)
  }
}
getPostalAddress = async (req , res) => {
  var pincode =  req.params.pincode
  
  try {
    axios.get(`https://api.postalpincode.in:443/pincode/${pincode}`).then((resp) => {
      
      res.status(200).send(resp.data)
    }).catch((error) => {
      res.status(400).send("Not found ")
    })
    
  } catch (error) {
    return res.status(500).send(error)
  }
}
saveBranchLocation = async(req , res) => {
  try {
    var branchId = req.headers.branchid
    const branch = await Branch.updateOne(
      {_id : branchId} , 
      {$set : {
        "address.location.latitude" : req.body.lat,
        "address.location.longitude" : req.body.lng
      }})
      
    return res.status(200).send(branch)
  } catch (error) {
    return res.status(500).send(error)
  }
}
getBranchLocation = async (req , res) => {
  try {
    var branchId = req.headers.branchid
    const branch = await Branch.aggregate([
      {$match : {_id : mongoose.Types.ObjectId(branchId)}},
      {$project : {'address.location' : 1}},
      {$replaceRoot : {newRoot : '$address'}},
    ])
    return res.status(200).send(branch)
    
  } catch (error) {
    return res.status(500).send(error)
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
  setFees,
  getRequests,
  handleRequest,
  getBranchClasses,
  getPostalAddress,
  saveBranchLocation,
  getBranchLocation
  

}
