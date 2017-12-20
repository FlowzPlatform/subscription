let rp = require('request-promise')
let defaultConfig = {
  'subscriptionURL': '/subscriptionlist',
  'userDetailURL': 'http://auth.flowz.com/api/userdetails',
  'registerModuleURL': 'http://localhost:3030/register-resource'
}

let subscriptionURL = defaultConfig['subscriptionURL']
let userDetailURL = defaultConfig['userDetailURL']
let registerModuleURL = defaultConfig['registerModuleURL']

if (process.env['subscriptionURL'] !== undefined && process.env['subscriptionURL'] !== '') {
  subscriptionURL = process.env['subscriptionURL']
}
if (process.env['userDetailURL'] !== undefined && process.env['userDetailURL'] !== '') {
  userDetailURL = process.env['userDetailURL']
}
if (process.env['registerModuleURL'] !== undefined && process.env['registerModuleURL'] !== '') {
  registerModuleURL = process.env['registerModuleURL']
}

let moduleResource = {
  'moduleName': '',
  'registerAppModule': ''
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

module.exports.subscription = async function (req, res, next) {
  // console.log('Subscription Request:', req.headers.authorization)
  console.log('==1=>' + (req.baseUrl + req._parsedUrl.pathname) + '<==')
  if (req.headers.authorization !== undefined) {
    let userDetail = await getUserPackage(req.headers.authorization)
                            .catch((err) => {
                              // on error from user authontication
                              if (err) {
                                res.redirect(401, subscriptionURL)
                                return false
                              }
                            })
    // no user detail found then redirect to login page
    if (userDetail.data.package === undefined || userDetail.data.package.details === undefined) {
      console.log('planExpire===>')
      res.redirect(401, subscriptionURL)
      return false
    }

    // console.log('==userDetail=>', userDetail.data)
    if (userDetail.data.package !== undefined && userDetail.data.package.details !== undefined) {
      if (isPlanExpired(userDetail.data.package.expiredOn)) {
        console.log('planExpire===>')
        res.redirect(403, subscriptionURL)
        return false
      }

      let userPlan = userDetail.data.package.details
      let mainRoute = req.baseUrl + req._parsedUrl.pathname
      let mainMethod = req.method.replace("'", '')
      let regExpmainRoute = new RegExp('^' + mainRoute, 'i')
      let regExpmainMethod = new RegExp('^' + mainMethod, 'i')
      console.log('==1=>' + mainRoute + '<==>' + mainMethod + '<==')
      let findObj = userPlan.find((o) => { return regExpmainRoute.test(o.route) && regExpmainMethod.test(o.method) })
      if (findObj !== undefined) {
        // call validate method
        // console.log('====== Find Obj :', findObj)
        try {
          console.log(secureService.validate.toString())
          if (typeof secureService.validate === 'function') {
            let isSecure = await secureService.validate(mainRoute, req, findObj, userDetail)
            if (isSecure !== true) {
              res.redirect(403, subscriptionURL)
              return false
            }
          } else {
            res.redirect(403, subscriptionURL)
            return false
          }
        } catch (e) {
          res.redirect(403, subscriptionURL)
          return false
        }
      }
    }
  }
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

async function registeredAppModules () {
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
}

module.exports.registeredAppModules = registeredAppModules

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
    console.log("=======RP======", options)
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
