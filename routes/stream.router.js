const express = require('express')
const Stream = require('../controllers/stream.ctrl')
// const auth = require('../middlewares/auth.middleware')
// const {ROLE_LABLE } = require('../models/constants')

const router = express.Router()

router.get('/stream/getvideo/:path', Stream.GetStream)  

module.exports = router