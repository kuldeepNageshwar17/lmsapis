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
router.get('/getBranchClasses', BranchCtrl.getBranchClasses)
router.get('/class/:id', BranchCtrl.getClass)
router.get('/class/:id', BranchCtrl.getClass)
router.delete('/class/:id', BranchCtrl.deleteClass)
router.post('/setFees' ,auth([ROLE_LABLE.BRANCH_LABLE]), BranchCtrl.setFees)
router.get("/getRequests",auth([ROLE_LABLE.BRANCH_LABLE]) , BranchCtrl.getRequests)
router.post('/handleRequest',auth([ROLE_LABLE.INSTITUTE_LABLE]) , BranchCtrl.handleRequest )

module.exports = router