const authentication = require('feathers-authentication');

module.exports = {
  before: {
    all: [
      authentication.hooks.authenticate(['jwt'])
    ],
    find: [
      hook => filterQuery(hook)
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

function filterQuery(hook) {
  if (hook.params.query && hook.params.query.paginate) {
    hook.params.paginate = hook.params.query.paginate === 'false' ? false : true;
    delete hook.params.query.paginate;
  }
}