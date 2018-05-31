const authentication = require('feathers-authentication');
const jwt = require('@feathersjs/authentication-jwt');

module.exports = {
  before: {
    all: [
      authentication.hooks.authenticate(['jwt']),
      hook => modify(hook)
    ],
    find: [],
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

function modify(hook) {
  hook.params.app = hook.app;
}