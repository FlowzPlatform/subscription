// Initializes the `cb-addons-user` service on path `/cb-addons-user`
const createService = require('feathers-rethinkdb');
const hooks = require('./cb-addons-user.hooks');
const filters = require('./cb-addons-user.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'cb_addons_user',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/cb-addons-user', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('cb-addons-user');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
