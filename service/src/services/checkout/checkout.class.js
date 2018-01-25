/* eslint-disable no-unused-vars */
var axios = require('axios')
let _ = require('lodash')
let async = require('asyncawait/async');
let await = require('asyncawait/await');
let rp = require('request-promise')
let config = require('config')
const config1 = require('../../../config/default.json');
var moment = require('moment');
moment().format();
let baseURL = 'http://' + config1.host + ':' + config1.port
let app

if (process.env.x_api_token)
    config1.x_api_token = process.env.x_api_token
if (process.env.pay_url)
    config1.pay_url = process.env.pay_url
if (process.env.update_user_url)
    config1.update_user_url = process.env.update_user_url
if (process.env.user_detail_url)
    config1.user_detail_url = process.env.user_detail_url
if (process.env.api_url)
  config1.api_url = process.env.api_url

class Service {
  constructor (options) {
    this.options = options || {};
  }

  setup(app){
    this.app = app;
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
  // console.log("+++++++++++ params",params.query.authorization)
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
  var checkout_res = await (axios.post(config1.pay_url, paymentObj, config).then(res => {
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
    //console.log('userDetail', userDetail)
    if (userDetail != null) {
      // console.log('userDetail......', userDetail.data)
      if(userDetail.data.hasOwnProperty("package")){
        var packageObj = await (makePackageObj(thisSubscription, checkout_res.id, userDetail.data.package, userDetail))
        var u_id = userDetail.data._id
        console.log('Valid Token!')
        axios.post(config1.api_url + 'user-subscription', {package: packageObj})
        .then(async res => {
          if (userDetail.data.package) {
            userDetail.data.package.push({"subscriptionId": res.data.id, "role": "admin"})
          } else {
            userDetail.data.package = [{"subscriptionId": res.data.id, "role": "admin"}]
          }
          axios.put(config1.update_user_url + u_id, {"package":userDetail.data.package}, config)
          .then(res => {
            console.log('User ',  u_id, ' has subscribed  package successfully..!')
          })
          .catch(err => {
            console.log("Error : ", err)
          })
          axios.post(config1.api_url + 'reverse-subscription',{"subscriptionId": res.data.id})
          .then(res => {
            console.log('subscriptionId : ', res.data.subscriptionId)
          })
          .catch(err => {
            console.log("Error : ", err)
          })
        })
        .catch(err => {
          console.log("Error : ", err)
        })
      } else {
        console.log('Valid Token!')
        var packageObj = await (makePackageObj(thisSubscription, checkout_res.id, null, userDetail))
        var u_id = userDetail.data._id
        axios.post(config1.api_url + 'user-subscription', {package: packageObj})
        .then(res => {
          if (userDetail.data.package) {
            userDetail.data.package.push({"subscriptionId": res.data.id, "role": "admin"})
          } else {
            userDetail.data.package = [{"subscriptionId": res.data.id, "role": "admin"}]
          }
          axios.put(config1.update_user_url + u_id, {"package":userDetail.data.package}, config)
          .then(res => {
            console.log('User ',  u_id, ' has subscribed  package successfully..!')
          })
          .catch(err => {
            console.log("Error : ", err)
          })
          axios.post(config1.api_url + 'reverse-subscription',{"subscriptionId": res.data.id})
          .then(res => {
            console.log('subscriptionId : ', res.data.subscriptionId)
          })
          .catch(err => {
            console.log("Error : ", err)
          })
        })
        .catch(err => {
          console.log("Error : ", err)
        })
      }

      // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>..', _resConfirm.data)
    } else {
      console.log('Not Valid Token!')
    }
    return checkout_res
  }
})

let makePackageObj = async (function (subData, trans_id, subscribed, userDetail) {
  var exdate
  if (subscribed != null) {
    if(moment(subscribed.expiredOn).diff(moment().format(), 'days') <= 0) {
      exdate = moment().add(subData.validity, 'days').format()
    } else {
      exdate = moment(subscribed.expiredOn).add(subData.validity, 'days').format()    
    }
  } else {
    exdate = moment().add(subData.validity, 'days').format()
  }
  // console.log("exdate :",exdate)
  var detail = {}
  let module = _.groupBy(subData.details, "module")
  Object.keys(module).forEach(function(key) {
    let service = _.groupBy(module[key], "service")
    for (let i = 0; i < module[key].length; i++) {
      detail[module[key][i].module] = {}
      Object.keys(service).forEach(function(k) {
        detail[module[key][i].module][k] = {}
        for (let j = 0; j < service[k].length; j++) {
          if (service[k][j].value != 0 || service[k][j].value != '') {
            let actionVal = parseInt(service[k][j].value)
            detail[module[key][i].module][k][service[k][j].action] = actionVal
          }
        }
        if (Object.keys(detail[module[key][i].module][k]).length < 1) {
        	delete detail[module[key][i].module][k]
        }
      })
    }
  })

  var package = {
    userId: userDetail.data._id,
    expiredOn : exdate,
    details : detail,
    sub_id : subData.id,
    trans_id: trans_id,
    name: subData.name,
    price: subData.price,
    time_unit: subData.time_unit,
    validity: subData.validity
  }
  // console.log('==>', JSON.stringify(package))
  return package
})

let getUserPackage = async function (authorization) {
  return new Promise((resolve, reject) => {
    var options = {
      uri: config1.user_detail_url,
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
