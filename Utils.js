let requestPromise = require('request-promise')
let Cache = {}
let isCachedResultValid = (result, timeout = 3600) => {
  return result && (result.timestamp - Date.now() > timeout)
}

let CachedRP = (options, {key, timeout}) => {
  return new Promise((resolve, reject) => {
    const cachedResult = Cache[key]
    // check cache key valid
    if (isCachedResultValid(cachedResult, timeout)) return cachedResult
    // send request
    console.log('===========Request promise called=====')
    requestPromise(options)
    .then(function (resourceDetails) {
      const result = resourceDetails
      result.timestamp = Date.now()
      Cache[key] = result
      resolve(result)
    })
    .catch((err) => resolve(null))
  })
}

let removeTimeOutKey = (timeout = 3600) => {
  if (Object.keys(Cache).length > 10000) {
    for (let key in Object.keys(Cache)) {
      isCachedResultValid(Cache[key], timeout)
    }
  }
   Cache = {}; //TODO: only delete the old
}


module.exports.isCachedResultValid = isCachedResultValid
module.exports.CachedRP = CachedRP
