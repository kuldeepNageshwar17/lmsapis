const mongoose = require('mongoose')
const User  = require('../models/user-model')


getAllInstructor = async (req, res) => {
    try {
        const insturctor = await User.aggregate([
            {$match : {$and : [{roles : { $in : ['teacher']}} , {isDelete : false}  ]}},
            {$project : {profilePic : 1 , name : 1}}
        ])
        return res.status(200).send(insturctor)
    } catch (error) {
        return res.status(500).send(error)
    }
}

getInstructorDetail = async ( req , res) => {
    try {
        const UserId = req.params.id
        if(!UserId){return res.status(400).send("Please send UserId")}
        const details = await User.aggregate([
            {$match : {_id : mongoose.Types.ObjectId(UserId)}},
            {$project : {email : 1 , name : 1 , mobile : 1 , profilePic : 1}}
        ])
        return res.status(200).send(details)
    } catch (error) {
        return res.status(500).send(error)
    }
}




module.exports = {
    getAllInstructor,
    getInstructorDetail
}