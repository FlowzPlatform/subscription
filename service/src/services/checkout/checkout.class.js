/* eslint-disable no-unused-vars */
var axios = require('axios')
let async = require('asyncawait/async');
let await = require('asyncawait/await');
let rp = require('request-promise')
let config = require('config')
let baseURL = 'http://' + config.host + ':' + config.port
let payURL = 'http://api.flowz.com/payment/payment'
let updateUserURL = 'http://api.flowz.com/user/updateuserdetails/'
let userDetailURL = 'http://auth.flowz.com/api/userdetails'
const config1 = require('../../../config/default.json');
if (process.env.x_api_token != '')
    config1.x_api_token = process.env.x_api_token
class Service {
  constructor (options) {
    this.options = options || {};
  }

  find (params) {
    return Promise.resolve([]);
  }

  get (id, params) {
    return Promise.resolve({
      id, text: `A new message with ID: ${id}!`
    });
  }

  create (data, params) {
    var res = createFunction(data,params)
    return Promise.resolve(res);
  }

  update (id, data, params) {
    return Promise.resolve(data);
  }

  patch (id, data, params) {
    return Promise.resolve(data);
  }

  remove (id, params) {
    return Promise.resolve({ id });
  }
}

var payObj = async( function (data, price) {
  var sObj =  {
        gateway:'stripe',
        amount : parseInt(price),
        currency:'usd',
        cardNumber: data.payDetail.cardNumber,
        expMonth: data.payDetail.expiryMM,
        expYear: data.payDetail.expiryYY,
        cvc: data.payDetail.cvCode,
        description:'this is desc',
        isCustomer:false,
        metadata: {
          id: data.sub_id
        }
      }
    return sObj
})

var getThisSubscription = async(function (id) {
  var res = await (axios.get(baseURL + '/subscription-plans/' + id))
  return res.data
})

var createFunction = async (function(data,params) {
  // console.log("+++++++++++ data",data)
  var thisSubscription = await (getThisSubscription(data.sub_id))
  // console.log('thisSubscription', thisSubscription)
  var paymentObj = await (payObj(data, thisSubscription.price))
  var config = {
    headers:  {
    'Content-Type': 'application/json',
    'X-api-token':  config1.x_api_token,
    'authorization': params.query.authorization
    }
  }
  // console.log(paymentObj)
  var checkout_res = await (axios.post(payURL, paymentObj, config).then(res => {
        // console.log('payment_response....', res.data)
        return res.data
      })
      .catch(err => {
        console.log('Error', err)
        return {error: err}
      }))
  if(checkout_res.hasOwnProperty('statusCode')) {
    return {error: res.data.message}
  } else {
    console.log('payment Successfully Done!')
    let userDetail = await (getUserPackage(config.headers.authorization))
    // console.log('userDetail', userDetail)
    if (userDetail != null) {
      // console.log('userDetail......', userDetail.data)
      console.log('Valid Token! >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.')
      var packageObj = await (makePackageObj(thisSubscription, checkout_res.id))
      var u_id = userDetail.data._id
      // console.log('.............', packageObj)
      var _resConfirm = await (axios.put(updateUserURL + u_id, {package: packageObj}, config))
      // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>..', _resConfirm.data)
    } else {
      console.log('Not Valid Token!')
    }
    return checkout_res
  }
})

let makePackageObj = async (function (subData, trans_id) {
  // console.log('....................', subData)
  var exdate = new Date()
  exdate.setDate(exdate.getDate() + subData.validity)
  var detail = []
  for(let i=0;i<subData.details.length;i++){
    let obj = {}
    obj.module = subData.details[i].module
    obj.service = subData.details[i].service
    obj.method = subData.details[i].action
    obj.route = subData.details[i].url
    obj.value = subData.details[i].value
    // console.log("obj.........................",obj)
    detail.push(obj)
  }
  // for(let [inx, _service] of subData.services.entries()) {
  //   var obj = {}
  //   obj.service = _service.name
  //   for(let [i, _route] of _service.routes.entries()) {
  //     obj.routes = _route.name
  //     for(let [inxx, mobj] of _route.methods.entries()) {
  //       obj.method = mobj.name
  //       obj.value = mobj.value
  //     }
  //   }
  //   detail.push(obj)
  // }
  var package = {
    expiredOn : exdate,
    details : detail,
    sub_id : subData.id,
    trans_id: trans_id
  }
  return package
})

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


module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
