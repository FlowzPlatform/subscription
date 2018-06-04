const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');
const subscription = require('flowz-subscription');
const flowzError = require('flowz-error-handler');
module.exports.subscription = subscription;
module.exports = function () {
  // Add your custom middleware here. Remember, that
  // in Express the order matters, `notFound` and
  // the error handler have to go last.
  const app = this;

  subscription.moduleResource.moduleName = 'subscription';
  let registerAppModule = {
    'roles': ['find', 'get'],
    'invite': ['create', 'remove'],
    'subscription-plans': ['create', 'update', 'patch', 'remove']
  };

  subscription.moduleResource.registerAppModule = registerAppModule;
  subscription.moduleResource.appRoles = ['Superadmin', 'admin'];
  subscription.registeredAppModulesRole();
  subscription.registerDynamicHooks(app, registerAppModule);

  app.use(flowzError());
  app.use(notFound());
  app.use(handler());
};
