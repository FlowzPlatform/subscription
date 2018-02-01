let rp = require('request-promise')
let domainKey = 'localhost'
let protocol = 'https'
if (process.env['domainKey'] !== undefined && process.env['domainKey'] !== '') {
  domainKey = process.env['domainKey']
}

if (process.env['NODE_ENV'] !== 'production') {
  protocol = 'http'
}

let defaultConfig = {
  'subscriptionURL': '/subscriptionlist',
  'userDetailURL': protocol + '://auth.' + domainKey + '/api/userdetails',
  'registerModuleURL': protocol + '://api.' + domainKey + '/subscription/register-resource',
  'registerRoleURL': protocol + '://api.' + domainKey + '/subscription/register-roles',
  'userSubscriptionURL': protocol + '://api.' + domainKey + '/subscription/user-subscription',
  'userSiteURL': protocol + '://api.' + domainKey + '/serverapi/project-configuration'
}

let subscriptionURL = defaultConfig['subscriptionURL']
let userDetailURL = defaultConfig['userDetailURL']
let registerModuleURL = defaultConfig['registerModuleURL']
let registerRoleURL = defaultConfig['registerRoleURL']
let userSubscription = defaultConfig['userSubscriptionURL']
let userSiteURL = defaultConfig['userSiteURL']

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
  'appRoles': ['Admin']
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
    console.log('=isValidAuthToken=call=>' + '<==')
    let userDetail = await getUserPackage(authToken)
    if (userDetail !== undefined && userDetail !== null) {
      console.log('=isValidAuthToken=call with details=><==')
      resolve(userDetail)
    }
    console.log('=isValidAuthToken=call end=>' + '<==')
    resolve(false)
  })
}

let isValidSubscriptionPack = (userDetails, mainRoute, mainMethod) => {
  console.log('=isValidSubscriptionPack=call=><==')
  let userPlan = userDetails.data.package.details
  let regExpmainRoute = new RegExp('^' + mainRoute, 'i')
  let regExpmainMethod = new RegExp('^' + mainMethod, 'i')
  console.log('==isValidSubscriptionPack 1=>' + mainRoute + '<==>' + mainMethod + '<==')
  let findObj = userPlan.find((o) => { return regExpmainRoute.test(o.route) && regExpmainMethod.test(o.method) })
  console.log('=isValidSubscriptionPack=end=><==')
  return (findObj !== undefined) ? findObj : false
}

module.exports.subscription = async function (req, res, next) {
  // console.log('Subscription Request:', req.headers.authorization)
  console.log('=subscription=1=>' + (req.baseUrl + req._parsedUrl.pathname) + '<==')
  let userDetail = await isValidAuthToken(req.headers.authorization)
  if (userDetail === false) {
    res.redirect(401, subscriptionURL)
    return false
  }
  console.log('=subscription=2=>' + (req.baseUrl + req._parsedUrl.pathname) + '<==')
  // Package details not available
  if (userDetail.data.package === undefined || userDetail.data.package.details === undefined) {
    console.log('planExpire===>')
    res.redirect(401, subscriptionURL)
    return false
  }
  console.log('=subscription=3=>')
  // check plan expir or not
  if (isPlanExpired(userDetail.data.package.expiredOn)) {
    console.log('planExpire===>')
    res.redirect(403, subscriptionURL)
    return false
  }
  console.log('=subscription=4=>')
  if (userDetail.data.package !== undefined && userDetail.data.package.details !== undefined) {
    let mainRoute = req.baseUrl + req._parsedUrl.pathname
    let mainMethod = req.method.replace("'", '')
    console.log('=subscription=5=>')
    let packageInfo = isValidSubscriptionPack(userDetail, mainRoute, mainMethod)
    console.log('=subscription=6=>')
    if (packageInfo !== false) {
      try {
        console.log('=subscription=7=>')
        console.log(secureService.validate.toString())
        if (typeof secureService.validate === 'function') {
          console.log('=subscription=8=>')
          let isSecure = await secureService.validate(mainRoute, req, packageInfo, userDetail)
          console.log('=subscription=9=>', isSecure)
          if (isSecure !== true) {
            console.log('=subscription=10=>')
            res.redirect(403, subscriptionURL)
            return false
          }
        } else {
          console.log('=subscription=11=>')
          res.redirect(403, subscriptionURL)
          return false
        }
      } catch (e) {
        console.log('=subscription=12=>')
        res.redirect(403, subscriptionURL)
        return false
      }
    }
    console.log('=subscription=13=>')
  }
  console.log('=subscription=14=>')
  next()
}

module.exports.socketSubscription = async function (authToken, packet, next) {
  // console.log('Subscription Request:', req.headers.authorization)
  console.log('=socketSubscription=1=>' + '<==')
  let userDetail = await isValidAuthToken(authToken)
  if (userDetail === false) {
    next(new Error('invalid authToken'))
    return false
  }
  console.log('=socketSubscription=2=>' + '<==')
  // Package details not available
  if (userDetail.data.package === undefined || userDetail.data.package.details === undefined) {
    console.log('no package avaibale===>')
    next(new Error('no package avaibale'))
    return false
  }
  console.log('=socketSubscription=3=>')
  // check plan expir or not
  if (isPlanExpired(userDetail.data.package.expiredOn)) {
    console.log('planExpire===>')
    next(new Error('your subscription plan expird'))
    return false
  }
  console.log('=socketSubscription=4=>')
  if (userDetail.data.package !== undefined && userDetail.data.package.details !== undefined) {
    let url = packet[0].split('::')
    let mainRoute = url[0]
    let mainMethod = url[1]
    console.log('=socketSubscription=5=>')
    let packageInfo = isValidSubscriptionPack(userDetail, mainRoute, mainMethod)
    console.log('=socketSubscription=6=>')
    if (packageInfo !== false) {
      try {
        console.log('=socketSubscription=7=>')
        console.log(secureService.validate.toString())
        if (typeof secureService.validate === 'function') {
          console.log('=socketSubscription=8=>')
          let isSecure = await secureService.validate(mainRoute, packet, packageInfo, userDetail)
          console.log('=socketSubscription=9=>')
          if (isSecure !== true) {
            console.log('=socketSubscription=10=>')
            return next(new Error('Access Forbidden'))
          }
        } else {
          console.log('=socketSubscription=11=>')
          return next(new Error('Access Forbidden'))
        }
      } catch (e) {
        console.log('=socketSubscription=12=>')
        return next(new Error('Access Forbidden'))
      }
    }
    console.log('=socketSubscription=13=>')
  }
  console.log('=socketSubscription=14=>')
  next()
}

let getUserPackage = async function (authorization) {
  return new Promise((resolve, reject) => {
    // if (userArr[authorization] !== undefined) {
    //   resolve(userArr[authorization])
    // }
    var options = {
      uri: userDetailURL,
      headers: {
        'authorization': authorization
      }
    }
    // console.log(options)
    rp(options)
    .then(function (userDetail) {
      resolve(JSON.parse(userDetail))
    })
    .catch(function (err) {
      if (err) {
      }
      resolve(null)
    })
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
    await registerToMainService(moduleResource.moduleName, resourceName, newActionValue)
  }

  if (moduleResource.appRoles === undefined || moduleResource.appRoles.length === 0) {
    console.log('Please register your role in "registerAppModule"')
    process.exit()
  }
  await registerToMainRole(moduleResource.moduleName, moduleResource.appRoles)
}

module.exports.registeredAppModulesRole = registeredAppModulesRole

async function registerToMainService (modulename, resource, actions, authorization) {
  return new Promise((resolve, reject) => {
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
    // console.log("=======RP======", options)
    rp(options)
    .then(function (resourceDetails) {
      console.log(resourceDetails)
      resolve(resourceDetails)
    })
    .catch(function (err) {
      console.log(err)
      if (err) {
      }
      resolve(null)
    })
  })
}

async function registerToMainRole (modulename, roles, authorization) {
  return new Promise((resolve, reject) => {
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
    console.log("=======RP==role====", options)
    rp(options)
    .then(function (resourceDetails) {
      resolve(resourceDetails)
    })
    .catch(function (err) {
      if (err) {
      }
      resolve(null)
    })
  })
}
// console.log("=============2111=======")
// // registeredAppModules()
// console.log("=============2333=======")

module.exports.isAccess = (moduleName, route, method) => {
  return new Promise(async (resolve, reject) => {
    registerModuleURL
  })
}

async function findResource (moduleName, route, method, authorization) {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'get',
      uri: registerModuleURL + '?method=' + method + '&route=' + route + '&module=' + moduleName
      // headers: {
      //   'authorization': authorization
      // }
    }
    console.log("=======RP==find====", options)
    rp(options)
    .then(function (resourceDetails) {
      resolve(resourceDetails)
    })
    .catch(function (err) {
      if (err) {
      }
      resolve(null)
    })
  })
}

module.exports.getUerSubscription = async function (subscriptionId) {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'get',
      uri: userSubscription + '/' + subscriptionId
      // headers: {
      //   'authorization': authorization
      // }
    }
    console.log("=======RP==find====", options)
    rp(options)
    .then(function (resourceDetails) {
      resolve(JSON.parse(resourceDetails))
    })
    .catch(function (err) {
      if (err) {
      }
      resolve(null)
    })
  })
}

module.exports.getSiteInfo = async function (siteId) {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'get',
      uri: userSiteURL + '/' + siteId
      // headers: {
      //   'authorization': authorization
      // }
    }
    console.log("=======RP==find====", options)
    rp(options)
    .then(function (resourceDetails) {
      resolve(JSON.parse(resourceDetails))
    })
    .catch(function (err) {
      if (err) {
      }
      resolve(null)
    })
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

// =============================feather Subscription=========================================
let commonActionValidation = async (context) => {
  try {
    const subscription = require('flowz-subscription')
    console.log('==================expiryDate==============', context.params.headers)
    let subscriptionId = ''
    if (context.params.headers.subscriptionid) {
      console.log('==called direct subscription=>')
      subscriptionId = context.params.headers.subscriptionid
    } else if (context.params.headers.siteid) {
      // get if from website settings
      console.log('==called site wise subscription=>')
      let siteDetails = await subscription.getSiteInfo(context.params.headers.siteid)
      subscriptionId = siteDetails.subscriptionId
    } else {
      // get if from website settings
      console.log('==called user wise subscription=>')
      userPackageDetails = context.params.userPackageDetails.package
      let regExpmainPlan = new RegExp('^default', 'i')
      let findObj = userPackageDetails.find((o) => { return regExpmainPlan.test(o.type) })
      subscriptionId = findObj.subscriptionId
    }
    console.log('=============subscriptionId=', subscriptionId)
    let userSubscriptionDetails = await subscription.getUerSubscription(subscriptionId)
    console.log('=============userSubscriptionDetails=', userSubscriptionDetails)

    if (subscription.isPlanExpired(userSubscriptionDetails.expiredOn) === true) {
      context.result = {status: 403, message: 'subscription package expired'}
    }
    if (userSubscriptionDetails.details !== undefined) {
      let userPackageDetails = userSubscriptionDetails.details
      let serviceName = context.service.options.name
      let moduleName = context.params.moduleName
      if (userPackageDetails[moduleName] !== undefined) {
        if (userPackageDetails[moduleName][serviceName] !== undefined &&
            userPackageDetails[moduleName][serviceName][context.method] !== undefined) {
          let data = await context.service.find({
            query: {'subscriptionId': subscriptionId}
          })
          if (data.total !== undefined &&
            data.total > userPackageDetails[moduleName][serviceName][context.method]) {
            context.result = {status: 403, message: 'Access denied'}
          } else {
            return context
          }
        } else if (context.method === 'get') {
          return context
        }
      }
    }
    context.result = {status: 403, message: 'Access denied'}
  } catch (e) {
    console.log(e)
    context.result = {status: 403, message: e.message}
  }
}
// find: get: create: update: patch: remove:
let actionValidation = {
  'create': commonActionValidation,
  'remove': commonActionValidation
  // "remove": () => {},
}

// =========================================================================================
module.exports.featherSubscription = async function (req, res, next) {
  // console.log('Subscription Request:', req)

  if (req.headers.authorization !== undefined) {
    if (userArr[req.headers.authorization] !== undefined) {
      req.feathers.userPackageDetails = userArr[req.headers.authorization]
      req.feathers.moduleName = moduleResource.moduleName
      return next()
    }
    let userDetail = await isValidAuthToken(req.headers.authorization)
    if (userDetail !== false) {
      userArr[req.headers.authorization] = userDetail.data
      req.feathers.userPackageDetails = userDetail.data
      req.feathers.moduleName = moduleResource.moduleName
      return next()
    }
    // if (userDetail === false) {
    //   res.redirect(401, subscriptionURL)
    //   return false
    //   // return next()
    // }
    // // console.log('=subscription=2=>' + (req.baseUrl + req._parsedUrl.pathname) + '<==')
    // // Package details not available
    // if (userDetail.data.package === undefined || userDetail.data.package.details === undefined) {
    //   // console.log('planExpire===>')
    //   res.redirect(401, subscriptionURL)
    //   return false
    // }
    // // console.log('=subscription=3=>')
    // // check plan expir or not
    // if (isPlanExpired(userDetail.data.package.expiredOn)) {
    //   // console.log('planExpire===>')
    //   res.redirect(403, subscriptionURL)
    //   return false
    // }
    // // console.log('=subscription=4=>')
    // if (userDetail.data.package !== undefined && userDetail.data.package.details !== undefined) {
    //   userArr[req.headers.authorization] = userDetail
    //   req.feathers.userPackageDetails = userDetail.data
    //   req.feathers.moduleName = moduleResource.moduleName
    // }
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
