let errors = require('@feathersjs/errors');

module.exports = {
  before: {
    all: [],
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
    get: [
      hook => getAgain(hook)
    ],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

function getAgain(hook) {
  if(hook.id) {
    hook.params.query.subscriptionId = hook.id;
    const query = Object.assign({
    }, hook.params.query);
    return hook.app.service('reverse-subscription').find({ query }).then(response => {
      if (response.data.length === 1) {
        hook.result = response.data[0];
      } else {
        throw new errors.NotFound();
      }
      return hook;
    }).catch(err => { //eslint-disable-line no-unused-vars
      throw new errors.NotFound();
    });
  }
}