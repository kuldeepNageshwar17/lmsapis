const express = require('express')
const settingCtrl = require('../controllers/setting.ctrl')
const auth = require('../middlewares/auth.middleware')
const {ROLE_LABLE } = require('../models/constants')


const router = express.Router()
router.post('/year', settingCtrl.saveYear)
router.post('/AddYear', settingCtrl.addYearToBranch)
router.get('/getBranchYears', settingCtrl.getYearOfBranch)
router.post('/createBatch', settingCtrl.CreteBatch)
router.post('/createRole', settingCtrl.createRole)
router.get('/getBatch/:id', settingCtrl.getBatch)

router.get('/getBatch', settingCtrl.getBatches)

router.get('/getClassesDdr', settingCtrl.GetClassesDdr)
// router.get('/getYearDdr', settingCtrl.GetYearDdr)
module.exports = router