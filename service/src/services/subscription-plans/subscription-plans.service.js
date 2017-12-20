// Initializes the `subscription-plans` service on path `/subscription-plans`
const createService = require('feathers-rethinkdb');
const hooks = require('./subscription-plans.hooks');
const filters = require('./subscription-plans.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'subscription_plans',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/subscription-plans', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('subscription-plans');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
