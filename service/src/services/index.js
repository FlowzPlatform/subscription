const defaultSubscription = require('./default-subscription/default-subscription.service.js');
const secureRoutes = require('./secure-routes/secure-routes.service.js');
const checkout = require('./checkout/checkout.service.js');
const subscriptionPlans = require('./subscription-plans/subscription-plans.service.js');
const registerResource = require('./register-resource/register-resource.service.js');
const registerRoles = require('./register-roles/register-roles.service.js');
const registerPermissionScope = require('./register-permission-scope/register-permission-scope.service.js');
const userSubscription = require('./user-subscription/user-subscription.service.js');
const reverseSubscription = require('./reverse-subscription/reverse-subscription.service.js');
const invite = require('./invite/invite.service.js');

module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(defaultSubscription);
  app.configure(secureRoutes);
  app.configure(checkout);
  app.configure(subscriptionPlans);
  app.configure(registerResource);
  app.configure(registerRoles);
  app.configure(registerPermissionScope);
  app.configure(userSubscription);
  app.configure(reverseSubscription);
  app.configure(invite);
};
