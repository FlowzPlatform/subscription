const authentication = require('feathers-authentication');
const jwt = require('@feathersjs/authentication-jwt');

module.exports = {
  before: {
    all: [
      authentication.hooks.authenticate(['jwt'])
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
