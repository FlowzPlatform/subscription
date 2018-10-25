let Utils = require('./Utils.js')
let domainKey = 'localhost'
let protocol = 'https'
let socketPort = 4042
let userSocketPort = 4043
if (process.env['domainKey'] !== undefined && process.env['domainKey'] !== '') {
  domainKey = process.env['domainKey']
}


const timeouts = {
  'checkResourcePermission': 0,
  'chechUserToken': 7200,
  'getUserPackage': 86400,
  'getRegisterRole': 86400,
  'getRegisterResource': 86400,
  'getUserSubscription': 7200,
  'getSiteInfo': 7200
}

if (process.env['NODE_ENV'] !== 'production') {
  protocol = 'https'
}
// protocol = 'http'

let defaultConfig = {
  'subscriptionURL': '/subscriptionlist',
  'checkUserToken': protocol + '://api.' + domainKey + '/auth/api/validatetoken',
  'userDetailURL': protocol + '://api.' + domainKey + '/auth/api/userdetails',
  'registerModuleURL': protocol + '://api.' + domainKey + '/subscription/register-resource',
  // 'registerModuleURL': 'http://localhost:3030/register-resource',
  'registerRoleURL': protocol + '://api.' + domainKey + '/subscription/register-roles',
  // 'registerRoleURL':   'http://localhost:3030/register-roles',
  'userSubscriptionURL': protocol + '://api.' + domainKey + '/subscription/user-subscription',
  'userSiteURL': protocol + '://api.' + domainKey + '/serverapi/project-configuration',
  'resourcePermissionURL': protocol + '://api.' + domainKey + '/authldap/getpermission'
}

var socket = require('socket.io-client')(`https://api.${domainKey}:${socketPort}`);

var userSocket = require('socket.io-client')(`https://api.${domainKey}:${userSocketPort}`);

let cacheRoleResource = {};
socket.on('connect', function(){});
socket.on('permissionChanged', function(data){
  let cacheKey = `${data.app}_${data.taskType}_${data.roleId}_${data.resourceId}`;
  delete cacheRoleResource[cacheKey];
});

let cacheUser = {};
userSocket.on('connect', function(){});
userSocket.on('updateduserdetails', function(data) {
  let cacheKey = `${data._id}`;
  delete cacheUser[cacheKey];
});

let subscriptionURL = defaultConfig['subscriptionURL']
let userDetailURL = defaultConfig['userDetailURL']
let checkUserToken = defaultConfig['checkUserToken']
let registerModuleURL = defaultConfig['registerModuleURL']
let registerRoleURL = defaultConfig['registerRoleURL']
let userSubscription = defaultConfig['userSubscriptionURL']
let userSiteURL = defaultConfig['userSiteURL']
let resourcePermissionURL = defaultConfig['resourcePermissionURL']

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
    let KeyValue = checkUserToken + authorization
    var options = {
      uri: checkUserToken,
      method: 'post',
      headers: {
        'authorization': authorization
      }
    }
    let userTokenDetail = await Utils.CachedRP(options, {key: KeyValue, timeout: timeouts['chechUserToken']})
    if(!userTokenDetail) {
      resolve(null)
      return
    }
    userTokenDetail = JSON.parse(userTokenDetail)
    let userDetails = getUserDetails(authorization, userTokenDetail.id)
    resolve(userDetails)
  })
}

let getUserDetails = async function (authorization, userId) {
  return new Promise(async (resolve, reject) => {
    let cacheKey = `${userId}`;
    if(cacheUser[cacheKey]) {
      resolve(cacheUser[cacheKey])
    } else {
      let KeyValue = userDetailURL + authorization
      var options = {
        uri: userDetailURL,
        headers: {
          'authorization': authorization
        }
      }
      let userDetail = await Utils.CachedRP(options, {key: KeyValue, timeout: timeouts['userDetailURL']})
      if(!userDetail) {
        resolve(null)
      }
      cacheUser[cacheKey] = JSON.parse(userDetail)
      resolve(cacheUser[cacheKey])
    }
  })
}

async function registeredAppModulesRole (isWebSite = false) {
  // console.log('==================moduleName========', moduleResource.moduleName)
  if (this.moduleResource.moduleName === '') {
    console.log('Please enter module name')
    if (isWebSite) process.exit()
  }
  // console.log('==================moduleName========', moduleResource.registerAppModule)
  if (Object.keys(this.moduleResource.registerAppModule).length === 0) {
    console.log('Please register your modules in "registerAppModule"')
    if (isWebSite) process.exit()
  }
  await registerToMainService(this.moduleResource.moduleName, this.moduleResource.registerAppModule)
  let resourceData = await getAllRegisterResource(this.moduleResource.moduleName)
  if (resourceData.data.length === 0) {
    console.log('Please register your modules in "registerAppModule"')
    if (isWebSite) process.exit()
  }
  resourceData = resourceData.data
  for (let resourceName in resourceData) {
    this.moduleResource.registerdIds[resourceData[resourceName]['service']] = resourceData[resourceName]['id']
  }

  if (this.moduleResource.appRoles === undefined || this.moduleResource.appRoles.length === 0) {
    console.log('Please register your role in "registerAppModule"')
    if (isWebSite) process.exit()
  }
  await registerToMainRole(this.moduleResource.moduleName, this.moduleResource.appRoles)
  for (let rolekey in this.moduleResource.appRoles) {
    let roleId = await getRegisterRole(this.moduleResource.moduleName, this.moduleResource.appRoles[rolekey])
    this.moduleResource.registerdRoleIds[this.moduleResource.appRoles[rolekey].toLowerCase()] = roleId['data'][0].id
  }
  // console.log("registed Ids=", this.moduleResource.registerdIds)
  // console.log("registed role Ids=", this.moduleResource.registerdRoleIds)
}
module.exports.registeredAppModulesRole = registeredAppModulesRole

async function registerToMainService (modulename, resource) {
  return new Promise(async (resolve, reject) => {
    let KeyValue = registerModuleURL + modulename + resource
    var options = {
      method: 'post',
      uri: registerModuleURL,
      body: {
        'module': modulename,
        'services': resource
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

async function getRegisterResource (modulename, resource, authorization) {
  return new Promise(async (resolve, reject) => {
    let KeyValue = registerModuleURL + '?module=' + modulename + '&service=' + resource.toLowerCase()
    var options = {
      method: 'get',
      uri: registerModuleURL + '?module=' + modulename + '&service=' + resource.toLowerCase()
      // headers: {
      //   'authorization': authorization
      // }
    }
    let resourceRole = await Utils.CachedRP(options, {key: KeyValue, timeout: timeouts['getRegisterResource']})
    resolve(JSON.parse(resourceRole))
  })
}

async function getAllRegisterResource (modulename, authorization) {
  return new Promise(async (resolve, reject) => {
    let KeyValue = registerModuleURL + '?module=' + modulename
    var options = {
      method: 'get',
      uri: registerModuleURL + '?module=' + modulename
      // headers: {
      //   'authorization': authorization
      // }
    }
    let resourceRole = await Utils.CachedRP(options, {key: KeyValue, timeout: 0})
    resolve(JSON.parse(resourceRole))
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
  // console.log('==================Subscription Start=============11111=')
  const errors = require('@feathersjs/errors');
  try {
    const subscription = require('flowz-subscription')
    console.log('==================Subscription Start==============')
    let subscriptionId = ''
    let userDetails = ''
    let isSite = false
    if (context.params.headers.subscriptionid) {
      // console.log('==called direct subscription=>')
      subscriptionId = context.params.headers.subscriptionid
    } else if (context.params.headers.siteid) {
      // get if from website settings
      console.log('==called site wise subscription=>')
      let siteDetails = await subscription.getSiteInfo(context.params.headers.siteid)
      subscriptionId = siteDetails && siteDetails.subscriptionId !== undefined ? siteDetails.subscriptionId : ''
      isSite = context.params.headers.siteid
      console.log('==called site wise subscription=>',isSite)
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
      throw new errors.Forbidden('subscription package expired', {errorCode: 'ERR-SUBSCRIPTION-EXPIRED'})
      // return context
    }

    if(context.method !== 'remove') {
      context.data['subscriptionOwnerId'] = userSubscriptionDetails.userId;
      context.data['subscriptionId'] = subscriptionId;
      context.data['userId'] = context.params.userPackageDetails._id;
    }


    let moduleId = false
    if(context.params.headers.workflowid) {
      moduleId = context.params.headers.workflowid
    }

    let moduleName = context.params.moduleName
    let userRole = subscription.getUserRole(context, subscriptionId, moduleId)

    console.log('=============userRole=', userRole)
    if (userRole !== 'superadmin' && await subscription.isUserHasActionPermission(context, userRole, isSite, moduleId) === false) {
      context.result = {status: 403, message: 'Access denied for action'}
      throw new errors.Forbidden('Permission not available for action', {errorCode: 'ERR-PERMISSION'})
      // return context
    }

    if (userSubscriptionDetails && userSubscriptionDetails.details !== undefined) {
      // console.log('=============userSubscriptionDetails.details=', userSubscriptionDetails.details)
      let userPackageDetails = userSubscriptionDetails.details
      let serviceName = context.path
      if (userPackageDetails[moduleName]) {
        if (userPackageDetails[moduleName][serviceName] !== undefined &&
            userPackageDetails[moduleName][serviceName][context.method] !== undefined) {
          let findObj = {
            query: {'subscriptionId': subscriptionId}
          }
          if (isSite !== false) {
            findObj.query.siteId = context.params.headers.siteid
          }
          // console.log('=============find Obj==', findObj)
          let data = await context.service.find(findObj)
          if (data.total !== undefined &&
            data.total >= userPackageDetails[moduleName][serviceName][context.method]) {
            throw new errors.Forbidden('Access denied, your subscription limit over', {errorCode: 'ERR-LIMIT-OVER'})
            // context.result = {status: 403, message: 'Access denied, your subscription limit over'}
            // return context
          } else {
            return context
          }
        }
      }
    } else {
      context.result = {status: 403, message: 'Access denied, please contact to administrator'}
      throw new errors.Forbidden('Access denied, please contact to administrator', {errorCode: 'ERR-NO-SUBSCRIPTION'})
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
  'remove': commonActionValidation,
  'find': commonActionValidation,
  'update': commonActionValidation,
  'patch': commonActionValidation,
  'get': commonActionValidation
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

let getUserRole = (context, subscriptionId, moduleId) => {
  const AnonymousRole = 'anonymous'
  const LoggedInUserRole = 'registered'
  const AdminRole = 'admin'
  const SuperAdminRole = 'superadmin'
  try {
    let moduleName = context.params.moduleName
    if(moduleId !== false) {
      moduleName = moduleId
    }
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

let isUserHasActionPermission = async (context, userRole, siteId, moduleId) => {
  try {

    let modulename = moduleResource.moduleName

    let serviceName = context.path
    let resourceIds = context.params.resourceIds
    let registerdRoleIds = context.params.registerdRoleIds
    let roleId = registerdRoleIds[userRole] ? registerdRoleIds[userRole] : 'anonymous'
    userRole = userRole.toLowerCase()
    let resourceId = resourceIds[serviceName]
    let contextMethod = context.method
    if (moduleId !== false) {
      modulename = moduleId
      let serviceName = context.params.headers.stateid
      let moduleresourceId = await getRegisterResource(modulename, serviceName, '')
      resourceId = moduleresourceId['data'] && moduleresourceId['data'][0] ? moduleresourceId['data'][0].id : resourceId
      let moduleRoleId = await getRegisterRole(modulename, userRole, '')
      roleId = moduleRoleId['data'] && moduleRoleId['data'][0] ? moduleRoleId['data'][0].id : 'anonymous'
      if(context.method === 'get' || context.method === 'find') {
        contextMethod = 'read'
      } else if (context.method == 'create' || context.method == 'patch' || context.method == 'update') {
        contextMethod = 'write'
      }
    }
    let resourcePermission = await checkResourcePermission(resourceId + '_' + contextMethod, 'global', roleId, modulename)
    return (resourcePermission['data'] && resourcePermission['data']['accessValue'] > 0)
  } catch (e) {
    return false
  }
}
module.exports.isUserHasActionPermission = isUserHasActionPermission

let checkResourcePermission = async function (resourceId, tasktype, roleId, modulename) {
  return new Promise(async (resolve, reject) => {
    let cacheKey = `${modulename}_${tasktype}_${roleId}_${resourceId}`;
    if(cacheRoleResource[cacheKey]) {
      resolve(cacheRoleResource[cacheKey])
    }
    let KeyValue = resourcePermissionURL + '/' + modulename + '/' + tasktype + '/' + roleId + '/' + resourceId
    var options = {
      method: 'get',
      uri: resourcePermissionURL + '/' + modulename + '/' + tasktype + '/' + roleId + '/' + resourceId
      // headers: {
      //   'authorization': authorization
      // }
    }
    // console.log("==================" + KeyValue + "==============")
    let resourcePermission = await Utils.CachedRP(options, {key: KeyValue, timeout: timeouts['checkResourcePermission']})
    cacheRoleResource[cacheKey] = JSON.parse(resourcePermission)
    resolve(cacheRoleResource[cacheKey])
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
