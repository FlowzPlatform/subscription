// Initializes the `/register-permission-scope` service on path `/register-permission-scope`
const createService = require('feathers-rethinkdb');
const hooks = require('./register-permission-scope.hooks');
const filters = require('./register-permission-scope.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'register_permission_scope',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/register-permission-scope', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('register-permission-scope');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
