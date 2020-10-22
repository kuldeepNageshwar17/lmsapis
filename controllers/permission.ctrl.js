const mongoose = require('mongoose')
const Modules = require('../models/permissionModules')
const Institute = require('../models/institute-model')

getRoles = async (req, res) => {
  try {
    let branchId = req.headers.branchid
    var institute = await Institute.aggregate([
      {
        $match: {
          branches: mongoose.Types.ObjectId('5f7870c6b793b909f862f56d')
        }
      },
      { $unwind: '$roles' },
      { $match: { 'roles.show': true } },
      { $replaceRoot: { newRoot: '$roles' } }
    ])
    return res.status(200).send(institute)
  } catch (error) {
    return res.status(500).send(' fail ')
  }
  //   var institute = await Institute.aggregate([{$match: { branches: mongoose.Types.ObjectId(branchId) } }, {}])
}
setPermission = async (req, res) => {
  try {
    var module = Modules[req.body.module]
    var newPermission = req.body.permission
    var permission = []
    let branchId = req.headers.branchid
    var institute = await Institute.aggregate([
      { $match: { branches: mongoose.Types.ObjectId(branchId) } },
      { $unwind: '$roles' },
      { $match: { 'roles._id': mongoose.Types.ObjectId(req.body.role) } },
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
          arrayFilters: [{ 'role._id': mongoose.Types.ObjectId(req.body.role) }]
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
    var module = Modules[req.body.module]
    var newPermission = req.body.permission
    var institute = await Institute.update(
      { branches: branchId },
      {
        $pull: {
          'roles.$[role].permissions': {
            $elemMatch: {
              module: module,
              permission: newPermission
            }
          }
        }
      },
      {
        arrayFilters: [{ 'role._id': mongoose.Types.ObjectId(req.body.role) }]
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
      { $match: { _id: mongoose.Types.ObjectId(role) } },
      { $unwind: '$permissions' },
      {
        $replaceRoot: { newRoot: '$permissions' }
      },
      {
        $group: {
          _id: '$module',
          count: { $sum: '$permission' }
        }
      }
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

module.exports = {
  setPermission,
  unSetPermission,
  getRoles,
  getRolesPermissions
}
