let axios = require('axios');
let errors = require('@feathersjs/errors');
const async = require('asyncawait/async');
// const await = require('asyncawait/await'); 

module.exports = {
  before: {
    all: [],
    find: [
      hook => before_find(hook)
    ],
    get: [],
    create: [
      hook => before_create(hook)
    ],
    update: [],
    patch: [
      hook => before_patch(hook)
    ],
    remove: []
  },

  after: {
    all: [],
    find: [
      hook => after_find(hook)
    ],
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


function before_create(hook) {
  hook.data.assignDate = new Date();
  hook.data.isDeleted = false;
}

let before_find = async((hook) => {
  return validateUser(hook).then(result => {
    if(hook.params.query.own == 'false') {
      delete hook.params.query.own;
      hook.params.query.toEmail = result.data.data.email;
    } 
    if (!hook.params.query.isDeleted) {
      hook.params.query.isDeleted = false;
    } else {
      if (hook.params.query.isDeleted == 'true') {
        hook.params.query.isDeleted = true;
      }
      if (hook.params.query.isDeleted == 'false') {
        hook.params.query.isDeleted = false;
      }
    }
    return hook;
  }).catch(error=> { // eslint-disable-line no-unused-vars
    throw new errors.NotAuthenticated('Invalid token');
  });
});

let validateUser = (data) => { // eslint-disable-line no-unused-vars
  return axios.get('http://api.' + process.env.domainKey +'/auth/api/userdetails', {
    strictSSL: false,
    headers: {
      'Authorization': apiHeaders.authorization // eslint-disable-line no-undef
    }
  }).then(function (response) {
    return response;
  }).catch(function (error) { // eslint-disable-line no-unused-vars
    throw(error);
  });
};


function before_patch(hook) {
  hook.data.unassignDate = new Date(); 
}

function after_find(hook) {
  console.log(hook.params); // eslint-disable-line no-console
}