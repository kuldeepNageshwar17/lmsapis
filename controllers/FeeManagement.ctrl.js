const mongoose = require('mongoose')
const studentAuth = require('../middlewares/studentAuth.middleware')
const Student = require('../models/student-model')


submitClassFee = async (req , res) => {

    try {
        const studentId = req.user._id
        const feeSubmission = await Student.updateOne({_id : studentId} , {
            $push : {
                submittedFee : {
                    fee : req.body.fee,
                    Date : new Date()
                    
                }
            }
        })
        var studentdata = await Student.findOne({_id :studentId })
        if(studentdata && studentdata.TotalFeeSubmitted){
            const updatestudent  = await Student.updateOne({_id : studentId} , {
                $set : {
                    TotalFeeSubmitted  : studentdata.TotalFeeSubmitted + parseInt(req.body.fee)
                }
            })
            return res.status(200).send("")
        }else{
            const studentdata  = await Student.updateOne({_id : studentId} , {
                $set : {
                    TotalFeeSubmitted  :  req.body.fee
                }
            })
            return res.status(200).send('')
        }
        
        
    } catch (error) {
        return res.status(500).send(error)
    }
}
getOwnFeeDetails = async (req , res) => {
    try {
        const studentId = req.user._id
        const feeDetails = await Student.aggregate([
            {$match : {_id : mongoose.Types.ObjectId(studentId)}},
            {$project : {submittedFee : 1 , TotalFeeSubmitted : 1}},
            {$unwind : "$submittedFee"},
            {$sort : {"submittedFee.Date" : -1}}
        ])
        return res.status(200).send(feeDetails)
    } catch (error) {
        return res.status(500).send(error)
    }
}


GetStudentFeeDetail = async(req , res) => {

    try {
        
        var branchId = req.headers.branchid
        if(!branchId){return res.status(400).send({error : "Please send the branchId"})}

        const studentDetail = await Student.aggregate([
            {$match : { branch : mongoose.Types.ObjectId(branchId)}},
            {$project : { name : 1 , currentBatch : 1 ,TotalFeeSubmitted : 1 , fees : 1,
                Remaining: { $subtract: [ "$fees", "$TotalFeeSubmitted" ] } 
            }},
        ])
  
        return res.status(200).send(studentDetail)
    } catch (error) {
        return res.status(500).send(error)
    }
}








module.exports = {

    //Institute student
    submitClassFee , 
    getOwnFeeDetails,



    //admin /branch

    GetStudentFeeDetail

}
