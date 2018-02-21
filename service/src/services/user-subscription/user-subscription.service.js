// Initializes the `user-subscription` service on path `/user-subscription`
const createService = require('feathers-rethinkdb');
const hooks = require('./user-subscription.hooks');
const filters = require('./user-subscription.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'user_subscription',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/user-subscription', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('user-subscription');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
