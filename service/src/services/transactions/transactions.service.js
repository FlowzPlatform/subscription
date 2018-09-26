// Initializes the `transactions` service on path `/transactions`
const createService = require('feathers-rethinkdb');
const hooks = require('./transactions.hooks');
const filters = require('./transactions.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'transactions',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/transactions', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('transactions');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
