// Initializes the `subscriptionInvitation` service on path `/subscription-invitation`
const createService = require('feathers-rethinkdb');
const hooks = require('./subscription-invitation.hooks');
const filters = require('./subscription-invitation.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'subscription_invitation',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/subscription-invitation', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('subscription-invitation');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
