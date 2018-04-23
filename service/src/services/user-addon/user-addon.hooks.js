const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;

module.exports = {
  before: {
    all: [],
    find: [
      hook => findBefore(hook)
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

function findBefore(hook) {
  if(hook.params.userPackageDetails !== undefined && hook.params.userPackageDetails._id !== undefined){
    let query = {
      userId: hook.params.userPackageDetails._id
    };
    if(hook.params.query && hook.params.query.type) {
      query.type = hook.params.query.type;
    }
    if(hook.params.query && hook.params.query.basicPlan) {
      query.basicPlan = hook.params.query.basicPlan;
      // hook.params.query = {
      //  userId: hook.params.userPackageDetails._id,
      //   basicPlan: hook.params.query.basicPlan,
      //   $limit: hook.params.query.$limit
      // }  
    } /* else {
      hook.params.query = {
        userId: hook.params.userPackageDetails._id,
        $limit: hook.params.query.$limit
      } 
    } */
    if (hook.params.query && hook.params.query.$paginate) {
      hook.params.paginate = hook.params.query.$paginate === 'false' ? false : true;
      delete hook.params.query.$paginate;
    }
    hook.params.query = query;
  } else {
    throw new errors.NotAuthenticated('Invalid token');
  }
}