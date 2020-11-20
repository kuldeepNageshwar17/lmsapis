const express = require('express')
const BranchCtrl = require('../controllers/branch.ctrl')
const auth = require('../middlewares/auth.middleware')
const {ROLE_LABLE } = require('../models/constants')

const router = express.Router()
router.post('/Branch',auth(Object.values(ROLE_LABLE)), BranchCtrl.saveBranch)
router.post('/deleteBranch', BranchCtrl.deleteBranch)
router.get('/Branch',auth(Object.values(ROLE_LABLE)), BranchCtrl.getBranches)
router.get('/Branch/:id',auth(Object.values(ROLE_LABLE)), BranchCtrl.getBranch)

router.post('/class', BranchCtrl.saveClass)
router.get('/classes', BranchCtrl.getClasses)
router.get('/class/:id', BranchCtrl.getClass)
router.get('/class/:id', BranchCtrl.getClass)
router.delete('/class/:id', BranchCtrl.deleteClass)
router.post('/setClassFees' ,auth([ROLE_LABLE.INSTITUTE_LABLE]), BranchCtrl.setClassFees)

module.exports = router