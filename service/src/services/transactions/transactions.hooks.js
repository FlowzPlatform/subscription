const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;
const axios = require('axios');
const config = require('../config');

module.exports = {
  before: {
    all: [
      hook => findBefore(hook)
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

async function findBefore(hook) {
  let auth_token = hook.params.headers.Authorization !== undefined ? hook.params.headers.Authorization : hook.params.headers.authorization
  if(auth_token !== undefined){
    let res = await isValidUser(auth_token)
    if(res.code == 401){
      throw new errors.NotAuthenticated('Invalid token');
    }
  } else {
    throw new errors.NotAuthenticated('Invalid token');
  }
}

async function isValidUser(auth_token) {
  return await axios.get(config.user_detail_url, {headers: {'Authorization': auth_token}})
  .then(parsedBody => {
    let userData = {
      'id': parsedBody.data.data._id,
      'email': parsedBody.data.data.email,
      'password': parsedBody.data.data.password
    }
    return userData
  }).catch(function (err) {
    return {"code" : 401 }
  })
}