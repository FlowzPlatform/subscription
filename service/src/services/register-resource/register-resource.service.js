// Initializes the `/register-resource` service on path `/register-resource`
const createService = require('feathers-rethinkdb');
const hooks = require('./register-resource.hooks');
const filters = require('./register-resource.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'register_resource',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/register-resource', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('register-resource');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
