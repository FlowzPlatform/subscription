// Initializes the `user-addon` service on path `/user-addon`
const createService = require('feathers-rethinkdb');
const hooks = require('./user-addon.hooks');
const filters = require('./user-addon.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'user_addon',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/user-addon', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('user-addon');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
