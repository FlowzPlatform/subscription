// Initializes the `customer` service on path `/customer`
const createService = require('./cb-customer.class.js');
const hooks = require('./cb-customer.hooks');
const filters = require('./cb-customer.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'cb-customer',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/cb-customer', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('cb-customer');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
