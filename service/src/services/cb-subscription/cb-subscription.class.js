const config = require('../config.js');
let async = require('asyncawait/async');
let await = require('asyncawait/await');

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
      return res.subscription;
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
  return config.chargebee.subscription.list({ limit : limit, "customer_id[is]": user_id }).request(function (error, result) {
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
  transaction_id = await (initiateTransaction(data, params));
  if (transaction_id.hasOwnProperty('error')) {
    return transaction_id;
  }
  console.log('transaction_id : ', transaction_id);

  return config.chargebee.subscription.create(data).request(function (error, result) {
    if (error) {
      console.log('>>>ERROR:: ', error);
      return error;
    } else {
      console.log('>>>RESULT:: ', result);
      return result;
    }
  });
});

let updateSubscription = function (id, data, params) {
  return config.chargebee.subscription.update(id, data).request((error, result) => {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

let subscribeForCustomer = function (id, data, params) {
  return config.chargebee.subscription.create_for_customer(id, data).request(function(error,result) {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

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
  console.log('Transaction initiated');
  let app = params.app;
  let paymentObj = data.card;
  transObj.user_details = { 'user_id': params.userPackageDetails._id, 'email': params.userPackageDetails.email };
  transObj.pay_request = paymentObj;

  return app.service('transactions').create(transObj,{headers: {'Authorization': params.headers.authorization }}).then(res => {
    return res.id;
  }).catch(err => {
    return { error: err.name, message: err.message };
  });
};

module.exports = function (options) {
  return new Service(options);
};


module.exports.Service = Service;
