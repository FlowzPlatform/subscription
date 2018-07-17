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
  if (hook.params.userPackageDetails !== undefined && hook.params.userPackageDetails._id !== undefined) {
    if (hook.params.query && hook.params.query.paginate) {
      hook.params.paginate = hook.params.query.paginate === 'false' ? false : true;
      delete hook.params.query.paginate;
    }
    hook.params.query.userId = hook.params.userPackageDetails._id;
  } else if (hook.params.headers['User-Agent'] == 'ChargeBee') {
    if (hook.params.query && hook.params.query.paginate) {
      hook.params.paginate = hook.params.query.paginate === 'false' ? false : true;
      delete hook.params.query.paginate;
    }
  } else {
    // console.log(hook.params.headers);
    throw new errors.NotAuthenticated('Invalid token');
  }
}
