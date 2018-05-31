// Initializes the `cb-addon` service on path `/cb-addon`
const createService = require('./cb-addon.class.js');
const hooks = require('./cb-addon.hooks');
const filters = require('./cb-addon.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'cb-addon',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/cb-addon', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('cb-addon');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
