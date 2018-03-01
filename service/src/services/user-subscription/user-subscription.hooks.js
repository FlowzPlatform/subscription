const errors = require('feathers-errors')

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
    hook.params.query = {
      userId: hook.params.userPackageDetails._id,
      $limit: hook.params.query.$limit
    } 
  } else {
    throw new errors.NotAuthenticated('Invalid token');
  }
}
