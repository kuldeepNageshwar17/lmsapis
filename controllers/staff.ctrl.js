const Branch = require('../models/branch-model')
const mongoose = require('mongoose')

var path = require('path')
const { response } = require('express')
createUser = async(req, res) => {
    try {
        const user = new User(req.body)
        // var branch= await Branch.find({});        
        // user.branches=[branch[0]._id];
        user.roles = [ROLE.Basic]
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
}