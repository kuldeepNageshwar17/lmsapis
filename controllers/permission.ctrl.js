const mongoose = require('mongoose')
const Modules = require('../models/permissionModules')
const Institute = require('../models/institute-model')

getRoles = async (req, res) => {
  try {
    let branchId = req.headers.branchid
    var institute = await Institute.aggregate([
      {
        $match: {
          branches: mongoose.Types.ObjectId(branchId)
        }
      },
      { $unwind: '$roles' },
      { $match: { 'roles.show': true } },
      { $replaceRoot: { newRoot: '$roles' } }
    ])
    return res.status(200).send(institute)
  } catch (error) {
    return res.status(500).send(error)
  }
  //   var institute = await Institute.aggregate([{$match: { branches: mongoose.Types.ObjectId(branchId) } }, {}])
}
setPermission = async (req, res) => {
  try {
    var module = req.body.module
    var newPermission = req.body.permission
    var roleId = req.body.id
    var permission = []
    let branchId = req.headers.branchid
    var institute = await Institute.aggregate([
      { $match: { branches: mongoose.Types.ObjectId(branchId) } },
      { $unwind: '$roles' },
      { $match: { 'roles.id': roleId } },
      { $unwind: '$roles.permissions' },
      { $project: { roles: 1 } },
      { $match: { 'roles.permissions.module': module } },
      { $match: { 'roles.permissions.permission': newPermission } },
      { $project: { 'roles.permissions': 1 } }
    ])
    if (!institute.length) {
      var updateresult = await Institute.updateOne(
        { branches: branchId },
        {
          $push: {
            'roles.$[role].permissions': {
              module: module,
              permission: newPermission
            }
          }
        },
        {
          arrayFilters: [{ 'role.id': roleId }]
        }
      )
    }
    return res.status(200).send(' success ')
  } catch (error) {
    return res.status(500).send(' failes ')
  }
}

unSetPermission = async (req, res) => {
  try {
    let branchId = req.headers.branchid
    var module = req.body.module
    var newPermission = req.body.permission
    var roleId = req.body.id

    var institute = await Institute.updateOne(
      { branches: branchId },
      {
        $pull: {
          'roles.$[ele].permissions': {
           
              module: module,
              permission: newPermission
            
          }
        }
      },
      {
        arrayFilters: [{ 'ele.id':roleId }]
      }
    )
    return res.status(200).send(institute)
  } catch (error) {
    return res.status(500).send(institute)
  }
}

getRolesPermissions = async (req, res) => {
  try {
    let branchId = req.headers.branchid
    let role = req.body.role
    var rolePermissions = await Institute.aggregate([
      {
        $match: {
          branches: mongoose.Types.ObjectId(branchId)
        }
      },
      { $unwind: '$roles' },
      {
        $replaceRoot: { newRoot: '$roles' }
      },
      { $match: { id: role } },
      { $unwind: '$permissions' },
      {
        $replaceRoot: { newRoot: '$permissions' }
      },
      // {
      //   $group: {
      //     _id: '$module',
      //     count: { $sum: '$permission' }
      //   }
      // }
    ])
    if (!rolePermissions || !rolePermissions.length)
      return res.status(404).send('not Found')
    rolePermissions.forEach(element => {
      element.module = Object.keys(Modules).find(
        k => Modules[k] === element._id
      )
    })

    return res.status(200).send(rolePermissions)
  } catch (error) {
    return res.status(500).send('server Error')
  }
  //   var institute = await Institute.aggregate([{$match: { branches: mongoose.Types.ObjectId(branchId) } }, {}])
}

//Single roles permission
getRolePermissionsWithRole = async (req, res) => {
  try {
    let branchId = req.headers.branchid
    let role = req.params.id

    let Role = await Institute.aggregate([
      {
        $match: {
          branches: mongoose.Types.ObjectId(branchId)
        }
      },
      { $unwind: '$roles' },
      {
        $replaceRoot: { newRoot: '$roles' }
      },
      { $match: { id: role }},
      {$project:{permissions:1,name:1,type:1}}
    ])
    return res.status(200).send(Role)
    // var rolePermissions = await Institute.aggregate([
    //   {
    //     $match: {
    //       branches: mongoose.Types.ObjectId(branchId)
    //     }
    //   },
    //   { $unwind: '$roles' },
    //   {
    //     $replaceRoot: { newRoot: '$roles' }
    //   },
    //   { $match: { id: role } },
    //   { $unwind: '$permissions' },
    //   {
    //     $replaceRoot: { newRoot: '$permissions' }
    //   }
    //   {
    //     $group: {
    //       _id: '$module',
    //       count: { $sum: '$permission' }
    //     }
    //   }
    // ])
    // if (!rolePermissions || !rolePermissions.length)
    //   return res.status(404).send('not Found')
    // rolePermissions.forEach(element => {
    //   element.module = Object.keys(Modules).find(
    //     k => Modules[k] === element._id
    //   )
    // })
    // return res.status(200).send(rolePermissions)
  } catch (error) {
    return res.status(500).send(error)
  }
  //   var institute = await Institute.aggregate([{$match: { branches: mongoose.Types.ObjectId(branchId) } }, {}])
}

//get Permission Modules
getPermissionModules = async (req, res) => {
  var result = Object.keys(Modules).map(function (key) {
    // Using Number() to convert key to number type
    // Using obj[key] to retrieve key value
    return { module: key, id: Modules[key] }
  })
  return res.status(200).send(result)
}
module.exports = {
  setPermission,
  unSetPermission,
  getRoles,
  getRolesPermissions,
  getRolePermissionsWithRole,
  getPermissionModules
}
