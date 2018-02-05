let Utils = require('./Utils.js')
let domainKey = 'localhost'
let protocol = 'https'
if (process.env['domainKey'] !== undefined && process.env['domainKey'] !== '') {
  domainKey = process.env['domainKey']
}

const timeouts = {
  'checkResourcePermission': 0,
  'getUserPackage': 7200,
  'getRegisterRole': 86400,
  'getUserSubscription': 86400,
  'getSiteInfo': 7200
}

if (process.env['NODE_ENV'] !== 'production') {
  protocol = 'http'
}

let defaultConfig = {
  'subscriptionURL': '/subscriptionlist',
  'userDetailURL': protocol + '://api.' + domainKey + '/auth/api/userdetails',
  'registerModuleURL': protocol + '://api.' + domainKey + '/subscription/register-resource',
  'registerRoleURL': protocol + '://api.' + domainKey + '/subscription/register-roles',
  // 'registerRoleURL':   'http://localhost:3030/register-roles',
  'userSubscriptionURL': protocol + '://api.' + domainKey + '/subscription/user-subscription',
  'userSiteURL': protocol + '://api.' + domainKey + '/serverapi/project-configuration',
  'resourcePermissionURL': protocol + '://api.' + domainKey + '/authldap/getpermission'
}

let subscriptionURL = defaultConfig['subscriptionURL']
let userDetailURL = defaultConfig['userDetailURL']
let registerModuleURL = defaultConfig['registerModuleURL']
let registerRoleURL = defaultConfig['registerRoleURL']
let userSubscription = defaultConfig['userSubscriptionURL']
let userSiteURL = defaultConfig['userSiteURL']
let resourcePermissionURL = defaultConfig['resourcePermissionURL']

// if (process.env['subscriptionURL'] !== undefined && process.env['subscriptionURL'] !== '') {
//   subscriptionURL = process.env['subscriptionURL']
// }
// if (process.env['userDetailURL'] !== undefined && process.env['userDetailURL'] !== '') {
//   userDetailURL = process.env['userDetailURL']
// }
// if (process.env['registerModuleURL'] !== undefined && process.env['registerModuleURL'] !== '') {
//   registerModuleURL = process.env['registerModuleURL']
// }
// if (process.env['registerRoleURL'] !== undefined && process.env['registerRoleURL'] !== '') {
//   registerRoleURL = process.env['registerRoleURL']
// }
// if (process.env['userSubscription'] !== undefined && process.env['userSubscription'] !== '') {
//   userSubscription = process.env['userSubscription']
// }

let userArr = []
// console.log(userArr)
let moduleResource = {
  'moduleName': '',
  'registerAppModule': '',
  'appRoles': ['Admin'],
  'registerdIds': {},
  'registerdRoleIds': {}
}

module.exports.moduleResource = moduleResource

let secureService = {
  validate: (route, params, secureRouteInfo, userDetail) => {
    return new Promise((resolve, reject) => {
      resolve(false)
    })
  }
}
module.exports.secureService = secureService

/*
  this method for validate authToken if valid then it return user details otherwise return false
*/
let isValidAuthToken = async (authToken) => {
  return new Promise(async (resolve, reject) => {
    let userDetail = await getUserPackage(authToken)
    if (userDetail !== undefined && userDetail !== null) {
      resolve(userDetail)
    }
    resolve(false)
  })
}


let getUserPackage = async function (authorization) {
  return new Promise(async (resolve, reject) => {
    let KeyValue = userDetailURL + authorization
    var options = {
      uri: userDetailURL,
      headers: {
        'authorization': authorization
      }
    }
    let userDetail = await Utils.CachedRP(options, {key: KeyValue, timeout: timeouts['getUserPackage']})
    // console.log(userDetail)
    resolve(JSON.parse(userDetail))
  })
}

async function registeredAppModulesRole () {
  // console.log('==================moduleName========', moduleResource.moduleName)
  if (moduleResource.moduleName === '') {
    console.log('Please enter module name')
    process.exit()
  }
  // console.log('==================moduleName========', moduleResource.registerAppModule)
  if (Object.keys(moduleResource.registerAppModule).length === 0) {
    console.log('Please register your modules in "registerAppModule"')
    process.exit()
  }
  for (let resourceName in moduleResource.registerAppModule) {
    let newActionValue = {}
    let actionValue = moduleResource.registerAppModule[resourceName]
    for (let actionKey in actionValue) {
      if (typeof parseInt(actionKey) === 'number') {
        newActionValue[actionValue[actionKey]] = actionValue[actionKey]
      } else {
        newActionValue[actionKey] = actionValue[actionKey]
      }
    }
    let resourceData = await registerToMainService(moduleResource.moduleName, resourceName, newActionValue)
    moduleResource.registerdIds[resourceName] = resourceData.id
  }

  if (moduleResource.appRoles === undefined || moduleResource.appRoles.length === 0) {
    console.log('Please register your role in "registerAppModule"')
    process.exit()
  }
  await registerToMainRole(moduleResource.moduleName, moduleResource.appRoles)
  for (let rolekey in moduleResource.appRoles) {
    let roleId = await getRegisterRole(moduleResource.moduleName, moduleResource.appRoles[rolekey])
    moduleResource.registerdRoleIds[moduleResource.appRoles[rolekey].toLowerCase()] = roleId['data'][0].id
  }
  // console.log("registed Ids=", moduleResource.registerdIds)
  // console.log("registed role Ids=", moduleResource.registerdRoleIds)
}
module.exports.registeredAppModulesRole = registeredAppModulesRole

async function registerToMainService (modulename, resource, actions, authorization) {
  return new Promise(async (resolve, reject) => {
    let KeyValue = registerModuleURL + modulename + resource + actions + authorization
    var options = {
      method: 'post',
      uri: registerModuleURL,
      body: {
        'module': modulename,
        'service': resource,
        'actions': [actions]
      },
      json: true
      // headers: {
      //   'authorization': authorization
      // }
    }
    let resourceDetail = await Utils.CachedRP(options, {key: KeyValue, timeout: 0})
    resolve(resourceDetail)
  })
}

async function registerToMainRole (modulename, roles, authorization) {
  return new Promise(async (resolve, reject) => {
    let KeyValue = registerRoleURL
    var options = {
      method: 'post',
      uri: registerRoleURL,
      body: {
        'module': modulename,
        'roles': roles
      },
      json: true
      // headers: {
      //   'authorization': authorization
      // }
    }
    let resourceRole = await Utils.CachedRP(options, {key: KeyValue, timeout: 0})
    resolve(resourceRole)
  })
}

async function getRegisterRole (modulename, roles, authorization) {
  return new Promise(async (resolve, reject) => {
    let KeyValue = registerRoleURL + '?module=' + modulename + '&role=' + roles.toLowerCase()
    var options = {
      method: 'get',
      uri: registerRoleURL + '?module=' + modulename + '&role=' + roles.toLowerCase()
      // headers: {
      //   'authorization': authorization
      // }
    }
    let resourceRole = await Utils.CachedRP(options, {key: KeyValue, timeout: timeouts['getRegisterRole']})
    resolve(JSON.parse(resourceRole))
  })
}
// console.log("=============2111=======")
// // registeredAppModules()
// console.log("=============2333=======")

module.exports.getUserSubscription = async function (subscriptionId) {
  return new Promise(async (resolve, reject) => {
    if (subscriptionId === undefined || subscriptionId === '') resolve(null)
    let KeyValue = userSubscription + '/' + subscriptionId
    let options = {
      method: 'get',
      uri: userSubscription + '/' + subscriptionId
      // headers: {
      //   'authorization': authorization
      // }
    }
    let subscriptionData = await Utils.CachedRP(options, {key: KeyValue, timeout: timeouts['getUserSubscription']})
    resolve(JSON.parse(subscriptionData))
  })
}

// =============================feather Subscription=========================================
let commonActionValidation = async (context) => {
  const errors = require('@feathersjs/errors');
  try {
    const subscription = require('flowz-subscription')
    console.log('==================Subscription Start==============')
    let subscriptionId = ''
    let userDetails = ''
    if (context.params.headers.subscriptionid) {
      // console.log('==called direct subscription=>')
      subscriptionId = context.params.headers.subscriptionid
    } else if (context.params.headers.siteid) {
      // get if from website settings
      console.log('==called site wise subscription=>')
      let siteDetails = await subscription.getSiteInfo(context.params.headers.siteid)
      subscriptionId = siteDetails && siteDetails.subscriptionId !== undefined ? siteDetails.subscriptionId : ''
    } else if (context.params.userPackageDetails) {
      // get if from website settings
      userDetails = context.params.userPackageDetails
      if (userDetails.defaultSubscriptionId) {
        subscriptionId = userDetails.defaultSubscriptionId
      }
    }
    console.log('=============subscriptionId=', subscriptionId)
    let userSubscriptionDetails = await subscription.getUserSubscription(subscriptionId)
    // console.log('=============userSubscriptionDetails=', userSubscriptionDetails)
    // check subscription plan expired or not
    if (userSubscriptionDetails && subscription.isPlanExpired(userSubscriptionDetails.expiredOn) === true) {
      context.result = {status: 403, message: 'subscription package expired'}
      throw new errors.Forbidden('subscription package expired')
      // return context
    }

    let moduleName = context.params.moduleName
    let userRole = subscription.getUserRole(context, subscriptionId)
    console.log('=============userRole=', userRole)
    if (await subscription.isUserHasActionPermission(context, userRole) === false) {
      context.result = {status: 403, message: 'Access denied for action'}
      throw new errors.Forbidden('Permission not available for action')
      // return context
    }

    if (userSubscriptionDetails && userSubscriptionDetails.details !== undefined) {
      console.log('=============userSubscriptionDetails.details=', userSubscriptionDetails.details)
      let userPackageDetails = userSubscriptionDetails.details
      let serviceName = context.path
      if (userPackageDetails[moduleName]) {
        if (userPackageDetails[moduleName][serviceName] !== undefined &&
            userPackageDetails[moduleName][serviceName][context.method] !== undefined) {
          let data = await context.service.find({
            query: {'subscriptionId': subscriptionId}
          })
          if (data.total !== undefined &&
            data.total > userPackageDetails[moduleName][serviceName][context.method]) {
            throw new errors.Forbidden('Access denied, your subscription limit over')
            // context.result = {status: 403, message: 'Access denied, your subscription limit over'}
            // return context
          } else {
            return context
          }
        }
      }
    } else {
      context.result = {status: 403, message: 'Access denied, please contact to administrator'}
      throw new errors.Forbidden('Access denied, please contact to administrator')
    }
    return context
  } catch (e) {
    if (e.name === 'Forbidden') throw e
    context.result = {status: 403, message: e.message}
    return context
  }
}
// find: get: create: update: patch: remove:
let actionValidation = {
  'create': commonActionValidation,
  'remove': commonActionValidation
  // "remove": () => {},
}

module.exports.getSiteInfo = async function (siteId) {
  return new Promise(async (resolve, reject) => {
    let KeyValue = userSiteURL + '/' + siteId
    var options = {
      method: 'get',
      uri: userSiteURL + '/' + siteId
      // headers: {
      //   'authorization': authorization
      // }
    }
    let getSiteData = await Utils.CachedRP(options, {key: KeyValue, timeout: timeouts['getSiteInfo']})
    resolve(JSON.parse(getSiteData))
  })
}

let isPlanExpired = (expiryDate) => {
  let expiryDateObj = new Date((new Date(expiryDate)))
  if (expiryDateObj < new Date((new Date()).toGMTString())) {
    return true
  }
  return false
}
module.exports.isPlanExpired = isPlanExpired

let getUserRole = (context, subscriptionId) => {
  const AnonymousRole = 'anonymous'
  const LoggedInUserRole = 'loggedin'
  const AdminRole = 'admin'
  const SuperAdminRole = 'superadmin'
  try {
    let moduleName = context.params.moduleName
    if (context.params.userPackageDetails) {
      if (context.params.userPackageDetails.package &&
      context.params.userPackageDetails.package[subscriptionId]) {
        let subscriptionPack = context.params.userPackageDetails.package[subscriptionId]
        if (subscriptionPack['role'][moduleName]) {
          // for assign users
          return subscriptionPack['role'][moduleName]
        } else if (subscriptionPack['role'] === AdminRole || subscriptionPack['role'] === SuperAdminRole) {
          // for admin or super-admin
          return subscriptionPack['role']
        }
      }
      // no subscription but logged-in user
      return LoggedInUserRole
    }
    return AnonymousRole
  } catch (e) {
    return AnonymousRole
  }
}
module.exports.getUserRole = getUserRole

let isUserHasActionPermission = async (context, userRole) => {
  try {
    let serviceName = context.path
    let resourceIds = context.params.resourceIds
    let registerdRoleIds = context.params.registerdRoleIds

    let roleId = registerdRoleIds[userRole] ? registerdRoleIds[userRole] : 'Anonymous'
    userRole = userRole.toLowerCase()
    let resourcePermission = await checkResourcePermission(resourceIds[serviceName] + '_' + context.method, 'global', roleId)

    // console.log('=============resourcePermission=', resourcePermission)
    if (resourcePermission['data'] && resourcePermission['data']['accessValue'] > 0) {
      return true
    }
    return false
  } catch (e) {
    return false
  }
}
module.exports.isUserHasActionPermission = isUserHasActionPermission

let checkResourcePermission = async function (resourceId, tasktype, roleId) {
  return new Promise(async (resolve, reject) => {
    let KeyValue = resourcePermissionURL + '/' + moduleResource.moduleName + '/' + tasktype + '/' + roleId + '/' + resourceId
    var options = {
      method: 'get',
      uri: resourcePermissionURL + '/' + moduleResource.moduleName + '/' + tasktype + '/' + roleId + '/' + resourceId
      // headers: {
      //   'authorization': authorization
      // }
    }
    // console.log("==================" + KeyValue + "==============")
    let resourcePermission = await Utils.CachedRP(options, {key: KeyValue, timeout: timeouts['checkResourcePermission']})
    resolve(JSON.parse(resourcePermission))
  })
}
module.exports.checkResourcePermission = checkResourcePermission

// =========================================================================================
module.exports.featherSubscription = async function (req, res, next) {
  if (req.feathers === undefined) {
    req.feathers = {}
  }
  req.feathers.moduleName = moduleResource.moduleName
  req.feathers.resourceIds = moduleResource.registerdIds
  req.feathers.registerdRoleIds = moduleResource.registerdRoleIds
  req.feathers.headers = req.headers
  if (req.headers.authorization !== undefined) {
    let userDetail = await isValidAuthToken(req.headers.authorization)
    if (userDetail !== false) {
      req.feathers.userPackageDetails = userDetail.data
      return next()
    }
  }
  next()
}

let registerDynamicHooks = (appObj, registerModules) => {
  // service available
  if (Object.keys(registerModules).length > 0) {
    for (let valIdx in registerModules) {
      // action available
      if (registerModules[valIdx].length > 0) {
        registerModules[valIdx].forEach((actionVal) => {
          // console.log("======", valIdx, "=======", actionVal,"=======",actionValidation[actionVal])
          if (appObj.service(valIdx) !== undefined && actionValidation[actionVal] !== undefined && typeof actionValidation[actionVal] === 'function') {
            let objHook = {
              before: {
                [actionVal]: actionValidation[actionVal]
              }
            }
            appObj.service(valIdx).hooks(objHook)
          }
        })
      }
    }
  }
}

module.exports.commonActionValidation = commonActionValidation
module.exports.actionValidation = actionValidation
module.exports.registerDynamicHooks = registerDynamicHooks
