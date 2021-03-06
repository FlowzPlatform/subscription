// Initializes the `register-roles` service on path `/register-roles`
const createService = require('feathers-rethinkdb');
const hooks = require('./roles.hooks');
const filters = require('./roles.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'register_roles',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/roles', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('roles');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
