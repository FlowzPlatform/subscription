const config = require('../../config/default.json');
const fs = require('fs');

let ssl = process.env.cert ? { ca: fs.readFileSync(__dirname + process.env.cert) } : null
let rauth = process.env.rauth ? process.env.rauth : null
let rhost = process.env.RDBHost ? process.env.RDBHost : config.rethinkdb.servers[0].host
let rport = process.env.RDBPort ? process.env.RDBPort : config.rethinkdb.servers[0].port
let rdb = process.env.rdb ? process.env.rdb : config.rethinkdb.db
var rethinkdb = {
  rethinkdb: {
    db: rdb,
    servers: [{
      host: rhost,
      port: rport,
      authKey: rauth,
      ssl: ssl
    }]
  }
};

module.exports = rethinkdb;
