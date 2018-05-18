const config = require('../config.js');
let async = require('asyncawait/async');
let await = require('asyncawait/await');
const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;

/* eslint-disable no-unused-vars */
class Service {
  constructor (options) {
    this.options = options || {};
  }
 
  setup (app) {
    this.app = app;
  }

  find (params) {
    let result = getAddonList(params); 
    
    return Promise.resolve(result).then(res => {
      return res.list;
    }).catch(err => {
      return err;
    });
  }

  get (id, params) {
    let result =  retrieveAddon(id, params);

    return Promise.resolve(result).then(res => {
      return res.addon;
    }).catch(err => {
      return err;
    });
  }

  create (data, params) {
    let result = createAddon(data, params);
  
    return Promise.resolve(result).then(res => {
      return res.addon;
    }).catch(err => {
      return err;
    });
  }

  update (id, data, params) {
    let result = updateAddon(id, data, params);
    
    return Promise.resolve(result).then(res => {
      return res.addon;
    }).catch(err => {
      return err;
    });
  }

  patch (id, data, params) {
    return Promise.resolve(data);
  }

  remove (id, params) {
    let result = deleteAddon(id, params);

    return Promise.resolve(result).then(res => {
      return res.addon;
    }).catch(err => {
      return err;
    });
  }
}

let getAddonList = function (params) {
  let limit = params.query.limit || 10;

  return config.chargebee.addon.list({ paginate: false }).request((error, result) => {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

let retrieveAddon = function (id, params) {
  return config.chargebee.addon.retrieve(id).request((error, result) => {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

let createAddon = function (data, params) {
  return config.chargebee.addon.create(data).request((error,result) => {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

let updateAddon = function (id, data, params) {
  return config.chargebee.addon.update(id, data).request((error, result) => {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

let deleteAddon = function (id, params) {
  return config.chargebee.addon.delete(id).request((error, result) => {
    if (error) {
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
