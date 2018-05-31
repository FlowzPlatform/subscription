// Initializes the `cb-changefeeds` service on path `/cb-changefeeds`
const createService = require('feathers-rethinkdb');
const hooks = require('./cb-changefeeds.hooks');
const filters = require('./cb-changefeeds.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'cb_changefeeds',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/cb-changefeeds', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('cb-changefeeds');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
