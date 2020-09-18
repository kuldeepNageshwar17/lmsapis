const express = require('express')
const BranchCtrl = require('../controllers/setting.ctrl')
const auth = require('../middlewares/auth.middleware')
const {ROLE_LABLE } = require('../models/constants')


const router = express.Router()
router.post('/year', BranchCtrl.saveYear)
router.post('/AddYear', BranchCtrl.addYearToBranch)
router.get('/getBranchYears', BranchCtrl.getYearOfBranch)
router.post('/createBatch', BranchCtrl.CreteBatch)
router.get('/getBatch/:id', BranchCtrl.getBatch)

router.get('/getBatch', BranchCtrl.getBatches)

router.get('/getBranchClassddr', BranchCtrl.GetBranchClassesDdr)
router.get('/getBranchYearDdr', BranchCtrl.GetBranchYearDdr)
module.exports = router