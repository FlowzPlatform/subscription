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

const cbPlan = require('./cb-plan/cb-plan.service.js');

const cbAddon = require('./cb-addon/cb-addon.service.js');

const cbSubscription = require('./cb-subscription/cb-subscription.service.js');

const cbCustomer = require('./cb-customer/cb-customer.service.js');

const cbAddonsUser = require('./cb-addons-user/cb-addons-user.service.js');

const cbChangefeeds = require('./cb-changefeeds/cb-changefeeds.service.js');

const userModuleRole = require('./user-module-role/user-module-role.service.js');

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
  app.configure(cbPlan);
  app.configure(cbAddon);
  app.configure(cbSubscription);
  app.configure(cbCustomer);
  app.configure(cbAddonsUser);
  app.configure(cbChangefeeds);
  app.configure(userModuleRole);
};
