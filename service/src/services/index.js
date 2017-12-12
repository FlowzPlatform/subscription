const defaultSubscription = require('./default-subscription/default-subscription.service.js');
const secureRoutes = require('./secure-routes/secure-routes.service.js');
const checkout = require('./checkout/checkout.service.js');
module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(defaultSubscription);
  app.configure(secureRoutes);
  app.configure(checkout);
};
