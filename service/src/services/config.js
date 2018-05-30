const config = require('../../config/default.json');
const fs = require('fs');

const chargebee = require('chargebee');
chargebee.configure({api_key: process.env.apiKey, site: process.env.site});

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
  },
  x_api_token: process.env.x_api_token,
  pay_url: "https://api." + process.env.domainKey + "/payment/payment",
  update_user_url: "https://api." + process.env.domainKey + "/user/updateuserdetails/",
  user_detail_url: "https://api." + process.env.domainKey + "/auth/api/userdetails",
  secret: process.env.secret,
  chargebee: chargebee
};

module.exports = rethinkdb;
