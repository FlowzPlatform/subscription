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
    // if (hook.params.query.sub_id != undefined) {)
    // hook.params.query = {
    //   userId: hook.params.userPackageDetails._id,
    //   $limit: hook.params.query.$limit
    // };
    if (hook.params.query && hook.params.query.paginate) {
      hook.params.paginate = hook.params.query.paginate === 'false' ? false : true;
      delete hook.params.query.paginate;
    }
    hook.params.query.userId = hook.params.userPackageDetails._id;
    // hook.params.query.sub_id = hook.params.query.sub_id;
  } else {
    throw new errors.NotAuthenticated('Invalid token');
  }
}
