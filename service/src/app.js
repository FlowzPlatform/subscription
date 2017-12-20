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
   console.log("app.use........" + Object.keys(req));
  //  console.log("res "+ JSON.stringify(req.res));
  //   console.log("==" + req.headers['x-api-token'] + "--");
  //   this.XApiToken = req.headers['x-api-token'];
    // this.XApiLogin = req.headers['authorization'];
    this.apiHeaders = req.headers ;
    console.log("this",  this.apiHeaders)
    // module.exports.apiHeaders = this.apiHeaders;
    // req.feathers = req.headers['x-api-token'];
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); next();
  });

// Set up Plugins and providers
app.configure(hooks());
// app.configure(mongodb);
app.configure(rethinkdb);
app.configure(rest());
app.configure(socketio());

// Set up our services (see `services/index.js`)
app.configure(services);
// Configure middleware (see `middleware/index.js`) - always has to be last
app.configure(middleware);
app.hooks(appHooks);

module.exports = app;
