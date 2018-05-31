// Initializes the `cb-subscription` service on path `/cb-subscription`
const createService = require('./cb-subscription.class.js');
const hooks = require('./cb-subscription.hooks');
const filters = require('./cb-subscription.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'cb-subscription',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/cb-subscription', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('cb-subscription');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
