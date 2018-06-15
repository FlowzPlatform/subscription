const config = require('../config.js');

/* eslint-disable no-unused-vars */
class Service {
  constructor (options) {
    this.options = options || {};
  }

  setup (app) {
    this.app = app;
  }

  find (params) {
    let result = getPlanList(params);

    return Promise.resolve(result).then(res => {
      return res.list;
    }).catch(err => {
      return err;
    });
  }

  get (id, params) {
    let result =  retrievePlan(id, params);

    return Promise.resolve(result).then(res => {
      return res.plan;
    }).catch(err => {
      return err;
    });
  }

  create (data, params) {
    let result = createPlan(data, params);
  
    return Promise.resolve(result).then(res => {
      return res.plan;
    }).catch(err => {
      return err;
    });
  }

  update (id, data, params) {
    let result = updatePlan(id, data, params);

    return Promise.resolve(result).then(res => {
      return res.plan;
    }).catch(err => {
      return err;
    });
  }

  patch (id, data, params) {
    let result = unarchivePlan(id, params);

    return Promise.resolve(result).then(res => {
      return res.plan;
    }).catch(err => {
      return err;
    });
  }

  remove (id, params) {
    let result = deletePlan(id, params);

    return Promise.resolve(result).then(res => {
      return res.plan;
    }).catch(err => {
      return err;
    });
  }
}

let getPlanList = function (params) {
  let limit = params.query.limit || 10;
  return config.chargebee.plan.list({ limit: limit }).request((error, result) => {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

let retrievePlan = function (id, params) {
  return config.chargebee.plan.retrieve(id).request((error, result) => {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

let createPlan = function (data, params) {
  return config.chargebee.plan.create(data).request((error,result) => {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

let updatePlan = function (id, data, params) {
  return config.chargebee.plan.update(id, data).request((error, result) => {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

let deletePlan = function (id, params) {
  return config.chargebee.plan.delete(id).request((error, result) => {
    if (error) {
      return error;
    } else {
      return result;
    }
  });
};

let unarchivePlan = function (id, params) {
  return config.chargebee.plan.unarchive(id).request((error, result) => {
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
