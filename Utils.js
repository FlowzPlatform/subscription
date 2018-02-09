let requestPromise = require('request-promise')
let Cache = {}
const millisend = 1000
let isCachedResultValid = (result, timeout = 3600) => {
  return (result && Date.now() - result.timestamp < timeout * millisend)
}

let CachedRP = (options, {key, timeout}) => {
  return new Promise((resolve, reject) => {
    const cachedResult = Cache[key]
    // check cache key valid
    if (isCachedResultValid(cachedResult, timeout)) {
      // console.log('===========cachedResult return=====')
      return resolve(cachedResult['result'])
    }
    // send request
    // console.log('===========Request promise called=====')
    requestPromise(options)
    .then(function (resourceDetails) {
      const result = resourceDetails
      Cache[key] = {'result': result, 'timestamp': Date.now()}
      resolve(result)
    })
    .catch((err) => resolve(null))
  })
}

let removeTimeOutKey = (timeout = 7200) => { // TODO: only delete the old
  if (Object.keys(Cache).length > 10000) {
    for (let key in Object.keys(Cache)) {
      if (!isCachedResultValid(Cache[key], timeout)) {
        delete Cache[key]
      }
    }
  }
}

setTimeout(removeTimeOutKey, 7200)

module.exports.isCachedResultValid = isCachedResultValid
module.exports.CachedRP = CachedRP
