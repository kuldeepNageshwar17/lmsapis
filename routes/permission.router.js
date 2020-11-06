const express = require('express')
const permissionCtrl = require('../controllers/permission.ctrl')
const auth = require('../middlewares/auth.middleware')
const studentAuth = require('../middlewares/studentAuth.middleware')
const {ROLE_LABLE } = require('../models/constants')
const router = express.Router()

// router.get('/getContentType', CourseCtrl.getCourseContentTypes)
//get Roles List
router.get('/roles',auth([ROLE_LABLE.INSTITUTE_LABLE]), permissionCtrl.getRoles)
//Get Modules
router.get('/getModules',permissionCtrl.getPermissionModules)

//get Roles permission to admin permission page 
router.get('/getRolesPermission/:id',auth([ROLE_LABLE.INSTITUTE_LABLE]), permissionCtrl.getRolePermissionsWithRole)






//set permission for 
router.post('/setPermission',auth([ROLE_LABLE.INSTITUTE_LABLE]), permissionCtrl.setPermission)
router.post('/unsetPermission',auth([ROLE_LABLE.INSTITUTE_LABLE]), permissionCtrl.unSetPermission)
// router.get('/getRolesPermission',auth([ROLE_LABLE.INSTITUTE_LABLE]), permissionCtrl.getRolesPermissions)
//  router.get('/getRolePermissions/:id',auth([ROLE_LABLE.INSTITUTE_LABLE]), permissionCtrl.getRoleswithPermission)

//////////////////////////////////////////////////////
/////////////////student Apis
//////////////////////////////////////////////////////

module.exports = router;