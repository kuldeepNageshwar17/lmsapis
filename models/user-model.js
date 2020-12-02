const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')
// const Role = require("./co")
// const { ROLE } = require('./constants')
require('../models/branch-model');
const User = new Schema({
    name: { type: String,  trim: true , required : true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value =>{
            if (!validator.isEmail(value)) {
                throw new Error({ error: 'Invalid Email address' })
            }
        }
    },
    mobile: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    username: { type: String },
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    roles: [{type:String,required: true}],
    isActive: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: 0 },
    branch:
        {
            type: mongoose.Schema.Types.ObjectId ,
            ref: 'branch',
            required: true            
        },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, { timestamps: true })

User.pre('save', async function(next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

User.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

User.statics.findByCredentials = async function(email, password) {
    // Search for a user by email and password.
    const user = await this.findOne({ email }).populate("branch");
    if (!user) {
        return user;
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login password' })
    }
    return user
}
module.exports = mongoose.model('user', User)