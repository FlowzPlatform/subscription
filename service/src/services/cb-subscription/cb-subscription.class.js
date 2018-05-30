const config = require('../config.js');
const axios = require('axios');
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const rp = require('request-promise');
const _ = require('lodash');
const moment = require('moment');

moment().format();

let transaction_id;
let transObj = {
  transaction_status: 'Initiated',
  payment_status: false,
  created_at: new Date(),
  updated_at: new Date()
};
/* eslint-disable no-unused-vars */
class Service {
  constructor (options) {
    this.options = options || {};
  }

  setup(app){
    this.app = app;
  }

  find (params) {
    let result = subscriptionList(params);

    return Promise.resolve(result).then(res => {
      return res.list;
    }).catch(err => {
      return err;
    });
  }

  get (id, params) {
    let result = retrieveSubscription(id, params);

    return Promise.resolve(result).then(res => {
      return res;
    }).catch(err => {
      return err;
    });
  }

  create (data, params) {
    let result = createSubscription(data, params);

    return Promise.resolve(result).then(res => {
      return res;
    }).catch(err => {
      return err;
    });
  }

  update (id, data, params) {
    let result = updateSubscription (id, data, params);

    return Promise.resolve(result).then(res => {
      return res;
    }).catch(err => {
      return err;
    });
  }

  patch (id, data, params) {
    let result = subscribeForCustomer(id, data, params);
    console.log(id, data, params);

    return Promise.resolve(result).then(res => {
      return res;
    }).catch(err => {
      return err;
    });
  }

  remove (id, params) {
    let result = deleteSubscription(id);
    return Promise.resolve(result).then(res => {
      return res.subscription;
    }).catch(err => {
      return err;
    });
  }
}

let subscriptionList = function (params) {
  let limit = params.query.limit || 10;
  let user_id = params.query.customer_id;
  let plan_id = params.query.plan_id;
  let req_obj = { 
    limit : limit 
  };
  req_obj["customer_id[is]"] = user_id;
  req_obj["plan_id[is]"] = plan_id;
  return config.chargebee.subscription.list(req_obj).request(function (error, result) {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

let retrieveSubscription = function (id, params) {
  return config.chargebee.subscription.retrieve(id).request(function (error, result) {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

let createSubscription = async(function (data, params) {
  //INITIATE NEW TRANSACTION 
  transaction_id = await (initiateTransaction(data, params));
  if (transaction_id.hasOwnProperty('api_error_code')) {
    return transaction_id;
  }
  console.log('transaction_id : ', transaction_id);

  //CREATE SUBSCRIPTION USING CHARGEBEE API
  return config.chargebee.subscription.create(data).request(async (function (error, result) {
    if (error) {
      //UPDATE TRANSACTION FOR FAILED TRANSACTION
      transObj.pay_response = error;
      transObj.transaction_status = 'Failed';
      let updated = await(updateTransaction(transObj, params));
      if (updated.hasOwnProperty('api_error_code')) {
        return updated;
      }
      console.log('createSubscription ERROR:: ', error);
      return error;
    } else {
      //UPDATE TRANSACTION FOR SUCCESSFULL PAYMENT
      transObj.pay_response = result.invoice || {};
      transObj.transaction_status = 'Paid';
      transObj.payment_status = true;
      
      let updated = await (updateTransaction(transObj, params));
      if (updated.hasOwnProperty('api_error_code')) {
        return updated;
      }

      //GET PLAN DETAILS WITH META_DATA FOR UPDATE OUR LOCAL USER-SUBSCRIPTION API
      let plan = await(getPlanMetaData(result.subscription.plan_id, params));
      let detail = {};
      let module = _.groupBy(plan.meta_data.details, "module");
      Object.keys(module).forEach(function(key) {
        let service = _.groupBy(module[key], "service");
        for (let i = 0; i < module[key].length; i++) {
          detail[module[key][i].module] = {};
          Object.keys(service).forEach(function(k) {
            detail[module[key][i].module][k] = {};
            for (let j = 0; j < service[k].length; j++) {
              if (service[k][j].value !== '') {
                let actionVal = parseInt(service[k][j].value);
                detail[module[key][i].module][k][service[k][j].action] = actionVal;
              }
            }
            if (Object.keys(detail[module[key][i].module][k]).length < 1) {
              delete detail[module[key][i].module][k];
            }
          });
        }
      });
      //CREATE PACKAGEOBJ TO UPDATE IN USER-SUBSCRIPTION
      plan.price /= 100;
      result.subscription.current_term_end = moment.unix(result.subscription.current_term_end).format();
      
      let packageObj = {
        "details": detail,
        "expiredOn": result.subscription.current_term_end,
        "name": plan.name,
        "price": plan.price,
        "sub_id": result.subscription.id,
        "plan_id": result.subscription.plan_id,
        "time_unit": result.subscription.billing_period_unit,
        "trans_id": result.invoice.linked_payments,
        "userId": result.subscription.customer_id,
        "validity": result.subscription.billing_period
      }
      //CALLING LOCAL API USER-SUBSCRIPTION TO ADD SUBSCRIPTION DETAILS LOCALLY
      let userSub = await (addUserSubscription(packageObj, params));
      if (userSub.hasOwnProperty('api_error_code')) {
        return userSub;
      }
      //UPDATING TRANSACTION FOR USER_UPDATED
      transObj.transaction_status = 'user_updated';
      updated = await (updateTransaction(transObj, params));
      if (updated.hasOwnProperty('api_error_code')) {
        return updated;
      }
      //GETING USER DETAILS FROM OUR USER DETAILS API TO UPDATE PACKAGE DETAILS OF USER
      let userDetails = await (getUserDetails(params));
      if (userDetails.hasOwnProperty('api_error_code')) {
        return userDetails;
      }
      //ADD SUBSCRIBED PACKAGE RECORD IN USER DETAILS API
      let planName = userSub.id.substr(userSub.id.length - 5) + "-" +  plan.name + "-" + moment(packageObj.expiredOn).format('DD-MMM-YYYY');
      if (userDetails.data.package) {
        userDetails.data.package[userSub.id] = { "subscriptionId": userSub.id, "role": "admin", "name": planName };
      } else {
        userDetails.data.package = {};
        userDetails.data.package[userSub.id] = { "subscriptionId": userSub.id, "role": "admin", "name": planName };
      }
      let updateUserSub = await (updateUserPackageDetails(userDetails, result.subscription.customer_id, userSub.id, params));
      if (updateUserSub.hasOwnProperty('api_error_code')) {
        return updateUserSub;
      }

      transObj.transaction_status = 'completed';
      updated = await (updateTransaction(transObj, params));
      if (updated.hasOwnProperty('api_error_code')) {
        return updated;
      }
      result.transaction_id = transaction_id;
      console.log('createSubscription RESULT:: ', result);
      return result;
    }
  }));
});

let updateSubscription = async (function (id, data, params) {
  let app = params.app;
  //INITIATE NEW TRANSACTION 
  transaction_id = await (initiateTransaction(data, params));
  if (transaction_id.hasOwnProperty('api_error_code')) {
    return transaction_id;
  }
  console.log('transaction_id : ', transaction_id);

  // console.log('PARAMS :: ',params.userPackageDetails._id);
  return config.chargebee.subscription.update(id, data).request(async (function(error, result) {
    if (error) {
      //UPDATE TRANSACTION FOR FAILED TRANSACTION
      transObj.pay_response = error;
      transObj.transaction_status = 'Failed';
      let updated = await(updateTransaction(transObj, params));
      if (updated.hasOwnProperty('api_error_code')) {
        return updated;
      }
      console.log('updateSubscription ERROR:: ', error);
      return error;
    } else {
      let obj = {};
      obj.addon_id = data.addons[0].id; // CHANGES OF CHECKOUT.VUE PAGE payFunction()
      obj.customer_id = params.userPackageDetails._id
      app.service('cb-addons-user').create(obj, { headers: {'Authorization': params.headers.authorization} }).then(res => {
        console.log('cb-addons-user :: ', res);
      }).catch(err => {
        console.log('Error cb-addons-use', err);
      });

      //UPDATE TRANSACTION FOR SUCCESSFULL PAYMENT
      transObj.pay_response = result.invoice || {};
      transObj.transaction_status = 'Paid';
      transObj.payment_status = true;

      let updated = await (updateTransaction(transObj, params));
      if (updated.hasOwnProperty('api_error_code')) {
        return updated;
      }

      //GET USER-SUBSCRIPTION TO UPDATE ALREADY AVAILABLE SUBSCRIPTION
      let userSubscription = await(getUserSubscription(id, params));
      
      if (userSubscription.hasOwnProperty('api_error_code')) {
        return userSubscription;
      }

      //GET PLAN DETAILS WITH META_DATA FOR UPDATE OUR LOCAL USER-SUBSCRIPTION API
      // let plan = await(getPlanMetaData(result.subscription.plan_id, params));
      let addon = await(getAddonMetaData(data.addons[0].id, params));
      var detail = {};
      addon.meta_data.details = await (_.filter(addon.meta_data.details,function(o) {
        return o.value > 0;
      }));
      let subscribed = userSubscription[0].details;
      let module = _.groupBy(addon.meta_data.details, "module")
      Object.keys(module).forEach(function(key) {
        let service = _.groupBy(module[key], "service");
        for (let i = 0; i < module[key].length; i++) {
          detail[module[key][i].module] = {}
          Object.keys(service).forEach(function(k) {
            detail[module[key][i].module][k] = {}
            for (let j = 0; j < service[k].length; j++) {
              if (service[k][j].value !== '') {
                let actionVal = parseInt(service[k][j].value)
                detail[module[key][i].module][k][service[k][j].action] = actionVal
                if(subscribed != null ) {
									if (subscribed[module[key][i].module][k] != undefined) {
										if (subscribed[module[key][i].module][k][service[k][j].action] != undefined) {
											subscribed[module[key][i].module][k][service[k][j].action] += actionVal
										}
									}
                }
              }
            }
            if (Object.keys(detail[module[key][i].module][k]).length < 1) {
              delete detail[module[key][i].module][k]
            }
          });
          break;
        }
      });
      
      //PATCH REQUEST ON USER-SUBSCRIPTION TO UPDATE USER PACKAGE DETAILS
      let updatedSubscription = await(updateUserSubscription(userSubscription[0].id, {'details': subscribed}, params));
      console.log('updateSubscription: updatedSubscription');
      if (updatedSubscription.hasOwnProperty('api_error_code')) {
        return updatedSubscription;
      }

      //UPDATING TRANSACTION FOR USER_UPDATED
      transObj.transaction_status = 'user_updated';
      updated = await (updateTransaction(transObj, params));
      if (updated.hasOwnProperty('api_error_code')) {
        return updated;
      }

      result.transaction_id = transaction_id;
      console.log('updateSubscription RESULT ::', result);
      return result;
    }
  }));
});

let subscribeForCustomer = async(function (id, data, params) {
  //INITIATE NEW TRANSACTION 
  transaction_id = await (initiateTransaction(data, params));
  if (transaction_id.hasOwnProperty('api_error_code')) {
    return transaction_id;
  }
  console.log('transaction_id : ', transaction_id);

  return config.chargebee.subscription.create_for_customer(id, data).request(async(function(error,result) {
    if (error) {
      //UPDATE TRANSACTION FOR FAILED TRANSACTION
      transObj.pay_response = error;
      transObj.transaction_status = 'Failed';
      let updated = await(updateTransaction(transObj, params));
      if (updated.hasOwnProperty('api_error_code')) {
        return updated;
      }
      console.log('subscribeForCustomer ERROR:: ', error);
      return error;
    } else {
       //UPDATE TRANSACTION FOR SUCCESSFULL PAYMENT
      transObj.pay_response = result.invoice || {};
      transObj.transaction_status = 'Paid';
      transObj.payment_status = true;
      
      let updated = await (updateTransaction(transObj, params));
      if (updated.hasOwnProperty('api_error_code')) {
        return updated;
      }
       //GET PLAN DETAILS WITH META_DATA FOR UPDATE OUR LOCAL USER-SUBSCRIPTION API
      let plan = await(getPlanMetaData(result.subscription.plan_id, params));
      let detail = {};
      let module = _.groupBy(plan.meta_data.details, "module");
      Object.keys(module).forEach(function(key) {
        let service = _.groupBy(module[key], "service");
        for (let i = 0; i < module[key].length; i++) {
          detail[module[key][i].module] = {};
          Object.keys(service).forEach(function(k) {
            detail[module[key][i].module][k] = {};
            for (let j = 0; j < service[k].length; j++) {
              if (service[k][j].value !== '') {
                let actionVal = parseInt(service[k][j].value);
                detail[module[key][i].module][k][service[k][j].action] = actionVal;
              }
            }
            if (Object.keys(detail[module[key][i].module][k]).length < 1) {
              delete detail[module[key][i].module][k];
            }
          });
        }
      });

       //CREATE PACKAGEOBJ TO UPDATE IN USER-SUBSCRIPTION
      plan.price /= 100;
      result.subscription.current_term_end = moment.unix(result.subscription.current_term_end).format();
      
      let packageObj = {
        "details": detail,
        "expiredOn": result.subscription.current_term_end,
        "name": plan.name,
        "price": plan.price,
        "sub_id": result.subscription.id,
        "plan_id": result.subscription.plan_id,
        "time_unit": result.subscription.billing_period_unit,
        "trans_id": result.invoice.linked_payments,
        "userId": result.subscription.customer_id,
        "validity": result.subscription.billing_period
      }
        //CALLING LOCAL API USER-SUBSCRIPTION TO ADD SUBSCRIPTION DETAILS LOCALLY
      let userSub = await (addUserSubscription(packageObj, params));
      if (userSub.hasOwnProperty('api_error_code')) {
        return userSub;
      }
      //UPDATING TRANSACTION FOR USER_UPDATED
      transObj.transaction_status = 'user_updated';
      updated = await (updateTransaction(transObj, params));
      if (updated.hasOwnProperty('api_error_code')) {
        return updated;
      }
      //GETING USER DETAILS FROM OUR USER DETAILS API TO UPDATE PACKAGE DETAILS OF USER
      let userDetails = await (getUserDetails(params));
      if (userDetails.hasOwnProperty('api_error_code')) {
        return userDetails;
      }
      //ADD SUBSCRIBED PACKAGE RECORD IN USER DETAILS API
      let planName = userSub.id.substr(userSub.id.length - 5) + "-" +  plan.name + "-" + moment(packageObj.expiredOn).format('DD-MMM-YYYY');
      if (userDetails.data.package) {
        userDetails.data.package[userSub.id] = { "subscriptionId": userSub.id, "role": "admin", "name": planName };
      } else {
        userDetails.data.package = {};
        userDetails.data.package[userSub.id] = { "subscriptionId": userSub.id, "role": "admin", "name": planName };
      }
      let updateUserSub = await (updateUserPackageDetails(userDetails, result.subscription.customer_id, userSub.id, params));
      if (updateUserSub.hasOwnProperty('api_error_code')) {
        return updateUserSub;
      }

      transObj.transaction_status = 'completed';
      updated = await (updateTransaction(transObj, params));
      if (updated.hasOwnProperty('api_error_code')) {
        return updated;
      }
      result.transaction_id = transaction_id;
      console.log('subscribeForCustomer RESULT:: ', result);
      return result;
    }
  }));
});

let deleteSubscription = function (id) {
  return config.chargebee.subscription.delete(id).request(function (error, result) {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

let initiateTransaction = function (data, params) {
  return new Promise((resolve, reject) => {
    transObj = {
      transaction_status: 'Initiated',
      payment_status: false,
      created_at: new Date(),
      updated_at: new Date()
    }
    console.log('Transaction initiated');
    let app = params.app;
    let paymentObj = data.card || {};
    transObj.user_details = { 'user_id': params.userPackageDetails._id, 'email': params.userPackageDetails.email };
    transObj.pay_request = paymentObj;

    app.service('transactions').create(transObj,{headers: {'Authorization': params.headers.authorization }}).then(res => {
      resolve(res.id);
    }).catch(err => {
      reject({ api_error_code: err.name, error_msg: 'Internal server error.' });
    });
  });
};

let updateTransaction = function (transObj, params) {
  return new Promise((resolve, reject) => {
    console.log('Transaction updated');
    transObj.updated_at = new Date();
    let app = params.app;

    app.service('transactions').update(transaction_id, transObj, {headers: {'Authorization': params.headers.authorization }}).then(res => {
      resolve(res);
    }).catch(err => {
      reject({api_error_code: err.name, error_msg: 'Internal server error.'});
    });
  });
};

let getPlanMetaData = function (plan_id, params) {
  return new Promise ((resolve, reject) => {
    let app = params.app;
    app.service('cb-plan').get(plan_id, {headers: {'Authorization': params.headers.authorization }}).then(res => {
      resolve(res);
    }).catch(err => {
      reject({api_error_code: err.name, error_msg: 'Internal server error.'});
    });
  });
};

let getAddonMetaData = function (addon_id, params) {
  return new Promise ((resolve, reject) => {
    let app = params.app;
    app.service('cb-addon').get(addon_id, {headers: {'Authorization': params.headers.authorization }}).then(res => {
      resolve(res);
    }).catch(err => {
      reject({api_error_code: err.name, error_msg: 'Internal server error.'});
    });
  });
};

let addUserSubscription = function (packageObj, params) {
  return new Promise ((resolve, reject) => {
    let app = params.app;
    packageObj.createdAt = new Date();
    app.service('user-subscription').create(packageObj).then(res => {
      console.log('user-subscription id', res.id);
      resolve(res);
    }).catch(err => {
      reject({api_error_code: err.name, error_msg: 'Internal server error.'});
    });
  });
};

let getUserSubscription = function (sub_id, params) {
  return new Promise ((resolve, reject) => {
    let app = params.app;
    let query = {
      query: { 
        sub_id: sub_id,
        paginate: 'false' 
      },
      headers: {'authorization': params.headers.authorization},
      userPackageDetails: { '_id': transObj.user_details.user_id }
    };
    app.service('user-subscription').find(query).then(res => {
      resolve(res);
    }).catch(err => {
      reject({api_error_code: err.name, error_msg: 'Internal server error.'});
    });
  });
};

let updateUserSubscription = function (id, data, params) {
  return new Promise ((resolve, reject) => {
    let app = params.app;
    app.service('user-subscription').patch(id, data, { headers: {'Authorization': params.headers.authorization } }).then(res => {
      resolve(res);
    }).catch(err => {
      reject({api_error_code: err.name, error_msg: 'Internal server error.'});
    });
  });
}

let updateUserPackageDetails = function(userDetails, customer_id, defaultSubId, params) {
  return new Promise ((resolve, reject) => {
    return axios.put(config.update_user_url + customer_id, {"package":userDetails.data.package, "defaultSubscriptionId": defaultSubId}, { headers: {'Content-Type': 'application/json', 'authorization': params.headers.authorization } }).then(res => {
      console.log('User ',  customer_id, ' has subscribed  package successfully..!');
      resolve(res);
    }).catch(err => {
      reject({ error: err.name, message: 'Internal server error.' });
    });
  });
};

let getUserDetails = function (params) {
  return new Promise ((resolve, reject) => {
    let options = {
      uri: config.user_detail_url,
      headers: { 'authorization': params.headers.authorization }
    }
    rp(options).then(function (userDetail) {
      resolve(JSON.parse(userDetail));
    }).catch(function (err) {
      reject({api_error_code: err.name, error_msg: 'Internal server error.'});
    });
  });
};

module.exports = function (options) {
  return new Service(options);
};


module.exports.Service = Service;
