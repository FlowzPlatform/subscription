const config = require('../config.js');
/* eslint-disable no-unused-vars */
class Service {
  constructor (options) {
    this.options = options || {};
  }

  find (params) {
    let result = getCustomerList(params); 
    
    return Promise.resolve(result).then(res => {
      return res.list;
    }).catch(err => {
      return err;
    });
  }

  get (id, params) {
    let result =  retrieveCustomer(id, params);

    return Promise.resolve(result).then(res => {
      return res;
    }).catch(err => {
      return err;
    });
  }

  create (data, params) {
    let result = createCustomer(data, params);
  
    return Promise.resolve(result).then(res => {
      return res;
    }).catch(err => {
      return err;
    });
  }

  update (id, data, params) {
    return Promise.resolve(data);
  }

  patch (id, data, params) {
    let result = updateCustomerCard(id, data);
    return Promise.resolve(result).then(res => {
      return res;
    }).catch(err => {
      return err;
    });
  }

  remove (id, params) {
    return Promise.resolve({ id });
  }
}

let getCustomerList = function (params) {
  let limit = params.query.limit || 10;

  return config.chargebee.customer.list({ limit: limit }).request((error, result) => {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

let retrieveCustomer = function (id, params) {
  return config.chargebee.customer.retrieve(id).request((error, result) => {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

let createCustomer = function (data, params) {
  return config.chargebee.customer.create(data).request((error,result) => {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

let updateCustomerCard = function (id, data) {
  return config.chargebee.card.update_card_for_customer(id, data).request((error, result) => {
    if (error) {
      //handle error
      return error;
    } else {
      return result;
    }
  });
};

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
