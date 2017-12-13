// Initializes the `checkout` service on path `/checkout`
const createService = require('./checkout.class.js');
const hooks = require('./checkout.hooks');
const filters = require('./checkout.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'checkout',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/checkout', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('checkout');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
