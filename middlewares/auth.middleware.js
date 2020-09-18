const jwt = require('jsonwebtoken')
const User = require('../models/user-model')
require('../models/branch-model');

const { ROLE } = require('../models/roles-model')

const auth = function(Role = [ROLE.Basic]) {

    return (req, res, next) => {
        if (req.header('Authorization')) {
            const token = req.header('Authorization').replace('Bearer ', '')
            const data = jwt.verify(token, process.env.JWT_KEY)
            var isAuthorize=false;
            try {
                User.findOne({ _id: data._id, 'tokens.token': token }).populate("branches").exec((err,user) => {

                    if (err) {
                        return res.status(401).send({ error: 'need to sign in again ' })
                    }

                    Role.every(role => {
                        console.log(role, "-");
                        if (user.roles.includes(role)){
                            req.user = user;
                            req.token = token;   
                            isAuthorize=true;                                               
                        }
                    })
                    if(!isAuthorize){
                        return res.status(403).send({ error: 'need to sign in from authorized user' })
                    }
                    next();
                })


            } catch (error) {
               return res.status(500).send({ error: 'Not authorized to access this resource' })
            }
        } else {
            return  res.status(500).send({ error: 'Not authorized to access this resource' })

        }


    }

}
module.exports = auth