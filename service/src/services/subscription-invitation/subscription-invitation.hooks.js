
let axios = require("axios")
let errors = require('@feathersjs/errors');
module.exports = {
  before: {
    all: [],
    find: [
      hook => before_find (hook)
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


async function before_find(hook) {
  let res = await validateUser(hook);
  console.log(res)
  if (res.code == 401) {
    throw new errors.NotAuthenticated('Invalid token');
  } else {
    if(hook.params.query.own == 'false'){
      delete hook.params.query.own
      hook.params.query.toEmail = res.data.data.email;
    }
    
    if (!hook.params.query.isDeleted) {
      hook.params.query.isDeleted = false;
    } else {
      if (hook.params.query.isDeleted == 'true') {
        hook.params.query.isDeleted = true
      }
      if (hook.params.query.isDeleted == 'false') {
        hook.params.query.isDeleted = false
      }
    }
  } 
  
}

async function validateUser(data) {
  console.log(apiHeaders.authorization)
  
  return new Promise((resolve, reject) => {
    axios.get("http://api." + process.env.domainKey +'/auth/api/userdetails', {
      strictSSL: false,
      headers: {
        "Authorization": apiHeaders.authorization
      }
    })
      .then(function (response) {
        // console.log(response)
        resolve(response)
      })
      .catch(function (error) {
        console.log("%%%%%%%%%%%%", error)
        resolve({ "code": 401 })
      });
  })
}


function before_patch(hook) {
  hook.data.unassignDate = new Date(); 
}

function after_find(hook) {
  console.log(hook.params) 
}