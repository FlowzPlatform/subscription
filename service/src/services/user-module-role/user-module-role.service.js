// Initializes the `user-module-role` service on path `/user-module-role`
const createService = require('feathers-rethinkdb');
const hooks = require('./user-module-role.hooks');
const filters = require('./user-module-role.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'user_module_role',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/user-module-role', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('user-module-role');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
