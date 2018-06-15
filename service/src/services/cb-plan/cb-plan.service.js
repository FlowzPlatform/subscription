// Initializes the `cb-plan` service on path `/cb-plan`
const createService = require('./cb-plan.class.js');
const hooks = require('./cb-plan.hooks');
const filters = require('./cb-plan.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'cb-plan',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/cb-plan', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('cb-plan');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
