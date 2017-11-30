// Initializes the `secure-routes` service on path `/secure-routes`
const createService = require('feathers-rethinkdb');
const hooks = require('./secure-routes.hooks');
const filters = require('./secure-routes.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'secure_routes',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/secure-routes', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('secure-routes');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
