let rp = require('request-promise')
let defaultConfig = {
  'subscriptionURL': '/subscriptionlist',
  'userDetailURL': 'http://auth.flowz.com/api/userdetails',
  'registerModuleURL': 'http://localhost:3030/register-resource',
  'registerRoleURL': 'http://localhost:3030/register-roles'
}

let subscriptionURL = defaultConfig['subscriptionURL']
let userDetailURL = defaultConfig['userDetailURL']
let registerModuleURL = defaultConfig['registerModuleURL']
let registerRoleURL = defaultConfig['registerRoleURL']

if (process.env['subscriptionURL'] !== undefined && process.env['subscriptionURL'] !== '') {
  subscriptionURL = process.env['subscriptionURL']
}
if (process.env['userDetailURL'] !== undefined && process.env['userDetailURL'] !== '') {
  userDetailURL = process.env['userDetailURL']
}
if (process.env['registerModuleURL'] !== undefined && process.env['registerModuleURL'] !== '') {
  registerModuleURL = process.env['registerModuleURL']
}
if (process.env['registerRoleURL'] !== undefined && process.env['registerRoleURL'] !== '') {
  registerRoleURL = process.env['registerRoleURL']
}

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
  console.log('=isValidAuthToken=call=>' + '<==')
  let userDetail = await getUserPackage(authToken)
  if (userDetail !== undefined && userDetail !== null) {
    console.log('=isValidAuthToken=call with details=><==')
    return userDetail
  }
  console.log('=isValidAuthToken=call end=>' + '<==')
  return false
}

let isValidSubscriptionPack = (userDetails, mainRoute, mainMethod) => {
  console.log('=isValidSubscriptionPack=call=><==')
  let userPlan = userDetails.data.package.details
  let regExpmainRoute = new RegExp('^' + mainRoute, 'i')
  let regExpmainMethod = new RegExp('^' + mainMethod, 'i')
  console.log('==isValidSubscriptionPack 1=>' + mainRoute + '<==>' + mainMethod + '<==')
  let findObj = userPlan.find((o) => { return regExpmainRoute.test(o.route) && regExpmainMethod.test(o.method) })
  console.log('=isValidSubscriptionPack=end=><==')
  return findObj
}

module.exports.subscription = async function (req, res, next) {
  // console.log('Subscription Request:', req.headers.authorization)
  console.log('=subscription=1=>' + (req.baseUrl + req._parsedUrl.pathname) + '<==')
  let userDetail = await isValidAuthToken(req.headers.authorization)
  if (userDetail === false) {
    res.redirect(401, subscriptionURL)
    return false
    //return next()
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
          console.log('=subscription=9=>',isSecure)
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
    //return next()
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
            return false
          }
        } else {
          console.log('=socketSubscription=11=>')
          return next(new Error('Access Forbidden'))
          return false
        }
      } catch (e) {
        console.log('=socketSubscription=12=>')
        return next(new Error('Access Forbidden'))
        return false
      }
    }
    console.log('=socketSubscription=13=>')
  }
  console.log('=socketSubscription=14=>')
  next()
}

let isPlanExpired = (expiryDate) => {
  let expiryDateObj = new Date((new Date(expiryDate)))
  // console.log('current Time==>', (new Date()).toGMTString())
  // console.log('expiryDateObj==>', expiryDateObj)
  if (expiryDateObj < new Date((new Date()).toGMTString())) {
    return true
  }
  return false
}

let getUserPackage = async function (authorization) {
  return new Promise((resolve, reject) => {
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
  console.log('==================moduleName========', moduleResource.moduleName)
  if (moduleResource.moduleName === '') {
    console.log('Please enter module name')
    process.exit()
  }
  console.log('==================moduleName========', moduleResource.registerAppModule)
  if (Object.keys(moduleResource.registerAppModule).length === 0) {
    console.log('Please register your modules in "registerAppModule"')
    process.exit()
  }

  for(let resourceName in moduleResource.registerAppModule) {
    let regiserData = await registerToMainService(moduleResource.moduleName, resourceName, moduleResource.registerAppModule[resourceName])
    console.log('==============registerData=====', regiserData)
  }

  console.log('==================moduleName========', moduleResource.appRoles)
  if (moduleResource.appRoles === undefined || moduleResource.appRoles.length === 0) {
    console.log('Please register your modules in "registerAppModule"')
    process.exit()
  }
  let regiserData = await registerToMainRole(moduleResource.moduleName, moduleResource.appRoles)
  console.log('==============registerRole Data=====', regiserData)
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
