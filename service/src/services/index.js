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
const roles = require('./roles/roles.service.js');

const subscriptionInvitation = require('./subscription-invitation/subscription-invitation.service.js');

const transactions = require('./transactions/transactions.service.js');

const userAddon = require('./user-addon/user-addon.service.js');

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
  app.configure(subscriptionInvitation);
  app.configure(roles);
  app.configure(transactions);
  app.configure(userAddon);
};
