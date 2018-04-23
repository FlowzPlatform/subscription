/* eslint-disable no-unused-vars */
var axios = require('axios')
let _ = require('lodash')
let async = require('asyncawait/async');
let await = require('asyncawait/await');
let rp = require('request-promise')
let config1 = require('../config')
const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;
// let config1
// if (process.env.NODE_ENV !== 'production') {
//   config1 = require('../../../config/default.json');
// } else {
// config1 = require('../../../config/production.json');
// }
var moment = require('moment');
moment().format();

let app

// if (process.env.x_api_token)
//     config1.x_api_token = process.env.x_api_token
// if (process.env.pay_url)
//     config1.pay_url = process.env.pay_url
// if (process.env.update_user_url)
//     config1.update_user_url = process.env.update_user_url
// if (process.env.user_detail_url)
//     config1.user_detail_url = process.env.user_detail_url

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
    var res = createFunction(data,params, params.app)
    return Promise.resolve(res).then(resp => {
      return resp;
    }).catch(err => {
      return new Error(err)
    });
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

var payObj = async function (data, price) {
  var sObj =  {
    gateway:'stripe',
    amount : parseFloat(price),
    currency:'usd',
    cardNumber: data.payDetail.cardNumber,
    expMonth: data.payDetail.expiryMM,
    expYear: data.payDetail.expiryYY,
    cvc: data.payDetail.cvCode,
    description:'payment for subscription plan subscribe',
    isCustomer:false,
    metadata: {
      id: data.sub_id
    }
  }
  return sObj;
}

var getThisSubscription = async function (id, app) {
  return app.service('subscription-plans').get(id)
  .then(res => {
    return res;
  }).catch(err => {
    return { error: err.name, message: err.message }
  });
}

var getBasicSubscription = async function(id, app) {
  return app.service('user-subscription').get(id).then(res => {
    return res;
  }).catch(err => {
    return { error: err.name, message: err.message }
  })
}

var createFunction = async (function(data,params, app) {
  var thisSubscription = await (getThisSubscription(data.sub_id, app));
  if(thisSubscription.hasOwnProperty('error')) {
    return thisSubscription;
  } else if (thisSubscription.hasOwnProperty('status') && thisSubscription.status === false) {
    throw new errors.NotFound(err)
    return { error: 'NotFound', message: 'please select valid subscription plan' }
  }
  let basicSubscription;
  if (data.basicPlan) {
    basicSubscription = await (getBasicSubscription(data.basicPlan, app));
    if (basicSubscription.hasOwnProperty('error')) {
      return basicSubscription;
    }
  }

  var paymentObj = await (payObj(data, thisSubscription.price))
  var config = {
    headers:  {
      'Content-Type': 'application/json',
      'X-api-token':  config1.x_api_token,
      'authorization': params.query.authorization
    }
  }
  thisSubscription.basicPlan = data.basicPlan
  let update_trans, checkout_res;
  let userDetail = await (getUserPackage(config.headers.authorization))
  let transObj = {
    user_details: { 'user_id': userDetail.data._id, 'username': userDetail.data.username, 'email': userDetail.data.email },
    pay_request: paymentObj,
    transaction_status: 'Initiated',
    payment_status: false,
    created_at: new Date(),
    updated_at: new Date()
  }
  if (userDetail != null) {
    console.log('Valid Token!');
    var transaction_id = await (app.service('transactions').create(transObj,{headers: {'Authorization': config.headers.authorization }}).then(res => {
      return res.id;
    }).catch(err => {
      return { error: err.name, message: err.message };
    }));
    if(transaction_id.hasOwnProperty('error')) {
      return transaction_id;
    }
    checkout_res = await (axios.post(config1.pay_url, paymentObj, config).then(res => {
      return res.data;
    }).catch(err => {
      return { error: err };
    }));
    if(checkout_res.type == 'StripeCardError') {
      transObj.pay_response = { 'rawType': checkout_res.rawType, 'requestId': checkout_res.requestId, 'stack': checkout_res.stack, 'statusCode': checkout_res.statusCode, 'type': checkout_res.type};
      transObj.transaction_status = 'Failed';
      update_trans = await (updateTransaction(app, transaction_id, transObj, config.headers.authorization));
      return { error:  checkout_res.type, message: checkout_res.message, transaction_id: transaction_id };
    } else {
      transObj.payment_status = true;
      transObj.transaction_status = 'Paid';
      transObj.pay_response = checkout_res;
      checkout_res.transaction_id = transaction_id;
      console.log('Payment Successfully Done!');
      update_trans = await (updateTransaction(app, transaction_id, transObj, config.headers.authorization));
      if(update_trans.hasOwnProperty('error')) {
        return update_trans;
      }
      let u_id = userDetail.data._id;
      let packageObj;
      let checkPoint;
      if(basicSubscription.hasOwnProperty("details")){
        packageObj = await (makeAddonPackageObj(thisSubscription, transaction_id, basicSubscription, userDetail));
        checkPoint = await (userDetailsEntry(userDetail, packageObj[0], packageObj[1], u_id, config, checkout_res, app, transaction_id, transObj));
      } else {
        packageObj = await (makePackageObj(thisSubscription, transaction_id, null, userDetail));
        checkPoint = await (userDetailsEntry(userDetail, packageObj, null, u_id, config, checkout_res, app, transaction_id, transObj));
        // var u_id = userDetail.data._id
        // axios.post(config1.api_url + 'user-subscription', packageObj)
        // packageObj.createdAt = new Date()
        /* app.service('user-subscription').create(packageObj)
        .then(res => {
          let planName = res.id.substr(res.id.length - 5) + "-" +  packageObj.name + "-" + moment(packageObj.expiredOn).format('DD-MMM-YYYY')
          if (userDetail.data.package) {
            userDetail.data.package[res.id] = {"subscriptionId": res.id, "role": "admin", "name": planName}
          } else {
            userDetail.data.package={}
            userDetail.data.package[res.id] = {"subscriptionId": res.id, "role": "admin", "name": planName}
          }
          axios.put(config1.update_user_url + u_id, {"package":userDetail.data.package, "defaultSubscriptionId": res.id}, config)
          .then(res => {
            console.log('User ',  u_id, ' has subscribed  package successfully..!')
          })
          .catch(err => {
            checkout_res = { error: err.name, message: err.message }
            console.log('>>>>>>>>>>>', err)
            // return { error: err }
            // console.log("Error : ", err)
          })
          app.service('reverse-subscriptio').create({"subscriptionId": res.id})
          .then(res => {
            console.log('subscriptionId : ', res.subscriptionId)
          })
          .catch(err => {
            checkout_res = { error: err.name, message: err.message }
            console.log('>>>>>ERROR>>>>>>', err)
            // return { error: err }
            // console.log("Error : ", err)
          })
        })
        .catch(err => {
          checkout_res = { error: err.name, message: err.message }
          // return { error: err }
          // console.log("Error : ", err)
        }) */
      }
      
      // packageObj.createdAt = new Date();
      
      if (checkPoint.hasOwnProperty('error')) {
        checkPoint.transaction_id = transaction_id;
        return checkPoint;
      }
    }
  } else {
    return {error: 'NotAuthenticated', message: 'Your session is expired please login again.'}
  }
  return checkout_res;
});

let updateTransaction = function (app, transaction_id, transObj, auth_token) {
  transObj.updated_at = new Date();
  let _promise = new Promise ((resolve, reject) => {
    app.service('transactions').update(transaction_id, transObj, { headers: {'Authorization': auth_token }}).then(res => {
      resolve(res);
    }).catch(err => {
      resolve({ error: err.name, message: err.message });
    });
  })
  return Promise.resolve(_promise).then(ress => {
    return ress
  }).catch(errr => {
    return {error: errr.name, message: 'Internal server error.'}
  })
}

let userDetailsEntry = async (function (userDetail, packageObj, basicPackageObj, u_id, config, checkout_res, app, transaction_id, transObj) {
  let res = await (addUserSubscription(packageObj, basicPackageObj, app, transaction_id, transObj, config.headers.authorization))
  if(res.hasOwnProperty('error')) {
    res.transaction_id = transaction_id
    return res
  } else {
    if (packageObj.type == 'basic') {
      // console.log('=========addUserSubscription=========>', res)
      let planName = res.id.substr(res.id.length - 5) + "-" +  packageObj.name + "-" + moment(packageObj.expiredOn).format('DD-MMM-YYYY')
      if (userDetail.data.package) {
        userDetail.data.package[res.id] = {"subscriptionId": res.id, "role": "admin", "name": planName}
      } else {
        userDetail.data.package={}
        userDetail.data.package[res.id] = {"subscriptionId": res.id, "role": "admin", "name": planName}
      }

      let updUsrSub = await (updateUserPackageDetails(app, userDetail, u_id, config, res, transaction_id, transObj, config.headers.authorization));
      if(updUsrSub.hasOwnProperty('error')) {
        updUsrSub.transaction_id = transaction_id
        return updUsrSub
      } else {
        // console.log('=========updateUserPackageDetails=========>', updUsrSub)
        let revSub = await (reverseSubscription(res, app, transaction_id, transObj, config.headers.authorization));
        if(revSub.hasOwnProperty('error')) {
          revSub.transaction_id = transaction_id
          return revSub
        }
        // console.log("=========reverseSubscription=========>", revSub)
      }
    }
  }
  return true
})

let addUserSubscription = function(packageObj, basicPackageObj, app, transaction_id, transObj, auth_token) {
  let _promise, promise
  if (basicPackageObj != null) {
    _promise = new Promise ((resolve, reject) => {
      app.service('user-addon').create(packageObj).then(res => {
        transObj.transaction_status = 'user_subscribed'
        resolve(res)
      }).catch(err => {
        resolve({ error: err.name, message: err.message })
      })
    })
    promise = new Promise ((resolve, reject) => {
      app.service('user-subscription').update(basicPackageObj.id, basicPackageObj).then(res => {
        transObj.transaction_status = 'completed'
        resolve(res)
      }).catch(err => {
        resolve({ error: err.name, message: err.message })
      })
    })
  } else {
    _promise = new Promise ((resolve, reject) => {
      app.service('user-subscription').create(packageObj).then(res => {
        transObj.transaction_status = 'user_subscribed'
        resolve(res)
      }).catch(err => {
        resolve({ error: err.name, message: err.message })
      })
    })
  }
  let update_trans = await (updateTransaction(app, transaction_id, transObj, auth_token));
  return Promise.resolve(_promise).then(ress => {
    return ress
  }).catch(errr => {
    return {error: errr.name, message: 'Internal server error.'}
  })
}

let updateUserPackageDetails = async function(app, userDetail, u_id, config, res, transaction_id, transObj, auth_token) {
  let paidFor = res.id;
  let _promise = new Promise ((resolve, reject) => {
    axios.put(config1.update_user_url + u_id, {"package":userDetail.data.package, "defaultSubscriptionId": res.id}, config)
    .then(res => {
      transObj.transaction_status = 'user_updated'
      transObj.paid_for_subscription = paidFor
      console.log('User ',  u_id, ' has subscribed  package successfully..!')
      resolve(res)
    })
    .catch(err => {
      resolve({error: err.name, message: 'Internal server error.'})
    })
  })
  let update_trans = await (updateTransaction(app, transaction_id, transObj, auth_token));
  return Promise.resolve(_promise).then(ress => {
    return ress
  }).catch(errr => {
    return {error: errr.name, message: 'Internal server error.'}
  })
}

let reverseSubscription = async function (res, app, transaction_id, transObj, auth_token) {
  let _promise = new Promise ((resolve, reject) => {
    app.service('reverse-subscription').create({"subscriptionId": res.id}).then(res => {
      console.log('subscriptionId : ', res.subscriptionId)
      transObj.transaction_status = 'completed'
      resolve(res)
    }).catch(err => {
      resolve({ error: err.name, message: err.message })
    })
  })
  let update_trans = await (updateTransaction(app, transaction_id, transObj, auth_token));
  return Promise.resolve(_promise).then(ress => {
    return ress
  }).catch(errr => {
    return {error: errr.name, message: 'Internal server error.'}
  })
}

let makePackageObj = async (function (subData, trans_id, subscribed, userDetail) {
  var exdate = moment().add(subData.validity, 'months').format()
  /* if (subscribed != null) {
    if(moment(subscribed.expiredOn).diff(moment().format(), 'months') <= 0) {
      exdate = moment().add(subData.validity, 'months').format()
    } else {
      exdate = moment(subscribed.expiredOn).add(subData.validity, 'months').format()
    }
  } else {
    exdate = moment().add(subData.validity, 'months').format()
  } */
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
          if (service[k][j].value !== '') {
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

  // console.log('==>', JSON.stringify(detail))
  return {
    userId: userDetail.data._id,
    expiredOn : exdate,
    details : detail,
    sub_id : subData.id,
    trans_id: trans_id,
    name: subData.name,
    type: subData.type,
    price: subData.price,
    time_unit: subData.time_unit,
    createdAt: new Date(),
    validity: subData.validity
  }
})

let makeAddonPackageObj = async (function (subData, trans_id, subscribed, userDetail) {
  var exdate  = moment().add(subData.validity, 'months').format()
  var updateDate = await (checkExpiry(subscribed.expiredOn))
  subscribed.expiredOn = moment(updateDate).add(subData.validity, 'months').format()
  subscribed.updatedOn = new Date();
  /* if (subscribed != null) {
    if(subData.validity != '0') {
      subscribed.expiredOn = moment(subscribed.expiredOn).add(subData.validity, 'months').format()
    } else {
      exdate = subscribed.expiredOn
    }
  } else {
    exdate = moment().add(subData.validity, 'months').format()
  } */
  var detail = {}
  subData.details = await (_.filter(subData.details,function(o) {
    return o.value > 0
  }))
  let module = _.groupBy(subData.details, "module")
  Object.keys(module).forEach(function(key) {
    let service = _.groupBy(module[key], "service")

    for (let i = 0; i < module[key].length; i++) {
      detail[module[key][i].module] = {}

      Object.keys(service).forEach(function(k) {
        detail[module[key][i].module][k] = {}

        for (let j = 0; j < service[k].length; j++) {
          if (service[k][j].value !== '') {
            let actionVal = parseInt(service[k][j].value)
            detail[module[key][i].module][k][service[k][j].action] = actionVal
            if(subscribed != null ) {
              // console.log('>>>1>>>', service[k], '>>>>2>>>', service[k][j], )
              // console.log('>>>>>>> ', subscribed.details[module[key][i]], '>>', subscribed.details[module[key][i].module][k], ' >>> ', subscribed.details[module[key][i].module][k][service[k][j].action])
              subscribed.details[module[key][i].module][k][service[k][j].action] += actionVal
            }
          }
        }
        if (Object.keys(detail[module[key][i].module][k]).length < 1) {
        	delete detail[module[key][i].module][k]
        }
      })
    }
  })
  return [{
    userId: userDetail.data._id,
    expiredOn : exdate,
    details : detail,
    sub_id : subData.id,
    trans_id: trans_id,
    name: subData.name,
    type: subData.type,
    basicPlan: subscribed.id,
    price: subData.price,
    time_unit: subData.time_unit,
    createdAt: new Date(),
    validity: subData.validity
  }, subscribed]
})

let checkExpiry = async (function (exDate) {
  let compDate = moment(exDate).format('YYYY-MM-DD')
  let compWith = moment().format('YYYY-MM-DD')
  let checkDate = moment(compDate).diff(compWith,'days')
  if(checkDate <= 0) {
    return moment().format()
  } else {
    return exDate
  }
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
