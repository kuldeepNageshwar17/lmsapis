const express = require('express')
const permissionCtrl = require('../controllers/permission.ctrl')
const auth = require('../middlewares/auth.middleware')
const studentAuth = require('../middlewares/studentAuth.middleware')
const {ROLE_LABLE } = require('../models/constants')
const router = express.Router()

// router.get('/getContentType', CourseCtrl.getCourseContentTypes)
    
//set permission for 
router.post('/setPermission',auth([ROLE_LABLE.INSTITUTE_LABLE]), permissionCtrl.setPermission)
router.post('/unsetPermission',auth([ROLE_LABLE.INSTITUTE_LABLE]), permissionCtrl.unSetPermission)
router.get('/roles',auth([ROLE_LABLE.INSTITUTE_LABLE]), permissionCtrl.getRoles)
router.get('/getRolesPermission',auth([ROLE_LABLE.INSTITUTE_LABLE]), permissionCtrl.getRolesPermissions)

//////////////////////////////////////////////////////
/////////////////student Apis
//////////////////////////////////////////////////////

module.exports = router;