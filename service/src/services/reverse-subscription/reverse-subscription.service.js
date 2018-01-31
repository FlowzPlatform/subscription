// Initializes the `reverse-subscription` service on path `/reverse-subscription`
const createService = require('feathers-rethinkdb');
const hooks = require('./reverse-subscription.hooks');
const filters = require('./reverse-subscription.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'reverse_subscription',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/reverse-subscription', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('reverse-subscription');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
