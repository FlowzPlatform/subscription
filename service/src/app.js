const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');

const rethinkdb = require('./rethinkdb');
const subscription = require('flowz-subscription');

const authentication = require('feathers-authentication');
const jwt = require('@feathersjs/authentication-jwt');
const config = require('./services/config.js');

// const mongodb = require('./mongodb');

const app = feathers();

// Load app configuration
app.configure(configuration(path.join(__dirname, '..')));
// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', feathers.static(app.get('public')));

app.use(function(req, res, next) {
  this.apiHeaders = req.headers ;
  next();
});

// Set up Plugins and providers
app.configure(hooks());
// app.configure(mongodb);
app.configure(rethinkdb);
app.configure(rest());
app.configure(socketio());

app.configure(authentication({ secret: config.secret }));
app.configure(jwt({service : 'cb-plan'}));

app.use(subscription.featherSubscription);
// Set up our services (see `services/index.js`)
app.configure(services);
// Configure middleware (see `middleware/index.js`) - always has to be last
app.configure(middleware);
app.hooks(appHooks);

module.exports = app;
