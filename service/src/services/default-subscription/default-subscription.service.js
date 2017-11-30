// Initializes the `default_subscription` service on path `/default-subscription`
const createService = require('feathers-rethinkdb');
const hooks = require('./default-subscription.hooks');
const filters = require('./default-subscription.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'default_subscription',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/default-subscription', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('default-subscription');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
